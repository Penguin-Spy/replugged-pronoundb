import asar from "@electron/asar";
import { readFileSync } from "fs";

const manifest = JSON.parse(readFileSync("manifest.json", "utf-8"));

asar.createPackage("dist", `${manifest.id}.asar`);
