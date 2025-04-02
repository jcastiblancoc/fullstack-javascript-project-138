import nock from 'nock';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import saveHtmlWithImages from '../src/index.js';

// Definir __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockHtml = `
<!DOCTYPE html>
<html>
  <body>
    <img src="/assets/professions/nodejs.png" />
  </body>
</html>`;

const mockImage = Buffer.from([137, 80, 78, 71]);

describe('Page Loader', () => {
  const testDir = path.join(__dirname, '__tests__');
  const testHtmlPath = path.join(testDir, 'codica-la-cursos.html');
  const testImagePath = path.join(testDir, 'codica-la-cursos_files', 'assets-professions-nodejs.png');

  beforeAll(async () => {
    await fs.ensureDir(testDir);
  });

  afterAll(async () => {
    await fs.remove(testDir);
  });

  test('descarga imágenes y modifica el HTML', async () => {
    nock('https://codica.la')
      .get('/cursos')
      .reply(200, mockHtml);

    nock('https://codica.la')
      .get('/assets/professions/nodejs.png')
      .reply(200, mockImage);

    await saveHtmlWithImages('https://codica.la/cursos', testHtmlPath);

    const savedHtml = await fs.readFile(testHtmlPath, 'utf-8');
    const savedImage = await fs.readFile(testImagePath);

    expect(savedHtml).toContain('codica-la-cursos_files/assets-professions-nodejs.png');
    expect(savedImage).toEqual(mockImage);
  });
});
