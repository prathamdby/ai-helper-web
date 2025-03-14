const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(process.cwd(), "public/icons");

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const svgPath = path.join(iconsDir, "icon.svg");
console.log("Reading SVG from:", svgPath);

try {
  const svgContent = fs.readFileSync(svgPath);
  console.log("Successfully read SVG file");

  // Replace currentColor with a specific color if needed
  const coloredSvg = svgContent.toString().replace(/currentColor/g, "#000000");

  async function generateIcons() {
    try {
      for (const size of sizes) {
        const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
        console.log(`Generating ${size}x${size} icon at:`, outputPath);

        await sharp(Buffer.from(coloredSvg))
          .resize(size, size)
          .png()
          .toFile(outputPath);

        console.log(`Generated ${size}x${size} icon successfully`);
      }
      console.log("All icons generated successfully!");
    } catch (error) {
      console.error("Error generating icons:", error);
      process.exit(1);
    }
  }

  generateIcons();
} catch (error) {
  console.error("Error reading SVG file:", error);
  process.exit(1);
}
