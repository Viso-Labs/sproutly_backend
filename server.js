// Install: express, sharp, axios, jsonwebtoken (for signed IDs)

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

    const avatarUrl =
      `https://pbs.twimg.com/profile_images/${userid}/WiBev5T4_400x400.jpg`;

    // Fetch avatar image
    const avatarResponse = await axios.get(avatarUrl, {
      responseType: "arraybuffer",
    });
    const avatarBuffer = Buffer.from(avatarResponse.data, "binary");

    // Load base template
    const baseImage = sharp(baseTemplatePath);

    // Resize and mask avatar to circle ~ 128px
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
          // padding can be controlled by positioning if needed
          top: null,
          left: null,
          // offset padding example (20px)
          gravity: "southeast",
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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
