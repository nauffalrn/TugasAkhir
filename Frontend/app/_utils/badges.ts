// Daftarkan semua aset badge secara statis di sini.
// Kuncinya harus sama persis dengan 'icon_key' di tabel badge_defs Anda.
const badgeAssets: Record<string, any> = {
  // Pengukuran Sudut
  "pengukuran-sudut-level-1": require("../../assets/badges/pengukuran-sudut-level-1.png"),
  "pengukuran-sudut-level-2": require("../../assets/badges/pengukuran-sudut-level-2.png"),
  "pengukuran-sudut-level-3": require("../../assets/badges/pengukuran-sudut-level-3.png"),
  "pengukuran-sudut-level-4": require("../../assets/badges/pengukuran-sudut-level-4.png"),

  // Ciri-ciri Bangun Datar
  "ciri-ciri-bangun-datar-level-1": require("../../assets/badges/ciri-ciri-bangun-datar-level-1.png"),
  "ciri-ciri-bangun-datar-level-2": require("../../assets/badges/ciri-ciri-bangun-datar-level-2.png"),
  "ciri-ciri-bangun-datar-level-3": require("../../assets/badges/ciri-ciri-bangun-datar-level-3.png"),
  "ciri-ciri-bangun-datar-level-4": require("../../assets/badges/ciri-ciri-bangun-datar-level-4.png"),

  // Data
  "data-level-1": require("../../assets/badges/data-level-1.png"),
  "data-level-2": require("../../assets/badges/data-level-2.png"),
  "data-level-3": require("../../assets/badges/data-level-3.png"),
  "data-level-4": require("../../assets/badges/data-level-4.png"),

  // Bilangan Cacah sampai 1.000.000
  "bilangan-cacah-sampai-1.000.000-level-1": require("../../assets/badges/bilangan-cacah-sampai-1.000.000-level-1.png"),
  "bilangan-cacah-sampai-1.000.000-level-2": require("../../assets/badges/bilangan-cacah-sampai-1.000.000-level-2.png"),
  "bilangan-cacah-sampai-1.000.000-level-3": require("../../assets/badges/bilangan-cacah-sampai-1.000.000-level-3.png"),
  "bilangan-cacah-sampai-1.000.000-level-4": require("../../assets/badges/bilangan-cacah-sampai-1.000.000-level-4.png"),
};

/**
 * Mengambil aset gambar badge yang sudah terdaftar secara statis.
 * @param iconKey - Kunci ikon yang disimpan di tabel badge_defs.
 * @returns Aset gambar yang sesuai atau null jika tidak ditemukan.
 */
export function getBadgeImage(iconKey: string) {
  const asset = badgeAssets[iconKey];
  if (!asset) {
    console.warn(
      `Badge image not found for key: ${iconKey}. Pastikan sudah terdaftar di badges.ts`,
    );
    return null; // atau kembalikan gambar placeholder
  }
  return asset;
}
