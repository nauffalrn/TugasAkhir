const badgeAssets: Record<string, any> = {
  // Penjumlahan dan Pengurangan Pecahan
  "penjumlahan-dan-pengurangan-pecahan-level-1": require("../../assets/badges/penjumlahan-dan-pengurangan-pecahan-level-1.png"),
  "penjumlahan-dan-pengurangan-pecahan-level-2": require("../../assets/badges/penjumlahan-dan-pengurangan-pecahan-level-2.png"),
  "penjumlahan-dan-pengurangan-pecahan-level-3": require("../../assets/badges/penjumlahan-dan-pengurangan-pecahan-level-3.png"),
  "penjumlahan-dan-pengurangan-pecahan-level-4": require("../../assets/badges/penjumlahan-dan-pengurangan-pecahan-level-4.png"),

  // Perkalian dan Pembagian Pecahan
  "perkalian-dan-pembagian-pecahan-level-1": require("../../assets/badges/perkalian-dan-pembagian-pecahan-level-1.png"),
  "perkalian-dan-pembagian-pecahan-level-2": require("../../assets/badges/perkalian-dan-pembagian-pecahan-level-2.png"),
  "perkalian-dan-pembagian-pecahan-level-3": require("../../assets/badges/perkalian-dan-pembagian-pecahan-level-3.png"),
  "perkalian-dan-pembagian-pecahan-level-4": require("../../assets/badges/perkalian-dan-pembagian-pecahan-level-4.png"),

  // Luas Bangun Datar
  "luas-bangun-datar-level-1": require("../../assets/badges/luas-bangun-datar-level-1.png"),
  "luas-bangun-datar-level-2": require("../../assets/badges/luas-bangun-datar-level-2.png"),
  "luas-bangun-datar-level-3": require("../../assets/badges/luas-bangun-datar-level-3.png"),
  "luas-bangun-datar-level-4": require("../../assets/badges/luas-bangun-datar-level-4.png"),

  // Perbandingan
  "perbandingan-level-1": require("../../assets/badges/perbandingan-level-1.png"),
  "perbandingan-level-2": require("../../assets/badges/perbandingan-level-2.png"),
  "perbandingan-level-3": require("../../assets/badges/perbandingan-level-3.png"),
  "perbandingan-level-4": require("../../assets/badges/perbandingan-level-4.png"),

  // Segi Banyak Beraturan dan Lingkaran
  "segi-banyak-beraturan-dan-lingkaran-level-1": require("../../assets/badges/segi-banyak-beraturan-dan-lingkaran-level-1.png"),
  "segi-banyak-beraturan-dan-lingkaran-level-2": require("../../assets/badges/segi-banyak-beraturan-dan-lingkaran-level-2.png"),
  "segi-banyak-beraturan-dan-lingkaran-level-3": require("../../assets/badges/segi-banyak-beraturan-dan-lingkaran-level-3.png"),
  "segi-banyak-beraturan-dan-lingkaran-level-4": require("../../assets/badges/segi-banyak-beraturan-dan-lingkaran-level-4.png"),

  // Bangun Ruang
  "bangun-ruang-level-1": require("../../assets/badges/bangun-ruang-level-1.png"),
  "bangun-ruang-level-2": require("../../assets/badges/bangun-ruang-level-2.png"),
  "bangun-ruang-level-3": require("../../assets/badges/bangun-ruang-level-3.png"),
  "bangun-ruang-level-4": require("../../assets/badges/bangun-ruang-level-4.png"),

  // Rasio dan Diagram
  "rasio-dan-diagram-level-1": require("../../assets/badges/rasio-dan-diagram-level-1.png"),
  "rasio-dan-diagram-level-2": require("../../assets/badges/rasio-dan-diagram-level-2.png"),
  "rasio-dan-diagram-level-3": require("../../assets/badges/rasio-dan-diagram-level-3.png"),
  "rasio-dan-diagram-level-4": require("../../assets/badges/rasio-dan-diagram-level-4.png"),
};

export function getBadgeImage(iconKey: string) {
  const badge = badgeAssets[iconKey];
  if (!badge) {
    console.warn(`Badge not found: ${iconKey}`);
    // Fallback ke badge pertama atau undefined
    return badgeAssets["bangun-ruang-level-1"]; // atau return undefined
  }
  return badge;
}

export function getBadgeList() {
  return Object.keys(badgeAssets);
}
