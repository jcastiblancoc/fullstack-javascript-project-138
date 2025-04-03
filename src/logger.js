import debug from "debug";

export const log = debug("page-loader"); // Namespace específico para nuestra app
export const errorLog = debug("page-loader:error"); // Para errores específicos

log("Logger inicializado"); // Mensaje para confirmar que está funcionando correctamente
