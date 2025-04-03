#!/usr/bin/env node

import { Command } from 'commander';
import pageLoader from '../src/pageLoader.js';
import run from '../src/cli.js';

run();

const program = new Command();

program
  .version('1.0.0')
  .arguments('<url>')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action(async (url, options) => {
    try {
      const filePath = await pageLoader(url, options.output);
      console.log(`Archivo guardado en: ${filePath}`);
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  });

program.parse();
