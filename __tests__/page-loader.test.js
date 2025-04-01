import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import nock from 'nock';
import { downloadPage } from '../src/pageLoader.js';

describe('pageLoader', () => {
    let tempDir;
    const url = 'https://example.com';
    const htmlContent = '<html><body>Test</body></html>';

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
        nock('https://example.com').get('/').reply(200, htmlContent);
    });

    test('downloads page content', async () => {
        const filepath = await downloadPage(url, tempDir);
        const content = await fs.readFile(filepath, 'utf-8');

        expect(content).toBe(htmlContent);
        expect(filepath).toMatch(/example-com\.html$/);
    });

    test('uses current directory if output not specified', async () => {
        const filepath = await downloadPage(url);
        expect(filepath).toMatch(process.cwd());
    });

    test('throws error for invalid URL', async () => {
        await expect(downloadPage('invalid-url')).rejects.toThrow();
    });
});