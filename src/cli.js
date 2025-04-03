import { Command } from 'commander';
import debug from 'debug';
import pageLoader from './pageLoader.js';

const log = debug('hexlet-tests:cli');

const run = () => {
  const program = new Command();

  program
    .name('page-loader')
    .version('1.0.0')
    .description('Descarga páginas web')
    .argument('<url>', 'URL de la página a descargar')
    .option('-o, --output [dir]', 'Directorio de salida', process.cwd())
    .action(async (url, options) => {
      try {
        log(`page-loader -o ${options.output} ${url}`);
        const { filepath } = await pageLoader(url, options.output);
        console.log(`Archivo HTML guardado en: ${filepath}`);
      } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      }
    });

  program.parse(process.argv);
};

export default run;
