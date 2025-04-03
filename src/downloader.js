import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';

export async function downloadResource(url, outputDir) {
    const urlObj = new URL(url);
    const ext = path.extname(urlObj.pathname); // Obtiene la extensión correcta (.css, .png, .js)
    const baseName = urlObj.hostname.replace(/\./g, '-') + urlObj.pathname.replace(/\W/g, '-'); // Convierte la URL en nombre válido

    // Asegura que la extensión no se duplique
    const cleanBaseName = baseName.replace(new RegExp(`-${ext.slice(1)}$`), '');
    const localFileName = `${cleanBaseName}${ext}`.replace(/-+/g, '-'); // Evita guiones repetidos

    const localPath = path.join(outputDir, localFileName);

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        await fs.writeFile(localPath, response.data);
        return { originalUrl: url, localPath };
    } catch (error) {
        console.error(`❌ Error descargando ${url}:`, error.message);
        return { originalUrl: url, localPath: null };
    }
}
