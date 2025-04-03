import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { URL } from 'url';
import debug from 'debug';
import { extractLocalResources, updateHtmlLinks } from './htmlProcessor.js';
import { downloadResource } from './downloader.js';

// Configuración del logger
const log = debug('page-loader');
const errorLog = debug('page-loader:error');

log('🚀 Iniciando ejecución de page-loader');

const axiosDebug = debug('axios');
axios.interceptors.request.use((request) => {
  axiosDebug(`📡 Request: ${request.method.toUpperCase()} ${request.url}`);
  return request;
});

axios.interceptors.response.use((response) => {
  axiosDebug(`📥 Response: ${response.status} ${response.statusText}`);
  return response;
});


export async function pageLoader(url, outputDir) {
  try {
    log(`🌐 URL a descargar: ${url}`);
    log(`📂 Directorio de salida: ${outputDir}`);

    const urlObj = new URL(url);
    const pageName = `${urlObj.hostname.replace(/\./g, '-')}${urlObj.pathname.replace(/\W/g, '-')}`.replace(/-$/, '');
    const resourcesDir = path.join(outputDir, `${pageName}_files`);
    const htmlFilePath = path.join(outputDir, `${pageName}.html`);

    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(resourcesDir, { recursive: true });

    log('🛠 Descargando HTML...');
    const { data: html } = await axios.get(url);
    log('✅ HTML descargado con éxito');

    const resources = extractLocalResources(html, url);
    log(`📦 Recursos encontrados: ${resources.length}`);

    const downloads = await Promise.all(
      resources.map((resourceUrl) =>
        downloadResource(resourceUrl, resourcesDir).catch((err) => {
          errorLog(`❌ Error descargando ${resourceUrl}: ${err.message}`);
          return null;
        })
      )
    );

    const resourcesMap = Object.fromEntries(
      downloads
        .filter(Boolean)
        .map(({ originalUrl, localPath }) => [originalUrl, path.relative(outputDir, localPath)])
    );

    log('🔗 Actualizando enlaces en el HTML...');
    const updatedHtml = updateHtmlLinks(html, resourcesMap);
    await fs.writeFile(htmlFilePath, updatedHtml, 'utf-8');

    log(`🎉 Página descargada con éxito: ${htmlFilePath}`);
    return htmlFilePath;
  } catch (error) {
    errorLog(`🚨 Error en pageLoader: ${error.message}`);
    throw error;
  }
}
