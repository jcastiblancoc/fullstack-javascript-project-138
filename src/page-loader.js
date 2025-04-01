import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { Command } from 'commander';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

const sanitizeFilename = (url) => {
    return url.replace(/^https?:\/\//, '')
        .replace(/[^a-zA-Z0-9]/g, '-') + '.html';
};

const downloadPage = async (url, outputDir) => {
    try {
        const response = await axios.get(url);
        const filename = sanitizeFilename(url);
        const filePath = path.join(outputDir, filename);
        await fs.writeFile(filePath, response.data, 'utf-8');
        console.log(filePath);
        return filePath;
    } catch (error) {
        console.error(`Error downloading ${url}:`, error.message);
        process.exit(1);
    }
};


export default downloadPage;
