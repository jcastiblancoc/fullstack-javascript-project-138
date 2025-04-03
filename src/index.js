#!/usr/bin/env node
import { Command } from "commander";
import { pageLoader } from "./pageLoader.js";
import path from "path";

const program = new Command();

program
  .version("1.0.0")
  .argument("<url>", "URL de la página a descargar")
  .option("-o, --output [dir]", "Directorio de salida", process.cwd())
  .action(async (url, options) => {
    const outputDir = path.resolve(options.output);
    await pageLoader(url, outputDir);
    console.log(`Página descargada en ${outputDir}`);
  });

program.parse();
