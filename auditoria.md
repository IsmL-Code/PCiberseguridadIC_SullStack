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

Se agregaron pruebas HTTP automatizadas (hoy diecisiete; los primeros ocho escenarios se detallan abajo) con `node:test` en `backend/tests/incidentes.api.test.js`. La suite utiliza servicios de persistencia en memoria para no alterar una base compartida, pero recorre Express, JWT, permisos, validación, controladores y respuestas HTTP. Los escenarios y resultados son:

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

La ejecución verificada de `npm test` reportó diecisiete casos aprobados y cero fallidos. El ciclo CRUD ejercita la ruta de API; el cliente React consume esas mismas operaciones en `frontend/mi-proyecto-plataformas/src/services/incidentesApi.js`. Para verificar el frontend se ejecutan `npm run lint` y `npm run build` desde su directorio; ambas comprobaciones pasaron después de los cambios. El backend se prueba desde `backend` con `npm test`. El archivo `backend/tests/evidencias.md` resume los resultados; no se atribuyen capturas inexistentes.

## Riesgos pendientes

La suite evita tocar MySQL, de modo que demuestra el comportamiento de rutas y lógica HTTP, pero no reemplaza una prueba de integración con una base desechable. Para evidenciar persistencia real se debe crear una base de pruebas separada, aplicar migraciones y repetir CRUD desde navegador y API. La guía advierte respaldar y confirmar el entorno antes de ejecutar la migración de contraseñas.

Ya se implementaron la limitación de intentos del login, un límite general de peticiones, cabeceras de seguridad (`helmet`), cookie `HttpOnly` con protección CSRF y registro de auditoría de eventos sin credenciales. Antes de publicar, configure `JWT_SECRET` mediante el gestor de secretos, defina el origen HTTPS exacto en `FRONTEND_URL`, compruebe TLS en el proxy y configure `trust proxy`. Aún conviene añadir monitoreo y alertas, respaldos con restauración probada, una CSP en el servidor que sirva el frontend y automatización de pruebas de navegador. Revisar dependencias y mínimos privilegios de MySQL también reduce riesgo operativo.

## Conclusión

El repositorio ahora incluye controles JWT y por rol, contraseñas bcrypt migrables, clave segura sin valor fijo, CORS por ambiente, validación de servidor y diecisiete pruebas automatizadas, incluido el ciclo CRUD y errores de acceso. HTTPS queda documentado como requisito de infraestructura, no como una capacidad ya demostrada del servidor local. La entrega debe incluir este informe, el código y las salidas reales de pruebas. La suite permite repetir la evidencia y detectar regresiones.

## Problemas detectados (revisión actual)

**Backend**
- El login bloquea al quinto intento fallido (4 intentos permitidos cada 15 min por IP, configurable con `LOGIN_MAX_INTENTOS` y `LOGIN_VENTANA_MIN`) y responde 429;.
- Las cabeceras de seguridad se añaden con `helmet` (CSP, `X-Content-Type-Options`, `X-Frame-Options`, HSTS; se elimina `X-Powered-By`), el cuerpo JSON está limitado a 10 kb y toda la API tiene un límite de 300 peticiones cada 15 min por IP (`API_MAX_PETICIONES`).
- `verificarToken` comprueba el estado del usuario mediante una caché de corta duración (ver «Optimización y preparación para despliegue»): uno suspendido o eliminado pierde el acceso de inmediato (401) en la instancia que procesa el cambio, y como máximo tras el TTL en otras instancias. La sesión dura 2 h. Cada JWT lleva un `jti`; al cerrar sesión se revoca en una lista en memoria hasta su expiración (limitación: es de un solo proceso y se pierde al reiniciar; con varias instancias debe moverse a Redis o a la base de datos).
- Los eventos de login (exitoso, fallido, suspendido), la creación, actualización, cambio de estado y borrado de usuarios, y el borrado de incidentes se registran como JSON (`utils/auditoria.js`) sin contraseñas ni tokens. Los registros van a la salida estándar: en producción deben enviarse a un almacén centralizado.
- Persisten dos limitaciones: las pruebas usan servicios simulados (no hay integración con una base MySQL real) y los límites de peticiones viven en memoria.

