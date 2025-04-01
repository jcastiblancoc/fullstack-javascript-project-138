import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const generateFilename = (url) => {
    const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
    return urlWithoutProtocol.replace(/[^a-zA-Z0-9]/g, '-') + '.html';
};

export const downloadPage = (url, outputDir = process.cwd()) => {
    return new Promise((resolve, reject) => {
        if (!url || typeof url !== 'string') {
            reject(new Error('Invalid URL'));
            return;
        }

        axios.get(url)
            .then(response => {
                if (!response.data) {
                    throw new Error('Empty response');
                }

                const filename = generateFilename(url);
                const filepath = path.join(outputDir, filename);

                return fs.writeFile(filepath, response.data)
                    .then(() => filepath)
                    .catch(error => {
                        throw new Error(`File write error: ${error.message}`);
                    });
            })
            .then(resolve)
            .catch(error => {
                let errorMessage = 'Download failed';

                if (error.response) {
                    errorMessage += ` (Status: ${error.response.status})`;
                } else if (error.request) {
                    errorMessage += ' (No response)';
                } else {
                    errorMessage += ` (${error.message})`;
                }

                reject(new Error(errorMessage));
            });
    });
};