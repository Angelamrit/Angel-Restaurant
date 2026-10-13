import { copyFile, readdir, readFile, mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDir = path.join(process.cwd(), "public", "angel");
const outputDir = path.join(process.cwd(), "public", "angel-vps");
const certificateSourceDir = path.join(process.cwd(), "public", "Certificates");
const certificateOutputDir = path.join(outputDir, "certificates");

await mkdir(outputDir, { recursive: true });
await mkdir(certificateOutputDir, { recursive: true });

const names = (await readdir(sourceDir)).filter((name) => name.toLowerCase().endsWith(".webp"));
let sourceBytes = 0;
let outputBytes = 0;

for (const name of names) {
  const source = path.join(sourceDir, name);
  const output = path.join(outputDir, `${path.parse(name).name}.avif`);
  const sourceSize = (await stat(source)).size;

  await sharp(source)
    .avif({ quality: 48, effort: 6 })
    .toFile(output);

  const outputSize = (await stat(output)).size;
  sourceBytes += sourceSize;
  outputBytes += outputSize;
  console.log(`${name}: ${Math.round(sourceSize / 1024)} KB -> ${Math.round(outputSize / 1024)} KB`);
}

// Keep the older menu image URLs working while browser/CDN and Next data
// caches age out after menu dishes have been moved to their canonical names.
for (const name of ["chole-bhatura", "chicken-dum-biryani", "goat-dum-biryani", "vegetable-dum-biryani"]) {
  await copyFile(path.join(outputDir, `${name}.avif`), path.join(outputDir, `${name}-v2.avif`));
}

console.log(
  `Total: ${Math.round(sourceBytes / 1024)} KB -> ${Math.round(outputBytes / 1024)} KB ` +
    `(${((1 - outputBytes / sourceBytes) * 100).toFixed(1)}% smaller; ${names.length} images)`
);

// Keep certificate text crisp at display sizes; the original files remain
// available for the full-size links on the press page.
for (const name of ["Certificate01.jpeg", "Certificate02.jpeg", "Certificate03.PNG"]) {
  const source = path.join(certificateSourceDir, name);
  const output = path.join(certificateOutputDir, `${path.parse(name).name}.avif`);
  await sharp(source).avif({ quality: 72, effort: 6 }).toFile(output);
  const sourceSize = (await stat(source)).size;
  const outputSize = (await stat(output)).size;
  console.log(`Certificates/${name}: ${Math.round(sourceSize / 1024)} KB -> ${Math.round(outputSize / 1024)} KB`);
}

// The supplied logo SVG only wraps a 2068px transparent PNG, so decode that PNG,
// trim its empty edges and keep a small master for next/image to resize.
const logoSource = path.join(process.cwd(), "public", "Logo", "Angel_Logo_Transparent_Detailed.svg");
const logoOutput = path.join(outputDir, "angel-logo.avif");
const logoPng = Buffer.from((await readFile(logoSource, "utf8")).match(/base64,([^"]+)"/)[1], "base64");
await sharp(logoPng).trim().resize({ width: 768 }).avif({ quality: 72, effort: 6 }).toFile(logoOutput);
console.log(`Logo/${path.basename(logoSource)}: ${Math.round((await stat(logoSource)).size / 1024)} KB -> ${Math.round((await stat(logoOutput)).size / 1024)} KB`);

// Icons show the full gold wordmark. It is wide, so it spans the square's width.
const wordmark = await sharp(logoPng).trim().png().toBuffer();
// Tab icons (favicon.ico, icon.png): the word alone on a transparent square, so
// no dark box shrinks it, with a soft espresso edge so the pale gold still reads
// on light tab strips. At 16-48px the bevel shading turns muddy, so those sizes
// are sharpened and slightly brightened.
const tabIcon = async (size) => {
  let glyph = sharp(wordmark).resize({ width: size, height: size, fit: "inside" });
  if (size <= 48) glyph = glyph.sharpen({ sigma: 0.5, m1: 1, m2: 2 }).linear(1.12, -8).modulate({ saturation: 1.15 });
  const word = await glyph.png().toBuffer();
  const { width, height } = await sharp(word).metadata();
  const edgeAlpha = await sharp(word).extractChannel(3).blur(Math.max(0.6, size / 100)).linear(3, 0).toBuffer();
  const edge = await sharp({ create: { width, height, channels: 3, background: "#25130D" } }).joinChannel(edgeAlpha).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: edge, gravity: "centre" }, { input: word, gravity: "centre" }]).png({ compressionLevel: 9 }).toBuffer();
};
// iOS fills transparency with black, so the home-screen icon keeps the espresso square.
const appleIcon = async (size, padding) => {
  const glyph = await sharp(wordmark).resize({ width: Math.round(size * (1 - 2 * padding)) }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 3, background: "#25130D" } }).composite([{ input: glyph, gravity: "centre" }]).png().toBuffer();
};
// A 256-colour palette keeps the gold gradient clean at a third of the bytes.
const paletted = async (png) => sharp(png).png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 }).toBuffer();
const appDir = path.join(process.cwd(), "app");
await writeFile(path.join(appDir, "icon.png"), await paletted(await tabIcon(512)));
await writeFile(path.join(appDir, "apple-icon.png"), await paletted(await appleIcon(180, 0.08)));
// favicon.ico for clients that ask for /favicon.ico directly: PNG-compressed 16/32/48px entries.
const faviconSizes = [16, 32, 48];
const favicons = await Promise.all(faviconSizes.map(tabIcon));
const icoHeader = Buffer.alloc(6 + favicons.length * 16);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(favicons.length, 4);
let icoOffset = icoHeader.length;
favicons.forEach((png, index) => {
  const entry = 6 + index * 16;
  icoHeader[entry] = icoHeader[entry + 1] = faviconSizes[index];
  icoHeader.writeUInt16LE(1, entry + 4);
  icoHeader.writeUInt16LE(32, entry + 6);
  icoHeader.writeUInt32LE(png.length, entry + 8);
  icoHeader.writeUInt32LE(icoOffset, entry + 12);
  icoOffset += png.length;
});
await writeFile(path.join(appDir, "favicon.ico"), Buffer.concat([icoHeader, ...favicons]));
console.log("Icons: app/icon.png, app/apple-icon.png, app/favicon.ico");