**Frontend**
- El token JWT ya no se guarda en `localStorage`: viaja en una cookie `HttpOnly` y `SameSite=Strict` (`Secure` en producción), por lo que el JavaScript no puede leerlo ante un XSS. En `localStorage` solo quedan el usuario, la expiración y el token CSRF; el rol guardado es manipulable y solo afecta la interfaz (el backend valida los permisos reales).
- La autenticación por cookie queda protegida contra CSRF: el JWT incluye un token CSRF aleatorio que el login devuelve al cliente y que este reenvía en la cabecera `X-CSRF-Token`; el servidor lo compara en tiempo constante en POST, PUT, PATCH y DELETE. Además se rechazan con 403 las escrituras cuyo `Origin` no esté en la lista permitida, y CORS usa `credentials` solo para esos orígenes. `POST /api/auth/logout` borra la cookie. La cabecera `Authorization: Bearer` sigue aceptándose (no se envía automáticamente, por lo que no requiere CSRF). Cubierto por las pruebas 11 a 14 del backend.
- Requisito de despliegue: con `SameSite=Strict`, frontend y API deben compartir el mismo sitio (mismo dominio registrable); de lo contrario el navegador no enviará la cookie.
- Hay una CSP de referencia en `vite.config.js` (`preview.headers`); en producción debe fijarla el servidor que sirva el frontend (la API ya envía la suya con `helmet`).
- Quedan estilos en línea estáticos en `ListaIncidentes.jsx` y reglas CSS repetidas entre `index.css` y `theme.css`; un análisis con postcss no encontró declaraciones inertes que se puedan borrar sin riesgo, por lo que se dejaron intactas.
- No existen pruebas de componentes ni de navegador (solo pruebas unitarias de utilidades).

## Cambios y mejoras aplicadas en esta revisión

**Backend**
- Limitación de intentos de login (429 al quinto fallo) y límite general de 300 peticiones por 15 min.
- `helmet` y límite de 10 kb para el cuerpo JSON.
- Verificación del estado del usuario en cada petición (suspendido o eliminado pierde acceso) y sesión reducida de 8 h a 2 h.
- Revocación de tokens al cerrar sesión: `jti` en el JWT, lista de revocados (`utils/tokensRevocados.js`) consultada por `verificarToken`; nueva prueba 16.
- Registro de auditoría en JSON (`utils/auditoria.js`) de logins y de operaciones sobre usuarios e incidentes.
- Eliminada la validación duplicada en `usuario.controller.js`: ahora solo la realizan `validarIdUsuario` y los esquemas Zod de las rutas.
- Paginación en el servidor, opcional y compatible: `GET /api/incidentes`, `/api/incidentes/eliminados` y `/api/usuarios` aceptan `?pagina=1&limite=15` (máximo 100) y usan `take`/`skip` de Prisma con `count` en una transacción; responden `{ datos, pagina, limite, total, totalPaginas }`. Sin esos parámetros devuelven el arreglo completo como antes (el frontend aún lo usa así). Los usuarios ya usaban `select` con campos públicos; los incidentes necesitan todas sus columnas. Probado con MySQL real y con la prueba 17.
- Suite de pruebas ampliada de 8 a 17 casos, todos aprobados.

**Frontend**
- Paginación de 15 filas en la lista de incidentes y en incidentes eliminados (`utils/paginacion.js`, `components/Paginacion.jsx`), con pruebas unitarias; se reinicia a la página 1 al cambiar los filtros.
- Eliminado `App.css`, que no se usaba (restos de la plantilla de Vite).
- CSP de referencia para `vite preview`.
- Verificado: `npm run lint`, `npm run build` y 15 pruebas unitarias de utilidades aprobadas.

**Pendiente (requiere infraestructura o herramientas nuevas)**
- Pruebas de integración con MySQL desechable y pruebas de componentes/navegador (Vitest, Playwright).
- `trust proxy`, HTTPS, despliegue en el mismo sitio, almacén central de logs y revocación compartida entre instancias.

## Optimización y preparación para despliegue

Como antesala del despliegue se optimizó el backend y se revisó el impacto de seguridad de cada cambio. Resultado verificado: ESLint sin errores, 17 pruebas de `npm test` y 7 de Jest aprobadas, esquema Prisma válido y `npm audit` con 0 vulnerabilidades.

**Calidad de código (ESLint)**
- Se configuró ESLint en `backend/eslint.config.mjs` (reglas recomendadas, entorno Node y globals de Jest para `tests/jest`). Se corrigió el aviso `no-unused-vars` en `manejarError` (el parámetro `next` es obligatorio para que Express reconozca un manejador de errores).

