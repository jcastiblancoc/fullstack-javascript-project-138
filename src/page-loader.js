import fs from "fs/promises";
import path from "path";
import axios from "axios";
import { URL } from "url";
import debug from "debug";
import { extractLocalResources, updateHtmlLinks } from "./htmlProcessor.js";
import { downloadResource } from "./downloader.js";

// Configuración del logger
const log = debug("page-loader");
const errorLog = debug("page-loader:error");

log("🚀 Iniciando ejecución de page-loader");

// Configuración de interceptores de axios para debug
const axiosDebug = debug("axios");
axios.interceptors.request.use((request) => {
  axiosDebug(`📡 Request: ${request.method.toUpperCase()} ${request.url}`);
  return request;
});

axios.interceptors.response.use(
  (response) => {
    axiosDebug(`📥 Response: ${response.status} ${response.statusText}`);
    return response;
  },
  (error) => {
    axiosDebug(
      `❌ Error en respuesta: ${error.response?.status || "sin código"} ${error.message}`,
    );
    return Promise.reject(error);
  },
);

export async function pageLoader(url, outputDir) {
  log(`🌐 URL a descargar: ${url}`);
  log(`📂 Directorio de salida: ${outputDir}`);

  // Generar nombres de archivos y directorios
  const urlObj = new URL(url);
  const pageName =
    `${urlObj.hostname.replace(/\./g, "-")}${urlObj.pathname.replace(/\W/g, "-")}`.replace(
      /-$/,
      "",
    );
  const resourcesDir = path.join(outputDir, `${pageName}_files`);
  const htmlFilePath = path.join(outputDir, `${pageName}.html`);

  try {
    // Crear directorios necesarios
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(resourcesDir, { recursive: true });
  } catch (error) {
    if (error.code === "EACCES") {
      throw new Error("No se pudo escribir el archivo HTML: permiso denegado");
    }
    throw error;
  }

  log("🛠 Descargando HTML...");

  try {
    // Descargar el HTML principal
    const response = await axios.get(url, {
      validateStatus: (status) => status >= 200 && status < 300, // Solo aceptar códigos 2xx como éxito
    });

    log("✅ HTML descargado con éxito");

    // Procesar recursos locales
    const resources = extractLocalResources(response.data, url);
    log(`📦 Recursos encontrados: ${resources.length}`);

    // Descargar todos los recursos en paralelo
    const downloads = await Promise.allSettled(
      resources.map((resourceUrl) =>
        downloadResource(resourceUrl, resourcesDir),
      ),
    );

    // Crear mapa de recursos descargados
    const resourcesMap = Object.fromEntries(
      downloads
        .filter((res) => res.status === "fulfilled")
        .map(({ value }) => [
          value.originalUrl,
          path.relative(outputDir, value.localPath),
        ]),
    );

    // Loggear errores de descarga de recursos
    downloads
      .filter((res) => res.status === "rejected")
      .forEach(({ reason }) =>
        errorLog(`❌ Error descargando recurso: ${reason.message}`),
      );

    // Actualizar HTML con las rutas locales
    log("🔗 Actualizando enlaces en el HTML...");
    const updatedHtml = updateHtmlLinks(response.data, resourcesMap);
    await fs.writeFile(htmlFilePath, updatedHtml, "utf-8");

    log(`🎉 Página descargada con éxito: ${htmlFilePath}`);
    return htmlFilePath;
  } catch (error) {
    // Manejo específico de errores HTTP
    if (error.response) {
      switch (error.response.status) {
        case 404:
          throw new Error("La página respondió con el código HTTP 404");
        case 403:
          throw new Error("Acceso prohibido (HTTP 403)");
        case 500:
          throw new Error("Error interno del servidor (HTTP 500)");
        default:
          throw new Error(
            `La página respondió con el código HTTP ${error.response.status}`,
          );
      }
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      throw new Error("No se recibió respuesta del servidor");
    } else {
      // Error al configurar la petición
      throw new Error(`Error al descargar la página: ${error.message}`);
    }
  }
}
