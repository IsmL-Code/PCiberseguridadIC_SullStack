# Informe de seguridad, pruebas y mejoras

## Alcance y situación inicial

Se revisó la aplicación de gestión de incidentes, compuesta por un cliente React/Vite y una API Node.js/Express conectada a MySQL mediante Prisma. El trabajo evaluó autenticación, autorización, contraseñas, validación, CORS, HTTPS, operaciones CRUD y pruebas. Este documento informa sobre el código y las comprobaciones repetibles del repositorio; no constituye certificación de seguridad ni acredita la configuración de una instalación pública.

La aplicación ya tenía controles útiles: rutas protegidas con JWT, permisos por rol, bcrypt al crear usuarios, validación Zod, operaciones Prisma y un cliente conectado a la API. Los permisos distinguen lectura, creación, edición y eliminación de incidentes; las rutas administrativas requieren rol administrador. El cliente envía el token Bearer y permite registrar, consultar, actualizar y borrar incidentes.

La revisión detectó tres brechas concretas. El login aceptaba como alternativa contraseñas almacenadas sin hash. En la base local había una cuenta con formato heredado entre seis; no se consultaron ni expusieron los valores de contraseña. Asimismo, si `JWT_SECRET` faltaba, emisión y validación de tokens usaban una cadena fija conocida. Finalmente, el script `npm test` no ejecutaba casos: era un marcador que fallaba con “no test specified”. La auditoría previa describía falta de validación y CORS abierto, pero no reflejaba el código vigente, que ya aplicaba Zod y una lista de orígenes. La evaluación se corrigió para precisar lo que faltaba.

## Mejoras implementadas

Se eliminó la aceptación permanente de contraseñas en texto plano: el login verifica bcrypt y las nuevas contraseñas se guardan con factor 12. Para las cuentas heredadas se añadió una migración idempotente; en modo de consulta solo informa el número de cuentas por migrar. El modo de escritura requiere confirmación explícita mediante `CONFIRM_LEGACY_PASSWORD_HASH_MIGRATION=true`, actualiza cada valor con bcrypt y omite hashes ya migrados. La migración se ejecutó en la base local revisada sin mostrar credenciales; el conteo posterior confirmó cero contraseñas heredadas. El usuario conserva su clave, aunque su representación almacenada cambia.

Se eliminó la clave JWT fija. En producción el servidor ahora falla al iniciar si falta `JWT_SECRET` o tiene menos de 32 caracteres. En desarrollo se usa una clave aleatoria temporal por proceso, nunca un valor predecible; los tokens dejan de ser válidos tras reiniciar el servidor. La guía indica que el entorno de despliegue debe proporcionar una clave estable y secreta.

CORS permite localhost únicamente fuera de producción. En producción se admite solo el origen HTTPS configurado en `FRONTEND_URL`; el servidor falla al iniciar si esa URL falta o no usa HTTPS, y los orígenes no permitidos no reciben `Access-Control-Allow-Origin`. CORS regula el acceso de navegadores, no sustituye JWT ni autorización de API. Zod recorta los campos de texto, comprueba formato, tamaño y patrones de contenido; el tipo del incidente se restringió en servidor a las nueve opciones de la interfaz. Las expresiones de detección son defensa adicional, no sustituyen consultas parametrizadas. Prisma usa operaciones tipadas y no se encontraron consultas SQL manuales en el servicio de incidentes.

Se documentó HTTPS para despliegue: usar un proxy inverso o entrada administrada con certificados vigentes, redirigir HTTP a HTTPS, no exponer directamente Express a Internet y reenviar `Authorization`. La aplicación no administra certificados ni termina TLS por sí misma; esos controles deben configurarse y probarse en la infraestructura.

## Pruebas y evidencias

Se agregaron ocho pruebas HTTP automatizadas con `node:test` en `backend/test/incidentes.api.test.js`. La suite utiliza servicios de persistencia en memoria para no alterar una base compartida, pero recorre Express, JWT, permisos, validación, controladores y respuestas HTTP. Los escenarios y resultados son:

| Caso | Comprobación | Resultado esperado |
|---|---|---|
| 1 | Consulta sin token | 401 |
| 2 | Token inválido | 401 |
| 3 | Analista intenta eliminar | 403 |
| 4 | Consulta autenticada desde origen permitido | 200 y CORS permitido |
| 5 | Crear, listar, consultar, actualizar y eliminar | 201, 200 y 204 |
| 6 | Título `SELEC FROM #` | 400 y cero registros creados |
| 7 | Filtro con estado inválido | 400 |
| 8 | Origen web no permitido | Sin encabezado CORS de autorización |

La ejecución verificada de `npm test` reportó ocho casos aprobados y cero fallidos. El ciclo CRUD ejercita la ruta de API; el cliente React consume esas mismas operaciones en `frontend/mi-proyecto-plataformas/src/services/incidentesApi.js`. Para verificar el frontend se ejecutan `npm run lint` y `npm run build` desde su directorio; ambas comprobaciones pasaron después de los cambios. El backend se prueba desde `backend` con `npm test`. El archivo `backend/test/evidencias.md` resume los resultados; no se atribuyen capturas inexistentes.

## Riesgos pendientes

La suite evita tocar MySQL, de modo que demuestra el comportamiento de rutas y lógica HTTP, pero no reemplaza una prueba de integración con una base desechable. Para evidenciar persistencia real se debe crear una base de pruebas separada, aplicar migraciones y repetir CRUD desde navegador y API. La guía advierte respaldar y confirmar el entorno antes de ejecutar la migración de contraseñas.

Antes de publicar, configure `JWT_SECRET` mediante el gestor de secretos, defina el origen HTTPS exacto en `FRONTEND_URL` y compruebe TLS en el proxy. Aún conviene añadir limitación de intentos al login, cabeceras de seguridad, monitoreo y auditoría de eventos sin credenciales, alertas, respaldos con restauración probada y automatización de pruebas de navegador. El token del frontend se guarda en `localStorage`; una CSP robusta ayuda frente a XSS, aunque cookies `HttpOnly`, `Secure` y `SameSite` podrían ser una opción si se rediseña autenticación. Revisar dependencias y mínimos privilegios de MySQL también reduce riesgo operativo.

## Conclusión

El repositorio ahora incluye controles JWT y por rol, contraseñas bcrypt migrables, clave segura sin valor fijo, CORS por ambiente, validación de servidor y ocho pruebas automatizadas, incluido el ciclo CRUD y errores de acceso. HTTPS queda documentado como requisito de infraestructura, no como una capacidad ya demostrada del servidor local. La entrega debe incluir este informe, el código y las salidas reales de pruebas. La suite permite repetir la evidencia y detectar regresiones.
