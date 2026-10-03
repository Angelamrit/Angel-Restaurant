import { copyFile, readdir, mkdir, stat } from "node:fs/promises";
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
