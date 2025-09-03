// Install: express, sharp, axios, jsonwebtoken (for signed IDs)
require("dotenv").config();

const express = require("express");
const sharp = require("sharp");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const app = express();
const SECRET = "YOUR_SECRET_KEY"; // Use a secure key for signing

// Dummy base template path
// Function to generate and sign ID


app.get("/og/u/:signedId.png", async (req, res) => {
  const { signedId } = req.params;

  try {
    let parts = signedId.split("_");
    const userid = parts[0];
    const imageid = parts[1];

    const baseTemplatePath = path.join(__dirname, `/image/soulbond${imageid}.jpg`);

    const userTwitterToken =
      "AAAAAAAAAAAAAAAAAAAAAPHH3wEAAAAAAvyFKPSHTV5OcyP52oRf%2BaOrigQ%3DIe8xBhVcXopPZXVkC5xymkjUksZahfCrISXhw31EVTSeqzNCGR";

    let userResponse;
    try {
      userResponse = await axios.get(`https://api.x.com/2/users?user.fields=profile_image_url&ids=${userid}`, {
        headers: { Authorization: `Bearer AAAAAAAAAAAAAAAAAAAAAJYt3wEAAAAATs%2BkSXmYPU%2B038cSrwTK904p1sw%3DGn31flGx8aZ2HDIEnRkha7M2t7Ah5dE1EFI2NLXBGysgHz05zQ` },
      });
    } catch (error) {
      if (error.response && error.response.status === 429) {
        const retryAfter = error.response.headers["retry-after"] || 60; // fallback 60 seconds
        return res.status(429).send(`Rate limited by Twitter API. Please try again after ${retryAfter} seconds.`);
      } else {
        throw error;
      }
    }

    const avatarUrl = userResponse.data.data.profile_image_url.replace("_normal", "_400x400");

    // Fetch avatar image
    const avatarResponse = await axios.get(avatarUrl, { responseType: "arraybuffer" });
    const avatarBuffer = Buffer.from(avatarResponse.data, "binary");

    // Load base template
    const baseImage = sharp(baseTemplatePath);

    // Resize and mask avatar to circle ~ 220px
    const circleAvatar = await sharp(avatarBuffer)
      .resize(220, 220)
      .composite([
        {
          input: Buffer.from(`<svg><circle cx="110" cy="110" r="110"/></svg>`),
          blend: "dest-in",
        },
      ])
      .png()
      .toBuffer();

    // Composite avatar (bottom-right with padding)
    const outputBuffer = await baseImage
      .composite([
        {
          input: circleAvatar,
          gravity: "southeast",
          blend: "over",
          top: 735,
          left: 110,
        },
      ])
      .png()
      .toBuffer();

    // Cache control headers for immutable content
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.type("png").send(outputBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating image");
  }
});
app.get("/", (req, res) => {
  res.status(200).send("API is running.");
});
const PORT = process.env.PORT || 5008;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
