import { pageLoader } from '../src/page-loader.js';
import fs from 'fs/promises';
import path from 'path';
import nock from 'nock';

const outputDir = path.join(process.cwd(), 'test-output');
const testUrl = 'https://codica.la/cursos';
const mockHtml = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Test Page</title>
    <link rel="stylesheet" href="/assets/style.css">
  </head>
  <body>
    <img src="/assets/image.png">
    <script src="/scripts/app.js"></script>
  </body>
</html>`;

beforeEach(async () => {
  await fs.rm(outputDir, { recursive: true, force: true });
  nock('https://codica.la')
    .get('/cursos')
    .reply(200, mockHtml)
    .get('/assets/style.css')
    .reply(200, 'body { background: red; }')
    .get('/assets/image.png')
    .reply(200, Buffer.from('image data'))
    .get('/scripts/app.js')
    .reply(200, 'console.log("hello");');
});

test('pageLoader descarga HTML y recursos locales', async () => {
  await pageLoader(testUrl, outputDir);

  const downloadedHtml = await fs.readFile(path.join(outputDir, 'codica-la-cursos.html'), 'utf-8');
  expect(downloadedHtml).toContain('codica-la-cursos_files/codica-la-assets-style.css');
  expect(downloadedHtml).toContain('codica-la-cursos_files/codica-la-assets-image.png');
  expect(downloadedHtml).toContain('codica-la-cursos_files/codica-la-scripts-app.js');

  const styleExists = await fs.access(path.join(outputDir, 'codica-la-cursos_files', 'codica-la-assets-style.css')).then(() => true).catch(() => false);
  const imageExists = await fs.access(path.join(outputDir, 'codica-la-cursos_files', 'codica-la-assets-image.png')).then(() => true).catch(() => false);
  const scriptExists = await fs.access(path.join(outputDir, 'codica-la-cursos_files', 'codica-la-scripts-app.js')).then(() => true).catch(() => false);

  expect(styleExists).toBe(true);
  expect(imageExists).toBe(true);
  expect(scriptExists).toBe(true);
});
