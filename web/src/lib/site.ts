import type { BrandName } from "@/components/ui/brand-icons";

/**
 * Public channels. `href: null` = account not claimed yet; rendered as a
 * non-link "segera" chip so we never point people at someone else's profile.
 */
export const SOCIALS: { name: BrandName; label: string; handle: string; href: string | null }[] = [
  { name: "instagram", label: "Instagram", handle: "@marketshield.id", href: null },
  { name: "tiktok", label: "TikTok", handle: "@marketshield.id", href: null },
  { name: "x", label: "X", handle: "@marketshield_id", href: null },
  { name: "youtube", label: "YouTube", handle: "MarketShield", href: null },
  { name: "linkedin", label: "LinkedIn", handle: "MarketShield", href: null },
  { name: "whatsapp", label: "WhatsApp Channel", handle: "MarketShield Siaga", href: null },
  { name: "github", label: "GitHub", handle: "aarieffawwaz/marketshield", href: "https://github.com/aarieffawwaz/marketshield" },
];

export const STORES = {
  appStore: { live: false, href: null as string | null },
  playStore: { live: false, href: null as string | null },
};
