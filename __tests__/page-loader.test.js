import { test, expect } from '@jest/globals';
import fs from 'fs-extra';
import path from 'path';
import pageLoader from '../src/index.js';

const testUrl = 'https://example.com';
const outputDir = path.join(__dirname, '..', '__fixtures__', 'output');

beforeEach(async () => {
  await fs.remove(outputDir);
  await fs.ensureDir(outputDir);
});

test('descarga página con recursos locales', async () => {
  await pageLoader(testUrl, outputDir);

  const files = await fs.readdir(outputDir);
  expect(files).toContain('example-com.html');

  const resourcesDir = path.join(outputDir, 'example-com_files');
  const resources = await fs.readdir(resourcesDir);
  expect(resources.length).toBeGreaterThan(0);
});
