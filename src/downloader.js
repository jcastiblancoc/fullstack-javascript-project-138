import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';

export const downloadFile = async (url, outputPath) => {
  try {
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });
    await fs.outputFile(outputPath, data);
    console.log(`Descargado: ${url} -> ${outputPath}`);
  } catch (error) {
    console.error(`Error al descargar ${url}: ${error.message}`);
  }
};
