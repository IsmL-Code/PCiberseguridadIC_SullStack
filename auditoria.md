# Informe de seguridad, pruebas y mejoras

> **Estado actual (20 de octubre de 2026):** este informe conserva hallazgos y resultados de revisiones anteriores como historial. Las referencias a MySQL, conteos anteriores de pruebas o auditorías no describen el estado actual. En esta versión el backend usa PostgreSQL; los resultados vigentes se resumen en «Verificación actual de la entrega».

## Alcance y situación inicial

Se revisó la aplicación de gestión de incidentes, compuesta por un cliente React/Vite y una API Node.js/Express conectada a PostgreSQL mediante Prisma. En la revisión inicial el proyecto todavía utilizaba MySQL; esa referencia se conserva como contexto histórico. El trabajo evalúa autenticación, autorización, contraseñas, validación, CORS, HTTPS, operaciones CRUD y pruebas. Este documento informa sobre el código y las comprobaciones repetibles del repositorio; no constituye certificación de seguridad ni acredita la configuración de una instalación pública.

La aplicación ya tenía controles útiles: rutas protegidas con JWT, permisos por rol, bcrypt al crear usuarios, validación Zod, operaciones Prisma y un cliente conectado a la API. Los permisos distinguen lectura, creación, edición y eliminación de incidentes; las rutas administrativas requieren rol administrador. El cliente envía el token Bearer y permite registrar, consultar, actualizar y borrar incidentes.

La revisión inicial detectó tres brechas concretas: el login aceptaba como alternativa contraseñas almacenadas sin hash; si `JWT_SECRET` faltaba, emisión y validación de tokens usaban una cadena fija conocida; y `npm test` no ejecutaba casos. En aquella revisión, la base local tenía una cuenta con formato heredado entre seis; no se consultaron ni expusieron los valores de contraseña. La auditoría previa describía falta de validación y CORS abierto, pero no reflejaba el código que ya aplicaba Zod y una lista de orígenes. Esos hallazgos describen el punto de partida, no una vulnerabilidad pendiente en la versión documentada aquí.

## Mejoras implementadas

Se eliminó la aceptación permanente de contraseñas en texto plano: el login verifica bcrypt y las nuevas contraseñas se guardan con factor 12. Para las cuentas heredadas se añadió una migración idempotente; en modo de consulta solo informa el número de cuentas por migrar. El modo de escritura requiere confirmación explícita mediante `CONFIRM_LEGACY_PASSWORD_HASH_MIGRATION=true`, actualiza cada valor con bcrypt y omite hashes ya migrados. La migración se ejecutó en la base local revisada sin mostrar credenciales; el conteo posterior confirmó cero contraseñas heredadas. El usuario conserva su clave, aunque su representación almacenada cambia.

Se eliminó la clave JWT fija. En producción el servidor ahora falla al iniciar si falta `JWT_SECRET` o tiene menos de 32 caracteres. En desarrollo se usa una clave aleatoria temporal por proceso, nunca un valor predecible; los tokens dejan de ser válidos tras reiniciar el servidor. La guía indica que el entorno de despliegue debe proporcionar una clave estable y secreta.

CORS permite localhost únicamente fuera de producción. En producción se admite solo el origen HTTPS configurado en `FRONTEND_URL`; el servidor falla al iniciar si esa URL falta o no usa HTTPS, y los orígenes no permitidos no reciben `Access-Control-Allow-Origin`. CORS regula el acceso de navegadores, no sustituye JWT ni autorización de API. Zod recorta los campos de texto, comprueba formato, tamaño y patrones de contenido; el tipo del incidente se restringió en servidor a las nueve opciones de la interfaz. Las expresiones de detección son defensa adicional, no sustituyen consultas parametrizadas. Prisma usa operaciones tipadas y no se encontraron consultas SQL manuales en el servicio de incidentes.

Se documentó HTTPS para despliegue: usar un proxy inverso o entrada administrada con certificados vigentes, redirigir HTTP a HTTPS, no exponer directamente Express a Internet y reenviar `Authorization`. La aplicación no administra certificados ni termina TLS por sí misma; esos controles deben configurarse y probarse en la infraestructura.

## Pruebas y evidencias

