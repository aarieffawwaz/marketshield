// Shared geometry for the 3D scenes: a stylised Semeru height field and monitored volcanoes.

export function volcanoHeight(x: number, z: number) {
  const r = Math.hypot(x, z);
  const a = Math.atan2(z, x);
  const cone = 5.2 * Math.exp(-Math.pow(r / 4.2, 1.35));
  const crater = -1.1 * Math.exp(-Math.pow(r / 0.55, 2));
  const ridges = 0.18 * Math.sin(a * 9 + r * 0.8) * Math.exp(-r / 6) * Math.min(1, r / 1.2);
  const hills = 0.35 * Math.sin(x * 0.55 + 1.3) * Math.cos(z * 0.47) * (1 - Math.exp(-r / 5));
  return cone + crater + ridges + hills;
}

// Approximate summit coordinates (lat, lon) of well-known monitored volcanoes
export const VOLCANOES: { name: string; lat: number; lon: number }[] = [
  { name: "Semeru", lat: -8.108, lon: 112.922 },
  { name: "Merapi", lat: -7.54, lon: 110.446 },
  { name: "Bromo", lat: -7.942, lon: 112.95 },
  { name: "Kelud", lat: -7.93, lon: 112.308 },
  { name: "Raung", lat: -8.125, lon: 114.042 },
  { name: "Ijen", lat: -8.058, lon: 114.242 },
  { name: "Slamet", lat: -7.242, lon: 109.208 },
  { name: "Agung", lat: -8.343, lon: 115.508 },
  { name: "Batur", lat: -8.242, lon: 115.375 },
  { name: "Rinjani", lat: -8.42, lon: 116.47 },
  { name: "Tambora", lat: -8.25, lon: 118.0 },
  { name: "Lewotobi", lat: -8.542, lon: 122.775 },
  { name: "Anak Krakatau", lat: -6.102, lon: 105.423 },
  { name: "Sinabung", lat: 3.17, lon: 98.392 },
  { name: "Marapi", lat: -0.381, lon: 100.473 },
  { name: "Kerinci", lat: -1.697, lon: 101.264 },
  { name: "Dempo", lat: -4.03, lon: 103.13 },
  { name: "Lokon", lat: 1.358, lon: 124.792 },
  { name: "Soputan", lat: 1.108, lon: 124.73 },
  { name: "Karangetang", lat: 2.78, lon: 125.4 },
  { name: "Ruang", lat: 2.3, lon: 125.37 },
  { name: "Ibu", lat: 1.488, lon: 127.63 },
  { name: "Dukono", lat: 1.693, lon: 127.894 },
  { name: "Gamalama", lat: 0.8, lon: 127.33 },
  { name: "Banda Api", lat: -4.525, lon: 129.871 },
];
