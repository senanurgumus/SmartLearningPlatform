
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

const serviceAccount = require("./serviceAccountKey.json"); // kendi dosya adını buraya yaz!

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'smart-learning-platform-eb7e5.firebasestorage.app'
 // Firebase Storage bucket adı
});

const bucket = admin.storage().bucket();
const firestore = admin.firestore();

const folderPath = path.join(__dirname, "output_pieces");

async function uploadFiles() {
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".png"));
  const uploadedUrls = [];

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const destination = `puzzles/cat/${file}`; // Burada puzzle için ilgili dosya yolunu belirtiyoruz
    const mimeType = mime.lookup(filePath);

    await bucket.upload(filePath, {
      destination,
      metadata: {
        contentType: mimeType
      }
    });

    const fileRef = bucket.file(destination);
    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: "03-01-2030" // Linkin geçerlilik süresi
    });

    uploadedUrls.push(url);
    console.log(`✅ Yüklendi: ${file} -> ${url}`);
  }

  // Firestore'a metadata kaydet
  await firestore.collection("puzzles").add({
    title: "Uyuyan Kedi", // Puzzle başlığı, bunu dinamik hale getirebilirsin
    difficulty: "hard", // Zorluk seviyesi, bunu dinamik yapabilirsin
    gridSize: 3, // Grid boyutu, buradaki ayarı zorluk seviyesine göre değiştirebilirsin
    pieces: uploadedUrls // Firebase Storage'a yüklediğimiz dosya URL'leri
  });

  console.log("🎉 Puzzle metadata Firestore'a kaydedildi.");
}

uploadFiles().catch(console.error);
