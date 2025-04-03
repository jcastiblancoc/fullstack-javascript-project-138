import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { processHtml } from './htmlProcessor.js';
import { downloadFile } from './downloader.js';
import { URL } from 'url';

const pageLoader = async (url, outputDir) => {
    try {
        await fs.ensureDir(outputDir);

        const parsedUrl = new URL(url);
        const pageName = `${parsedUrl.hostname}${parsedUrl.pathname.replace(/\//g, '-')}`.replace(/-$/, '');
        const pageDir = path.join(outputDir, `${pageName}_files`);
        const outputFile = path.join(outputDir, `${pageName}.html`);  // <-- Asegura que se guarda en el outputDir

        const { data: html } = await axios.get(url);

        const { modifiedHtml, resources } = processHtml(html, url, pageDir);
        await fs.outputFile(outputFile, modifiedHtml);

        await fs.ensureDir(pageDir);
        await Promise.all(resources.map(({ url, filePath }) => downloadFile(url, filePath)));

        console.log(`Página guardada en: ${outputFile}`);
    } catch (error) {
        console.error(`Error al descargar la página: ${error.message}`);
    }
};

export default pageLoader;
