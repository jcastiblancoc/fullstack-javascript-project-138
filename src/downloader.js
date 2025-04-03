import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { URL } from 'url';

export async function downloadResource(resourceUrl, resourcesDir) {
    const urlObj = new URL(resourceUrl);
    const fileName = `${urlObj.hostname}${urlObj.pathname.replace(/\W/g, '-')}`;
    const filePath = path.join(resourcesDir, fileName);

    const response = await axios.get(resourceUrl, { responseType: 'arraybuffer' });
    await fs.writeFile(filePath, response.data);

    return { originalUrl: resourceUrl, localPath: filePath };
}
