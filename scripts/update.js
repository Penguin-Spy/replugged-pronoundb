import { watch } from 'fs/promises';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, cpSync } from 'fs';
import { join } from "path";
import transpile from "./transpile.js"

const manifest = JSON.parse(readFileSync("manifest.json", "utf-8"));

// https://github.com/replugged-org/plugin-template/blob/5bff900e787782f07e4e6d06c39b57c614d3477b/scripts/build.ts#L31
const REPLUGGED_FOLDER_NAME = "replugged";
const CONFIG_PATH = (() => {
  switch(process.platform) {
    case "win32":
      return join(process.env.APPDATA || "", REPLUGGED_FOLDER_NAME);
    case "darwin":
      return join(process.env.HOME || "", "Library", "Application Support", REPLUGGED_FOLDER_NAME);
    default:
      if(process.env.XDG_CONFIG_HOME) {
        return join(process.env.XDG_CONFIG_HOME, REPLUGGED_FOLDER_NAME);
      }
      return join(process.env.HOME || "", ".config", REPLUGGED_FOLDER_NAME);
  }
})();


function transpileAll() {
  if(!existsSync("dist")) mkdirSync("dist")

  const distManifest = JSON.parse(JSON.stringify(manifest))

  if(manifest.renderer) {
    const [scriptOutput, styleOutput] = transpile(manifest.renderer)
    writeFileSync("dist/renderer.js", scriptOutput)
    if(styleOutput !== "") writeFileSync("dist/renderer.css", styleOutput)
    distManifest.renderer = "renderer.js"
  }
  if(manifest.preload) {
    writeFileSync("dist/preload.js", transpile(manifest.preload)[0])
    distManifest.renderer = "preload.js"
  }
  if(manifest.main) {
    writeFileSync("dist/main.js", transpile(manifest.main)[0])
    distManifest.renderer = "main.js"
  }
  if(manifest.plaintextPatches) {
    writeFileSync("dist/plaintextPatches.js", transpile(manifest.plaintextPatches)[0])
    distManifest.renderer = "plaintextPatches.js"
  }

  writeFileSync("dist/manifest.json", JSON.stringify(distManifest))
}

function install() {
  const dest = join(CONFIG_PATH, "plugins", manifest.id);
  if(existsSync(dest)) {
    rmSync(dest, { recursive: true });
  }
  cpSync("dist", dest, { recursive: true });
  console.log("Plugin installed");
}


if(process.argv.includes("--watch")) {
  (async () => {
    let currentTimeout = false;
    console.log("Watching for file changes, press Ctrl+C to exit.");

    const watcher = watch("src", { recursive: true });
    for await(const event of watcher) {
      console.log(`[${event.eventType}]: ${event.filename}`);

      // only copy files every 500ms, this avoids issues with double-saving or other quick modifications
      if(currentTimeout !== false) clearTimeout(currentTimeout);
      currentTimeout = setTimeout(() => {
        transpileAll()
        install()
        currentTimeout = false
      }, 500);
    }
  })();
}

transpileAll();
if(!process.argv.includes("--no-install")) {
  install();
}

