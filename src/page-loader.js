import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { URL } from 'url';
import { extractLocalResources, updateHtmlLinks } from './htmlProcessor.js';
import { downloadResource } from './downloader.js';

export async function pageLoader(url, outputDir) {
  try {
    const urlObj = new URL(url);
    const pageName = `${urlObj.hostname.replace(/\./g, '-')}${urlObj.pathname.replace(/\W/g, '-')}`.replace(/-$/, '');
    const resourcesDir = path.join(outputDir, `${pageName}_files`);
    const htmlFilePath = path.join(outputDir, `${pageName}.html`);

    // Crear directorios necesarios
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(resourcesDir, { recursive: true });

    console.log(`📥 Descargando página: ${url}`);
    const { data: html } = await axios.get(url);

    // Extraer y descargar recursos locales
    const resources = extractLocalResources(html, url);
    console.log(`🔍 Recursos encontrados: ${resources.length}`);

    const downloads = await Promise.all(
      resources.map((resourceUrl) =>
        downloadResource(resourceUrl, resourcesDir).catch((err) => {
          console.error(`❌ Error descargando ${resourceUrl}: ${err.message}`);
          return null;
        })
      )
    );

    // Mapear los recursos descargados para actualizar el HTML
    const resourcesMap = Object.fromEntries(
      downloads
        .filter(Boolean) // Excluir descargas fallidas
        .map(({ originalUrl, localPath }) => [originalUrl, path.relative(outputDir, localPath)])
    );

    // Actualizar los enlaces en el HTML
    const updatedHtml = updateHtmlLinks(html, resourcesMap);
  await fs.writeFile(path.join(outputDir, 'codica-la-cursos.html'), updatedHtml, 'utf-8');



    return htmlFilePath;
  } catch (error) {
    console.error(`❌ Error en pageLoader: ${error.message}`);
    throw error;
  }
}
