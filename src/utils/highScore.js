// src/utils/highScore.js

/**
 * Kullanıcının o ana kadar kaydettiği en yüksek skoru getirir.
 * @param {string} key – oyunun benzersiz ID'si, örn. "shapeDrag"
 * @returns {Promise<number>}
 */
export async function fetchHighScore(key) {
  const stored = localStorage.getItem(key);
  return stored ? parseInt(stored, 10) : 0;
}

/**
 * Yeni skoru kaydeder (sadece eğer mevcut yüksek skordan yüksekse)
 * @param {string} key – oyunun ID'si
 * @param {number} newScore – şu anki skor
 * @returns {Promise<number>} – kaydedilen (güncellenmiş veya mevcut) yüksek skor
 */
export async function updateHighScore(key, newScore) {
  const current = parseInt(localStorage.getItem(key), 10) || 0;
  if (newScore > current) {
    localStorage.setItem(key, newScore);
    return newScore;
  }
  return current;
}
