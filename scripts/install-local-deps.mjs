import { execSync } from "node:child_process";
import { existsSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const libsDir = join(root, "local_libs");
if (!existsSync(libsDir)) {
  mkdirSync(libsDir);
}

const mappings = [
  { pkg: "tailwind-merge", version: "2.5.2", pattern: "tailwind-merge-2.5.2" },
  { pkg: "tailwindcss-animate", version: "1.0.7", pattern: "tailwindcss-animate-1.0.7" },
  { pkg: "class-variance-authority", version: "0.7.0", pattern: "class-variance-authority-0.7.0" },
  { pkg: "@radix-ui/react-slot", version: "1.0.2", pattern: "react-slot-1.0.2" },
];

console.log(`Place tarballs into ${libsDir}`);

for (const { pkg, pattern } of mappings) {
  const tarball = readdirSync(libsDir).find((file) => file.includes(pattern));
  if (!tarball) {
    console.log(`[missing] ${pkg}`);
    continue;
  }
  const relativePath = join("./local_libs", tarball);
  console.log(`Installing ${relativePath}`);
  execSync(`npm install --prefer-offline ${relativePath}`,
    { stdio: "inherit", cwd: root });
}
