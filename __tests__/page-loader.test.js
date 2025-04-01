// __tests__/page-loader.test.js
import nock from 'nock';
import { downloadPage } from '../src/page-loader.js';
import { promises as fs } from 'fs';
import path from 'path';

const testUrl = 'https://example.com';
const testHtml = '<html><body>Test</body></html>';
const testFileName = 'example-com.html';

describe('page-loader', () => {
    it('should download the page and save it to the correct directory', async () => {
        const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));

        // Mock HTTP response
        nock('https://example.com')
            .get('/')
            .reply(200, testHtml);

        const filePath = await downloadPage(testUrl, outputDir);

        expect(filePath).toBe(path.join(outputDir, testFileName));

        const savedContent = await fs.readFile(filePath, 'utf-8');
        expect(savedContent).toBe(testHtml);
    });
});
