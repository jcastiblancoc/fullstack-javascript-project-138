import { pageLoader } from "../src/page-loader.js";
import fs from "fs/promises";
import path from "path";
import nock from "nock";
import debug from "debug";

const testLog = debug("page-loader:test");
testLog("🧪 Iniciando pruebas de page-loader");

const outputDir = path.join(process.cwd(), "test-output");
const testUrl = "https://codica.la/cursos";
const mockHtml = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Test Page</title>
    <link rel="stylesheet" href="/assets/style.css">
  </head>
  <body>
    <img src="/assets/image.png">
    <script src="/scripts/app.js"></script>
  </body>
</html>`;

beforeEach(async () => {
  testLog("♻️ Limpiando directorio de pruebas...");
  await fs.rm(outputDir, { recursive: true, force: true });
  nock.cleanAll(); // Limpiar todos los mocks existentes
});

afterEach(() => {
  nock.cleanAll(); // Limpiar mocks después de cada test
});

test("pageLoader descarga HTML y recursos locales", async () => {
  testLog("🌐 Configurando respuestas de nock para test exitoso...");
  nock("https://codica.la")
    .get("/cursos")
    .reply(200, mockHtml)
    .get("/assets/style.css")
    .reply(200, "body { background: red; }")
    .get("/assets/image.png")
    .reply(200, Buffer.from("image data"))
    .get("/scripts/app.js")
    .reply(200, 'console.log("hello");');

  testLog("📥 Descargando página y recursos...");
  await pageLoader(testUrl, outputDir);

  const downloadedHtml = await fs.readFile(
    path.join(outputDir, "codica-la-cursos.html"),
    "utf-8",
  );
  expect(downloadedHtml).toContain(
    "codica-la-cursos_files/codica-la-assets-style.css",
  );
  expect(downloadedHtml).toContain(
    "codica-la-cursos_files/codica-la-assets-image.png",
  );
  expect(downloadedHtml).toContain(
    "codica-la-cursos_files/codica-la-scripts-app.js",
  );

  const styleExists = await fs
    .access(
      path.join(
        outputDir,
        "codica-la-cursos_files",
        "codica-la-assets-style.css",
      ),
    )
    .then(() => true)
    .catch(() => false);
  const imageExists = await fs
    .access(
      path.join(
        outputDir,
        "codica-la-cursos_files",
        "codica-la-assets-image.png",
      ),
    )
    .then(() => true)
    .catch(() => false);
  const scriptExists = await fs
    .access(
      path.join(
        outputDir,
        "codica-la-cursos_files",
        "codica-la-scripts-app.js",
      ),
    )
    .then(() => true)
    .catch(() => false);

  expect(styleExists).toBe(true);
  expect(imageExists).toBe(true);
  expect(scriptExists).toBe(true);

  testLog("✅ Página y recursos descargados correctamente.");
});

test("Error cuando la página responde con código 404", async () => {
  testLog("🚨 Simulando respuesta 404...");
  nock("https://codica.la").get("/cursos").reply(404, "Not found");

  await expect(pageLoader(testUrl, outputDir)).rejects.toThrow(
    "La página respondió con el código HTTP 404",
  );

  testLog("✅ Se detectó correctamente el error 404.");
});

test("Error cuando no se puede escribir el archivo", async () => {
  testLog("🚨 Simulando error de permisos en el directorio...");
  nock("https://codica.la").get("/cursos").reply(200, mockHtml);

  // Crear el directorio con permisos de solo lectura
  await fs.mkdir(outputDir, { mode: 0o444 });

  await expect(pageLoader(testUrl, outputDir)).rejects.toThrow(
    "No se pudo escribir el archivo HTML",
  );

  testLog("✅ Se detectó correctamente el error de permisos.");
});
