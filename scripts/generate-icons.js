const sharp = require("sharp");
const path = require("path");

const ASSETS = path.join(__dirname, "..", "assets");
const SOURCE = path.join(ASSETS, "logo.png");

// icon.png: 1024x1024 (App Store / Play Store)
// adaptive-icon.png: 1024x1024 (foreground Android adaptive)
// Margem 10% em cada lateral → logo ocupa 80% do canvas

async function generateIcon(outputFile, size) {
  const margin = Math.round(size * 0.1);
  const logoSize = size - margin * 2; // 80% do canvas

  const logoBuffer = await sharp(SOURCE)
    .resize(logoSize, logoSize, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: logoBuffer, gravity: "centre" }])
    .png()
    .toFile(outputFile);

  console.log(`✔ ${path.basename(outputFile)} (${size}x${size})`);
}

(async () => {
  await generateIcon(path.join(ASSETS, "icon.png"), 1024);
  await generateIcon(path.join(ASSETS, "adaptive-icon.png"), 1024);
  console.log("Ícones gerados com sucesso.");
})();
