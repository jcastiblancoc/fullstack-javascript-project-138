#!/usr/bin/env node
import { Command } from 'commander';
import { downloadPage } from './pageLoader.js';

const program = new Command();

program
    .name('page-loader')
    .description('Page loader utility')
    .version('1.0.0')
    .argument('<url>', 'URL to download')
    .option('-o, --output [dir]', 'output dir', process.cwd())
    .action(async (url, options) => {
        try {
            const filepath = await downloadPage(url, options.output);
            console.log(filepath);
        } catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });

program.parse(process.argv);