Se agregaron pruebas HTTP automatizadas con `node:test` en `backend/tests/incidentes.api.test.js`. La suite utiliza servicios de persistencia simulados en memoria para no alterar la base PostgreSQL, pero recorre Express, JWT, permisos, validación, controladores y respuestas HTTP. Los escenarios numerados del 1 al 8 se detallan abajo; el archivo también incluye otros casos.

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

La ejecución actual de `npm test` en el backend reportó 20 pruebas aprobadas y cero fallidas. El ciclo CRUD ejercita las rutas HTTP con servicios simulados; no es una prueba de persistencia en PostgreSQL. El cliente React consume esas operaciones desde `frontend/mi-proyecto-plataformas/src/services/incidentesApi.js`. La comprobación actual del frontend reportó 18 pruebas unitarias aprobadas; `npm run lint` y `npm run build` también finalizaron correctamente. Los resultados de esta entrega se registran en «Verificación actual de la entrega»; no se afirma que exista un archivo de evidencias separado.

## Riesgos pendientes

La suite evita tocar PostgreSQL, de modo que demuestra el comportamiento de rutas y lógica HTTP, pero no reemplaza una prueba de integración con una base desechable. Para evidenciar persistencia real se debe crear una base de pruebas separada, aplicar migraciones y repetir CRUD desde navegador y API. La guía advierte respaldar y confirmar el entorno antes de ejecutar la migración de contraseñas.

Ya se implementaron la limitación de intentos del login, un límite general de peticiones, cabeceras de seguridad (`helmet`), cookie `HttpOnly` con protección CSRF y registro de auditoría de eventos sin credenciales. Antes de publicar, configure `JWT_SECRET` mediante el gestor de secretos, defina el origen HTTPS exacto en `FRONTEND_URL`, compruebe TLS en el proxy y configure `trust proxy`. Aún conviene añadir monitoreo y alertas, respaldos con restauración probada, una CSP en el servidor que sirva el frontend y automatización de pruebas de navegador. También se recomienda revisar los permisos del usuario de PostgreSQL.

## Conclusión

El repositorio incluye controles JWT y por rol, contraseñas bcrypt migrables, clave segura sin valor fijo, CORS por ambiente, validación de servidor y pruebas automatizadas. HTTPS queda documentado como requisito de infraestructura, no como una capacidad ya demostrada por el servidor local. La sección «Verificación actual de la entrega» refleja las comprobaciones repetidas para esta revisión.

## Implementación y limitaciones documentadas en revisiones anteriores

**Backend**
- El login responde 429 al superar el máximo de intentos fallidos por IP. Los valores predeterminados actuales son 4 intentos por ventana de 1 minuto, configurables con `LOGIN_MAX_INTENTOS` y `LOGIN_VENTANA_MIN`.
- Las cabeceras de seguridad se añaden con `helmet` (CSP, `X-Content-Type-Options`, `X-Frame-Options`, HSTS; se elimina `X-Powered-By`), el cuerpo JSON está limitado a 10 kb y toda la API tiene un límite de 300 peticiones cada 15 min por IP (`API_MAX_PETICIONES`).
- `verificarToken` comprueba el estado del usuario mediante una caché de corta duración (ver «Optimización y preparación para despliegue»): uno suspendido o eliminado pierde el acceso de inmediato (401) en la instancia que procesa el cambio, y como máximo tras el TTL en otras instancias. La sesión dura 2 h. Cada JWT lleva un `jti`; al cerrar sesión se revoca en una lista en memoria hasta su expiración (limitación: es de un solo proceso y se pierde al reiniciar; con varias instancias debe moverse a Redis o a la base de datos).
- Los eventos de login (exitoso, fallido, suspendido), la creación, actualización, cambio de estado y borrado de usuarios, y el borrado de incidentes se registran como JSON (`utils/auditoria.js`) sin contraseñas ni tokens. Los registros van a la salida estándar: en producción deben enviarse a un almacén centralizado.
- Persisten dos limitaciones: las pruebas usan servicios simulados (no hay integración automatizada con PostgreSQL real) y los límites de peticiones viven en memoria.