**Rendimiento**
- Caché del estado del usuario (`src/utils/estadoUsuarioCache.js`): `verificarToken` deja de consultar la base de datos en cada petición autenticada. El TTL es de 5 s por defecto (`USER_STATUS_CACHE_TTL_MS`, máximo 60 000 ms, `0` la desactiva), con tope de 5000 entradas y desactivada en `NODE_ENV=test`. Se invalida al actualizar, suspender o eliminar un usuario.
- Purga de tokens revocados (`src/utils/tokensRevocados.js`): se pasó de recorrer todo el mapa en cada revocación a una purga periódica cada 60 s con `setInterval(...).unref()`.
- Índices (`prisma/schema.prisma`): se añadieron `@@index([usuarioId, deletedAt, createdAt])` y `@@index([deletedAt, createdAt])` en `Incidente` para los listados filtrados y ordenados por fecha, y se eliminó el índice redundante `@@index([email])` (ya cubierto por `@unique`). Requiere aplicar la migración (`npx prisma migrate deploy`).
- Paginación (`paginarConTotal` en `src/utils/paginacion.js`): se evita la consulta `count` cuando la primera página no se llena; en el resto de casos se mantiene el total exacto.
- Costo de bcrypt configurable con `BCRYPT_COST`, acotado entre 10 y 14 (12 por defecto), sin debilitar los hashes ni permitir una denegación de servicio por un valor excesivo.

**Seguridad de los cambios**
- La caché podía guardar un estado `ACTIVE` obsoleto si una consulta en curso terminaba después de suspender al usuario. Se corrigió con un contador de versión: si hubo una invalidación durante la lectura, el resultado no se guarda.
- Dependencias: `npm audit` reportaba 6 vulnerabilidades (5 altas, 1 moderada; entre ellas `mariadb`, con posible inyección SQL en ciertos juegos de caracteres, `mysql2` y `deepmerge-ts`). Se aplicó `npm audit fix` y el resultado es 0 vulnerabilidades.
- Los índices, la purga de tokens y el cálculo del total no exponen datos adicionales: el total solo cuenta filas que ya pasaron el filtro de rol y usuario.

**Variables de entorno nuevas** (documentadas en `backend/.env.example`): `USER_STATUS_CACHE_TTL_MS` y `BCRYPT_COST`.

**Revisión de vulnerabilidades (backend y frontend)**
- Frontend: `npm audit` reportaba 1 vulnerabilidad alta (`source-map-js`, denegación de servicio); se corrigió con `npm audit fix` y ahora hay 0. Se añadió el script `npm test` (15 pruebas de utilidades aprobadas), y `lint` y `build` pasan.
- Backend, dependencias de producción: 0 vulnerabilidades (`npm run audit:prod`).
- Backend, dependencias de desarrollo: había 22 (3 altas por `nodemon` → `chokidar` → `braces`). Se eliminó `nodemon` y el script `dev` ahora usa `node --watch`, con lo que desaparecieron las 3 altas. Quedan 19 moderadas en la cadena de `jest` (`sprintf-js`, `js-yaml`) sin versión corregida publicada; solo afectan a las pruebas locales y no se despliegan. `npm audit fix --force` no se aplica porque propone bajar `jest` a versiones antiguas.
- Revisión de código: sin `eval`, `innerHTML`, `dangerouslySetInnerHTML` ni SQL crudo; sin secretos fijos; `backend/.env` está ignorado por git.
- Riesgo aceptado: el frontend guarda en `localStorage` el token CSRF y el rol que se muestra en pantalla. El JWT va en cookie `HttpOnly`, por lo que un XSS no podría leerlo.

**Riesgos residuales**
- La caché y la lista de tokens revocados son por proceso: con varias instancias, un cambio de estado tarda hasta el TTL en notarse y la revocación no se comparte (usar Redis o la base de datos).
- Sigue pendiente aplicar un límite de paginación por defecto cuando el cliente no envía `pagina` ni `limite`; cambia el formato de respuesta (hoy un arreglo) y requiere ajustar el frontend.

**Lista previa al despliegue**
1. Aplicar la migración de índices con `npx prisma migrate deploy`.
2. Configurar `JWT_SECRET` (mínimo 32 caracteres), `FRONTEND_URL` (HTTPS) y `NODE_ENV=production`.
3. Configurar `trust proxy`, TLS en el proxy inverso y envío de logs a un almacén central.
4. Ejecutar `npm run lint`, `npm test`, `npm run test:jest` y `npm audit` en CI antes de cada publicación.
