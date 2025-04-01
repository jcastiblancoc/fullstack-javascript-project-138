import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const generateFilename = (url) => {
    const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
    const filename = urlWithoutProtocol.replace(/[^a-zA-Z0-9]/g, '-') + '.html';
    return filename;
};

export const downloadPage = (url, outputDir = process.cwd()) => {
    return new Promise((resolve, reject) => {
        if (!url) {
            reject(new Error('URL is required'));
            return;
        }

        axios.get(url)
            .then((response) => {
                const filename = generateFilename(url);
                const filepath = path.join(outputDir, filename);

                return fs.writeFile(filepath, response.data)
                    .then(() => filepath);
            })
            .then(resolve)
            .catch(reject);
    });
};