**Frontend**
- El token JWT ya no se guarda en `localStorage`: viaja en una cookie `HttpOnly` y `SameSite=Strict` (`Secure` en producción), por lo que el JavaScript no puede leerlo ante un XSS. En `localStorage` solo quedan el usuario, la expiración y el token CSRF; el rol guardado es manipulable y solo afecta la interfaz (el backend valida los permisos reales).
- La autenticación por cookie queda protegida contra CSRF: el JWT incluye un token CSRF aleatorio que el login devuelve al cliente y que este reenvía en la cabecera `X-CSRF-Token`; el servidor lo compara en tiempo constante en POST, PUT, PATCH y DELETE. Además se rechazan con 403 las escrituras cuyo `Origin` no esté en la lista permitida, y CORS usa `credentials` solo para esos orígenes. `POST /api/auth/logout` borra la cookie. La cabecera `Authorization: Bearer` sigue aceptándose (no se envía automáticamente, por lo que no requiere CSRF). Cubierto por las pruebas 11 a 14 del backend.
- Requisito de despliegue: con `SameSite=Strict`, frontend y API deben compartir el mismo sitio (mismo dominio registrable); de lo contrario el navegador no enviará la cookie.
- Hay una CSP de referencia en `vite.config.js` (`preview.headers`); en producción debe fijarla el servidor que sirva el frontend. La API aplica su propia CSP mediante `helmet`.
- Quedan estilos en línea estáticos en `ListaIncidentes.jsx` y reglas CSS repetidas entre `index.css` y `theme.css`; un análisis con postcss no encontró declaraciones inertes que se puedan borrar sin riesgo, por lo que se dejaron intactas.
- No existen pruebas de componentes ni de navegador (solo pruebas unitarias de utilidades).

## Cambios y mejoras aplicadas en esta revisión

**Backend**
- Limitación de intentos de login (429 al quinto fallo) y límite general de 300 peticiones por 15 min.
- `helmet` y límite de 10 kb para el cuerpo JSON.
- Verificación del estado del usuario en cada petición (suspendido o eliminado pierde acceso) y sesión reducida de 8 h a 2 h.
- Revocación de tokens: `jti` en el JWT y lista de revocados (`utils/tokensRevocados.js`) consultada por `verificarToken`. La prueba HTTP 16 marca un token como revocado y confirma que el middleware lo rechaza; no simula la llamada al endpoint de cierre de sesión.
- Registro de auditoría en JSON (`utils/auditoria.js`) de logins y de operaciones sobre usuarios e incidentes.
- Eliminada la validación duplicada en `usuario.controller.js`: ahora solo la realizan `validarIdUsuario` y los esquemas Zod de las rutas.
- Paginación opcional en el servidor: `GET /api/incidentes`, `/api/incidentes/eliminados` y `/api/usuarios` aceptan `?pagina=1&limite=15` (máximo 100) y responden `{ datos, pagina, limite, total, totalPaginas }`. Sin esos parámetros mantienen la respuesta como arreglo, por compatibilidad con el cliente actual. Esta compatibilidad es el comportamiento vigente, no un defecto pendiente. La prueba HTTP 17 valida la forma paginada con persistencia simulada; no demuestra la paginación contra PostgreSQL.
- Suite de pruebas ampliada de 8 a 17 casos, todos aprobados.

**Frontend**
- Paginación de 15 filas en la lista de incidentes y en incidentes eliminados (`utils/paginacion.js`, `components/Paginacion.jsx`), con pruebas unitarias; se reinicia a la página 1 al cambiar los filtros.
- Eliminado `App.css`, que no se usaba (restos de la plantilla de Vite).
- CSP de referencia para `vite preview`.
- En la revisión anterior se verificaron `npm run lint`, `npm run build` y 15 pruebas unitarias; el conteo vigente se encuentra más abajo.

**Pendiente (requiere infraestructura o herramientas nuevas)**
- Pruebas de integración con PostgreSQL desechable y pruebas de componentes/navegador (Vitest, Playwright).
- `trust proxy`, HTTPS, despliegue en el mismo sitio, almacén central de logs y revocación compartida entre instancias.

## Optimización y preparación para despliegue

