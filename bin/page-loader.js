#!/usr/bin/env node

import { program } from 'commander';
import downloadPage from '../src/page-loader.js';

program
    .version('1.0.0')
    .description('Page loader utility')
    .option('-o, --output [dir]', 'output dir', process.cwd())
    .arguments('<url>')
    .action(async (url, options) => {
        try {
            const filePath = await downloadPage(url, options.output);
            console.log(filePath);
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    });

program.parse();
