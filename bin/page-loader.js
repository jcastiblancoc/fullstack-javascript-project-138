#!/usr/bin/env node

import { pageLoader } from "../src/page-loader.js";

const [, , url, outputDir] = process.argv;

if (!url || !outputDir) {
  console.error(
    "❌ Uso incorrecto. Debes proporcionar una URL y un directorio de salida.",
  );
  console.error("Ejemplo: page-loader https://ejemplo.com ./output");
  process.exit(1);
}

pageLoader(url, outputDir).catch((error) => {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
});
