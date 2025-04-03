#!/usr/bin/env node

import { pageLoader } from '../src/page-loader.js';
import { Command } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';

const program = new Command();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

program
    .version('1.0.0')
    .arguments('<url>')
    .option('-o, --output <dir>', 'output directory', path.join(__dirname, '../descargas'))
    .action((url, options) => {
        pageLoader(url, options.output)
            .then(() => console.log('Página descargada con éxito'))
            .catch((err) => console.error('Error:', err.message));
    });

program.parse(process.argv);
