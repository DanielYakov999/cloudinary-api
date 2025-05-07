const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🎉 Cloudinary Signature API עובד!");
});

// 🔐 יצירת חתימה להעלאת תמונה
app.post("/get-signature", (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const context = req.body.context || "general";
  const folder = `uploads/${context}`;

  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_SECRET}`;
  const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

  res.json({
    timestamp,
    folder,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
});

// 🗑️ מחיקת תמונה לפי publicId
app.post("/delete-image", async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) {
    return res.status(400).json({ error: "Missing publicId" });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(`public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_SECRET}`)
    .digest("hex");

  try {
    const result = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        public_id: publicId,
        api_key: process.env.CLOUDINARY_API_KEY,
        timestamp,
        signature,
      }
    );
    res.json(result.data);
  } catch (error) {
    console.error("שגיאה במחיקת תמונה:", error.response?.data || error);
    res.status(500).json({ error: "שגיאה במחיקת תמונה" });
  }
});

app.listen(port, () => {
  console.log(`✅ API פועל על פורט ${port}`);
});
