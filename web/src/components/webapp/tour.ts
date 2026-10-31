"use client";

import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

type T = (id: string, en: string) => string;

const KEY = "ms-tour-console-v1";

export const tourSeen = () => {
  try {
    return localStorage.getItem(KEY) === "done";
  } catch {
    return true;
  }
};

const markSeen = () => {
  try {
    localStorage.setItem(KEY, "done");
  } catch {}
};

/** Steps only include elements that are actually on screen (sidebar is hidden on small screens) */
function visible(steps: DriveStep[]) {
  return steps.filter((s) => {
    if (!s.element || typeof s.element !== "string") return true;
    const el = document.querySelector(s.element) as HTMLElement | null;
    return !!el && el.offsetParent !== null;
  });
}

export function startConsoleTour(tab: string, t: T) {
  const overview: DriveStep[] = [
    { popover: { title: t("Selamat datang di console", "Welcome to the console"), description: t("Tur singkat 60 detik: dari status satelit sampai menyiarkan peringatan. Bisa diulang kapan saja lewat tombol ?.", "A 60-second tour: from satellite status to broadcasting alerts. Replay any time with the ? button.") } },
    { element: '[data-tour="status"]', popover: { title: t("Status gunung saat ini", "Current volcano status"), description: t("Level resmi PVMBG dan peluang naik level 7 hari dari prakiraan satelit.", "Official PVMBG level and the 7-day escalation odds from the satellite forecast."), side: "right" } },
    { element: '[data-tour="actions"]', popover: { title: t("Mulai dari sini setiap shift", "Start here every shift"), description: t("Tindakan disarankan diurutkan dari dampak terbesar. Klik untuk langsung ke menu terkait.", "Suggested actions ordered by impact. Click to jump straight to the right screen.") } },
    { element: '[data-tour="nav"]', popover: { title: t("Pantau · Tindak · Verifikasi", "Monitor · Act · Verify"), description: t("Peta bahaya, prioritas bantuan, posko, siaran, filter hoaks, dan pantau harga.", "Hazard map, aid priority, posts, broadcasts, hoax filter and price watch."), side: "right" } },
    { element: '[data-tour="level"]', popover: { title: t("Ubah level untuk latihan", "Switch levels to rehearse"), description: t("Lihat bagaimana seluruh console dan aplikasi warga menyesuaikan diri di tiap level.", "See how the console and the resident app adapt at every level."), side: "bottom" } },
    { element: '[data-tour="search"]', popover: { title: t("Cari & lompat (⌘K)", "Search & jump (⌘K)"), description: t("Buka halaman atau jalankan perintah tanpa mouse.", "Open pages or run commands without the mouse."), side: "bottom" } },
    { element: '[data-tour="notif"]', popover: { title: t("Notifikasi", "Notifications"), description: t("Anomali satelit, hoaks, harga dan status posko terbaru.", "Latest satellite anomalies, hoaxes, prices and post status."), side: "bottom" } },
    { element: '[data-tour="user"]', popover: { title: t("Akun & peran", "Account & role"), description: t("Ganti peran (BPBD, posko, donatur), buka aplikasi warga, atau keluar.", "Switch role (BPBD, post, donor), open the resident app, or sign out."), side: "bottom" } },
    { element: '[data-tour="help"]', popover: { title: t("Butuh bantuan lagi?", "Need help again?"), description: t("Klik ? kapan saja untuk memutar ulang tur halaman ini.", "Click ? any time to replay this page's tour."), side: "bottom" } },
  ];
  const map: DriveStep[] = [
    { element: '[data-tour="map-views"]', popover: { title: t("Tiga cara melihat", "Three ways to look"), description: t("Satelit 3D (citra & medan asli), model 3D, atau peta 2D.", "Satellite 3D (real imagery & terrain), 3D model, or a 2D map."), side: "bottom" } },
    { element: '[data-tour="sim"]', popover: { title: t("Simulasi erupsi", "Eruption simulation"), description: t("Putar skenario T−3 hari sampai T+3 hari: awan panas, sebaran abu, AQI per kota, dan dampak peringatan dini.", "Play a T−3 to T+3 day scenario: pyroclastic flows, ash drift, city AQI and the effect of early warning."), side: "bottom" } },
    { element: '.maplibregl-canvas', popover: { title: t("Jelajahi peta", "Explore the map"), description: t("Seret untuk menggeser, klik kanan + seret untuk memiringkan, klik titik gunung untuk terbang ke sana.", "Drag to pan, right-click + drag to tilt, click a volcano dot to fly there.") } },
  ];
  const steps = visible(tab === "map" ? map : overview);
  const d = driver({
    showProgress: true,
    allowClose: true,
    overlayOpacity: 0.55,
    stagePadding: 6,
    stageRadius: 14,
    popoverClass: "ms-tour",
    nextBtnText: t("Lanjut", "Next"),
    prevBtnText: t("Kembali", "Back"),
    doneBtnText: t("Selesai", "Done"),
    progressText: "{{current}} / {{total}}",
    steps,
    onDestroyed: markSeen,
  });
  d.drive();
}
