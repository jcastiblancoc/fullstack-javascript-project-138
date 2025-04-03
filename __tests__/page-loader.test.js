/* eslint-env jest */
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import nock from 'nock';
import pageLoader from '../src/pageLoader.js';

describe('Page Loader - Manejo de errores y descarga HTML', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  test('Debe descargar correctamente el HTML de la página', async () => {
    const url = 'https://site.com/blog/about';
    const expectedFilesDir = 'site-com-blog-about_files';

    // HTML simulado con recursos locales
    nock('https://site.com')
      .get('/blog/about')
      .reply(
        200,
        `
        <html>
          <head>
            <link rel="stylesheet" href="/assets/application.css">
            <script src="/packs/js/runtime.js"></script>
          </head>
          <body>
            <img src="/assets/professions/nodejs.png">
          </body>
        </html>
      `,
      );

    // Recursos locales simulados
    nock('https://site.com')
      .get('/assets/application.css')
      .reply(200, 'body { background-color: red; }');

    nock('https://site.com')
      .get('/packs/js/runtime.js')
      .reply(200, 'console.log(\'Hello World\');');

    nock('https://site.com')
      .get('/assets/professions/nodejs.png')
      .reply(200, 'IMAGEN_BLOB', {
        'Content-Type': 'image/png',
      });

    const result = await pageLoader(url, tempDir);
    const fileContent = await fs.readFile(result.filepath, 'utf-8');

    expect(fileContent).toContain(`${expectedFilesDir}/site-com-assets-application.css`);
    expect(fileContent).toContain(`${expectedFilesDir}/site-com-packs-js-runtime.js`);
    expect(fileContent).toContain(`${expectedFilesDir}/site-com-assets-professions-nodejs.png`);
  });

  test('Debe lanzar error si la página devuelve 404', async () => {
    const url = 'https://site.com/pagina-invalida';

    nock('https://site.com').get('/pagina-invalida').reply(404);

    await expect(pageLoader(url, tempDir)).rejects.toThrow(/Request failed with status code 404/);
  });

  test('Debe lanzar error si no se puede escribir en el directorio', async () => {
    const url = 'https://site.com';

    nock('https://site.com').get('/').reply(200, '<html></html>');

    const protectedDir = await fs.mkdtemp(path.join(os.tmpdir(), 'no-write-'));
    await fs.chmod(protectedDir, 0o444); // Solo lectura

    await expect(pageLoader(url, protectedDir)).rejects.toThrow(/EACCES|permiso/i);

    await fs.chmod(protectedDir, 0o755);
  });
});
