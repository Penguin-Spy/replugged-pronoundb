import asar from "@electron/asar";
import { readFileSync, copyFileSync, existsSync, mkdirSync } from 'fs';

const manifest = JSON.parse(readFileSync("manifest.json", "utf-8"));

if(!existsSync("bundle")) mkdirSync("bundle")

asar.createPackage("dist", `bundle/${manifest.id}.asar`);
copyFileSync("dist/manifest.json", `bundle/${manifest.id}.json`);

console.log(`Bundled ${manifest.name} (${manifest.id})`)
