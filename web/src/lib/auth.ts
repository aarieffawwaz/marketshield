"use client";

import { GoogleAuthProvider, getAuth, signInWithEmailAndPassword, signInWithPopup, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { firebaseApp, firestore } from "./live";
import type { Role, Session } from "./store";

const TITLES: Record<Role, { id: string; en: string }> = {
  bpbd: { id: "Operator Pusdalops", en: "Operations officer" },
  posko: { id: "Koordinator posko", en: "Aid post coordinator" },
  donor: { id: "Donatur & distributor", en: "Donor & distributor" },
};

const initialsOf = (name: string) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

/** Builds the console session from a Firebase user. Without an operator role claim the session is live but view-only. */
async function toSession(user: User): Promise<Session> {
  const raw = String((await user.getIdTokenResult(true)).claims.role ?? "");
  const email = user.email ?? "";
  if (!["admin", "bpbd", "posko", "donor"].includes(raw)) {
    const name = user.displayName ?? email.split("@")[0] ?? "Tamu";
    return { name, initials: initialsOf(name), role: "bpbd", title: { id: "Akses lihat saja", en: "View-only access" }, org: email, email, mode: "live" };
  }
  const role: Role = raw === "admin" ? "bpbd" : (raw as Role);
  const p = (await getDoc(doc(firestore(), "users", user.uid)).catch(() => null))?.data() ?? {};
  const name: string = p.name ?? user.displayName ?? email ?? "Operator";
  return { name, initials: initialsOf(name), role, title: p.title ?? TITLES[role], org: p.org ?? "", email, uid: user.uid, admin: raw === "admin", mode: "live" };
}

/** Email/password operator sign-in. Role comes from the custom claim set by scripts/set-role.ts. */
export async function operatorSignIn(email: string, password: string): Promise<Session> {
  const auth = getAuth(firebaseApp());
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const s = await toSession(cred.user);
  if (!s.uid) {
    await signOut(auth);
    throw Object.assign(new Error("no-role"), { code: "ms/no-role" });
  }
  return s;
}

/** Google sign-in: operators get their role; everyone else gets a live, view-only session. */
export async function googleSignIn(): Promise<Session> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(getAuth(firebaseApp()), provider);
  return toSession(cred.user);
}

export const operatorSignOut = () => signOut(getAuth(firebaseApp())).catch(() => {});

export const authErrorText = (code: string, t: (id: string, en: string) => string) =>
  code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found"
    ? t("Email atau kata sandi salah.", "Wrong email or password.")
    : code === "auth/too-many-requests"
      ? t("Terlalu banyak percobaan. Coba lagi beberapa menit lagi.", "Too many attempts. Try again in a few minutes.")
      : code === "ms/no-role"
        ? t("Akun ini belum punya peran operator. Hubungi admin.", "This account has no operator role yet. Contact an admin.")
        : code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request"
          ? t("Jendela Google ditutup sebelum selesai.", "The Google window was closed before finishing.")
          : code === "auth/popup-blocked"
            ? t("Popup diblokir browser. Izinkan popup lalu coba lagi.", "Your browser blocked the popup. Allow popups and try again.")
        : code === "auth/network-request-failed"
          ? t("Tidak ada koneksi. Coba lagi atau pakai mode demo.", "No connection. Try again or use demo mode.")
          : t("Gagal masuk. Coba lagi.", "Sign-in failed. Try again.");
