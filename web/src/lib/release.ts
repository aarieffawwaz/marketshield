"use client";

import { useEffect, useState } from "react";
import { APK, REPO } from "@/lib/data";

type Asset = { url: string; size: string; sha: string };
export type Release = { version: string; arm64: Asset; armv7: Asset; page: string };

const mb = (b: number) => (b / 1048576).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " MB";

const FALLBACK: Release = {
  version: APK.version,
  arm64: { url: APK.file, size: APK.size, sha: APK.sha.arm64 },
  armv7: { url: APK.fileLegacy, size: APK.sizeLegacy, sha: APK.sha.armv7 },
  page: `https://github.com/${REPO}/releases/latest`,
};

type GhAsset = { name: string; size: number; browser_download_url: string; digest?: string | null };

/** Latest APK release from GitHub, so a new tag updates the download page without a code change */
export function useLatestRelease(): Release {
  const [rel, setRel] = useState(FALLBACK);
  useEffect(() => {
    const ctl = new AbortController();
    fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { signal: ctl.signal, headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { tag_name: string; html_url: string; assets: GhAsset[] } | null) => {
        if (!j) return;
        const pick = (suffix: string, fb: Asset): Asset => {
          const a = j.assets.find((x) => x.name.endsWith(suffix));
          return a ? { url: a.browser_download_url, size: mb(a.size), sha: a.digest?.replace(/^sha256:/, "") ?? fb.sha } : fb;
        };
        setRel({ version: j.tag_name.replace(/^v/, ""), arm64: pick("arm64.apk", FALLBACK.arm64), armv7: pick("armv7.apk", FALLBACK.armv7), page: j.html_url });
      })
      .catch(() => {});
    return () => ctl.abort();
  }, []);
  return rel;
}
