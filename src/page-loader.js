import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { URL } from 'url';
import { extractLocalResources, updateHtmlLinks } from './htmlProcessor.js';
import { downloadResource } from './downloader.js';

export async function pageLoader(url, outputDir) {
  const urlObj = new URL(url);
  const pageName = `${urlObj.hostname}${urlObj.pathname.replace(/\W/g, '-')}`;
  const resourcesDir = path.join(outputDir, `${pageName}_files`);

  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(resourcesDir, { recursive: true });

  const response = await axios.get(url);
  const html = response.data;
  const htmlFilePath = path.join(outputDir, `${pageName}.html`);

  const resources = extractLocalResources(html, url);
  const downloads = await Promise.all(
    resources.map((resourceUrl) => downloadResource(resourceUrl, resourcesDir))
  );

  const resourcesMap = Object.fromEntries(
    downloads.map(({ originalUrl, localPath }) => [originalUrl, path.relative(outputDir, localPath)])
  );
  const updatedHtml = updateHtmlLinks(html, resourcesMap);

  await fs.writeFile(htmlFilePath, updatedHtml);
}
