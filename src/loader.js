import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import * as cheerio from 'cheerio';

const downloadImages = async (html, url, outputDir) => {
  const $ = cheerio.load(html);
  const images = $('img');

  await fs.ensureDir(outputDir);

  const downloads = images.map(async (_, img) => {
    const src = $(img).attr('src');
    if (!src) return;

    const imageUrl = new URL(src, url).href;
    const imagePath = src.replace(/^\//, '').replace(/\//g, '-');
    const localPath = path.join(outputDir, imagePath);

    try {
      const { data } = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      await fs.writeFile(localPath, data);
      $(img).attr('src', path.join(path.basename(outputDir), imagePath));
    } catch (error) {
      console.error(`Error descargando imagen ${imageUrl}:`, error.message);
    }
  }).get();

  await Promise.all(downloads);
  return $.html();
};

const saveHtmlWithImages = async (pageUrl, outputPath) => {
  try {
    const { data: html } = await axios.get(pageUrl);
    const outputDir = outputPath.replace('.html', '_files');

    const modifiedHtml = await downloadImages(html, pageUrl, outputDir);
    await fs.writeFile(outputPath, modifiedHtml, 'utf-8');

    console.log(`Página guardada en: ${outputPath}`);
  } catch (error) {
    console.error(`Error descargando la página ${pageUrl}:`, error.message);
  }
};

export default saveHtmlWithImages;
