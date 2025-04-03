import * as cheerio from 'cheerio';
import path from 'path';
import { URL } from 'url';

export const processHtml = (html, baseUrl, outputDir) => {
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

  return { modifiedHtml: $.html(), resources };
};
