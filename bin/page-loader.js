#!/usr/bin/env node

import { Command } from 'commander';
import saveHtmlWithImages from '../src/index.js';

const program = new Command();

program
    .name('page-loader')
    .description('Descarga una página web con sus imágenes.')
    .version('1.0.0')
    .argument('<url>', 'URL de la página a descargar')
    .option('-o, --output <path>', 'Directorio de salida', process.cwd())
    .action((url, options) => {
        const outputPath = `${options.output}/page.html`;
        saveHtmlWithImages(url, outputPath)
            .then(() => console.log(`Página guardada en: ${outputPath}`))
            .catch(err => console.error(`Error: ${err.message}`));
    });

program.parse();