Como antesala del despliegue se optimizó el backend y se revisó el impacto de seguridad de cada cambio. Los resultados de revisiones anteriores se conservan aquí como referencia; el estado comprobado el 20 de octubre de 2026 se detalla en la sección final.

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
- Historial de dependencias: una revisión anterior encontró vulnerabilidades en paquetes de MySQL y otras dependencias; ese resultado no describe la auditoría actual ni la base PostgreSQL vigente.
- Los índices, la purga de tokens y el cálculo del total no exponen datos adicionales: el total solo cuenta filas que ya pasaron el filtro de rol y usuario.

**Variables de entorno nuevas** (documentadas en `backend/.env.example`): `USER_STATUS_CACHE_TTL_MS` y `BCRYPT_COST`.

**Revisión de vulnerabilidades (backend y frontend)**
- Frontend: una revisión anterior encontró una vulnerabilidad alta en `source-map-js`; el estado actual de auditoría y pruebas se indica en la sección final.
- Backend, dependencias de producción: 0 vulnerabilidades (`npm run audit:prod`).
- Backend, dependencias de desarrollo: el resultado descrito en revisiones anteriores ha cambiado; consulta la auditoría completa vigente en la sección final. La auditoría de producción (`npm audit --omit=dev`) se informa por separado.
- Revisión de código: sin `eval`, `innerHTML`, `dangerouslySetInnerHTML` ni consultas SQL dinámicas en las rutas de negocio; sin secretos fijos; `backend/.env` está ignorado por git.
- Riesgo aceptado: el frontend guarda en `localStorage` el token CSRF y el rol que se muestra en pantalla. El JWT va en cookie `HttpOnly`, por lo que un XSS no podría leerlo.

**Riesgos residuales**
- La caché y la lista de tokens revocados son por proceso: con varias instancias, un cambio de estado tarda hasta el TTL en notarse y la revocación no se comparte (usar Redis o la base de datos).
- Sin `pagina` ni `limite`, los endpoints conservan deliberadamente la respuesta en arreglo completo para mantener compatibilidad con el frontend; al solicitar paginación, el límite máximo es 100.

**Lista previa al despliegue**
1. Aplicar la migración de índices con `npx prisma migrate deploy`.
2. Configurar `JWT_SECRET` (mínimo 32 caracteres), `FRONTEND_URL` (HTTPS) y `NODE_ENV=production`.
3. Configurar `trust proxy`, TLS en el proxy inverso y envío de logs a un almacén central.
4. Ejecutar `npm run lint`, `npm test`, `npm run test:jest` y revisar `npm audit` (incluidas las dependencias de desarrollo) en CI antes de cada publicación.

## Verificación actual de la entrega

Comprobaciones ejecutadas el 20 de octubre de 2026 desde cada carpeta del componente:

| Componente | Comprobación | Resultado |
| --- | --- | --- |
| Backend | `npm test` | 20 aprobadas, 0 fallidas. Incluye 17 escenarios numerados y 3 comprobaciones adicionales; usa servicios de persistencia simulados. |
| Backend | `npm run lint` | Aprobado. |
| Backend | `npm run test:jest -- --runInBand` | 7 aprobadas. |
| Backend | `npx prisma validate` | Esquema válido. |
| Backend | `npm run audit:prod` | 0 vulnerabilidades en dependencias de producción. |
| Backend | `npm audit` | 19 vulnerabilidades moderadas en dependencias de desarrollo; ninguna alta o crítica en el resultado actual. Revisar antes de publicar, sin forzar una degradación mayor de Jest. |
| Frontend | `npm test` | 18 aprobadas, 0 fallidas. |
| Frontend | `npm run lint` | Aprobado. |
| Frontend | `npm run build` | Aprobado. |
| Frontend | `npm audit` | 0 vulnerabilidades. |

La auditoría completa del backend no está limpia: las 19 vulnerabilidades moderadas corresponden a dependencias de desarrollo, mientras que la auditoría de producción reporta cero. Esta distinción no elimina la necesidad de revisar las dependencias de desarrollo ni equivale a una prueba de seguridad del despliegue. No se ejecutó una prueba de integración contra una instancia real de PostgreSQL, ni se verificó un despliegue público, TLS o restauración de respaldos.
