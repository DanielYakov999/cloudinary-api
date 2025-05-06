const express = require("express");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🎉 Cloudinary Signature API עובד!");
});

app.post("/get-signature", (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "uploads";

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

app.listen(port, () => {
  console.log(`API פועל על פורט ${port}`);
});