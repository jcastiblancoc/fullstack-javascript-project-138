import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

const downloadFile = async (url, outputPath) => {
  try {
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });
    await fs.outputFile(outputPath, data);
  } catch (error) {
    console.error(`Error al descargar ${url}: ${error.message}`);
  }
};

const downloadResources = async (html, baseUrl, outputDir) => {
  const $ = cheerio.load(html);
  const resources = [];

  const processTag = (selector, attr) => {
    $(selector).each((_, element) => {
      const src = $(element).attr(attr);
      if (!src) return;

      const resourceUrl = new URL(src, baseUrl);
      const isLocal = resourceUrl.hostname === new URL(baseUrl).hostname;

      if (isLocal) {
        const fileName = resourceUrl.pathname.replace(/\//g, '-').replace(/^-/, '');
        const filePath = path.join(outputDir, fileName);

        resources.push({ url: resourceUrl.href, filePath });

        $(element).attr(attr, `${path.basename(outputDir)}/${fileName}`);
      }
    });
  };

  processTag('link[rel="stylesheet"]', 'href');
  processTag('script', 'src');
  processTag('img', 'src');

  await fs.ensureDir(outputDir);
  await Promise.all(resources.map(({ url, filePath }) => downloadFile(url, filePath)));

  return $.html();
};

const pageLoader = async (url, outputDir) => {
  try {
    await fs.ensureDir(outputDir);

    const parsedUrl = new URL(url);
    const pageName = `${parsedUrl.hostname}${parsedUrl.pathname.replace(/\//g, '-')}`;
    const pageDir = path.join(outputDir, `${pageName}_files`);
    const outputFile = path.join(outputDir, `${pageName}.html`);

    const { data: html } = await axios.get(url);

    const modifiedHtml = await downloadResources(html, url, pageDir);
    await fs.outputFile(outputFile, modifiedHtml);

    console.log(`Página guardada en: ${outputFile}`);
  } catch (error) {
    console.error(`Error al descargar la página: ${error.message}`);
  }
};

export default pageLoader;
