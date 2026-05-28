import sharp from "sharp";
import fs from "node:fs";
const svg = fs.readFileSync("./public/icon.svg");
const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "favicon-32.png", size: 32 },
];
for (const { name, size } of sizes) {
  await sharp(svg, { density: 300 }).resize(size, size).png().toFile(`./public/${name}`);
  console.log("written:", name);
}
