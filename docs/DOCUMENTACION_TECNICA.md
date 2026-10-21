# Documentación técnica

## 1. Propósito y alcance

La solución permite registrar y consultar incidentes de ciberseguridad mediante una aplicación web. Está compuesta por una interfaz de usuario React y una API REST con persistencia PostgreSQL.

Esta guía describe los componentes disponibles en el repositorio y los pasos para instalar, configurar, probar, desplegar y mantenerlos. Las credenciales y secretos que aparecen aquí son nombres de ejemplo; reemplázalos por valores seguros en tu entorno y no los publiques.

## 2. Arquitectura

```text
Navegador
  └── Frontend React + React Router (Vite)
        └── HTTPS / API REST JSON
              └── Backend Express
                    ├── Middlewares: CORS, Helmet, límites, autenticación,
                    │   CSRF, permisos, validación y errores
                    ├── Controladores y servicios
                    └── Prisma Client → PostgreSQL
```

- **Frontend:** aplicación de página única (SPA). Los servicios HTTP se encuentran en `frontend/mi-proyecto-plataformas/src/services/`.
- **Backend:** aplicación Express 5. Las rutas validan y autorizan solicitudes antes de delegar en controladores y servicios.
- **Persistencia:** PostgreSQL mediante Prisma; el esquema y las migraciones están en `backend/prisma/`.
- **Comunicación:** JSON bajo `/api`; el endpoint público `/health` comprueba la API y su conexión con la base de datos.

## 3. Requisitos

- Node.js `^20.19.0` o `>=22.12.0` y npm.
- PostgreSQL 14 o superior, o Docker Compose para levantar la base de datos local.
- Git, si se va a clonar el repositorio.
- En producción: un proveedor de PostgreSQL y un proxy/plataforma de entrada que termine HTTPS.

## 4. Instalación y ejecución local

Ejecuta los comandos desde la raíz del repositorio, salvo que se indique otra carpeta.

1. Inicia PostgreSQL local:

   ```powershell
   docker compose -f backend/docker-compose.yml up -d
   ```

   El servicio Compose está destinado al desarrollo local. Sus credenciales no deben reutilizarse en producción.

2. Configura el backend:

   ```powershell
   Copy-Item backend\.env.example backend\.env
   Set-Location backend
   npm install
   ```

   Edita `backend/.env` y establece una URL válida en `DATABASE_URL`. El resto de las variables se describe en la sección [Configuración](#6-configuración).

3. Genera el cliente Prisma y aplica las migraciones:

   ```powershell
   npm run build
   npx prisma migrate deploy
   ```

4. Inicia la API. Déjala ejecutándose en esta terminal:

   ```powershell
   npm run dev
   ```

   La API escucha en `http://localhost:3000` de forma predeterminada.

5. En otra terminal, desde la raíz del repositorio, instala e inicia el frontend:

   ```powershell
   Set-Location frontend\mi-proyecto-plataformas
   npm install
   npm run dev
   ```

   Vite suele publicar el frontend en `http://localhost:5173`. El frontend utiliza `http://localhost:3000` como API por defecto.

6. Comprueba la disponibilidad:

   ```powershell
   Invoke-RestMethod http://localhost:3000/health
   ```

   Una respuesta correcta contiene `status: ok` y `database: ok`. Si PostgreSQL no está disponible, el endpoint responde HTTP `503`.

## 5. Estructura del repositorio

```text
.
├── backend/
│   ├── prisma/
│   │   ├── migrations/                 # Migraciones versionadas
│   │   └── schema.prisma               # Modelos y enumeraciones
│   ├── scripts/                        # Tareas operativas
│   ├── src/
│   │   ├── config/                     # JWT y configuración de sesión
│   │   ├── controllers/                # Manejadores HTTP
│   │   ├── database/                   # Cliente Prisma
│   │   ├── middlewares/                # Seguridad, validación y errores
│   │   ├── models/                     # Esquemas Zod y roles
│   │   ├── routes/                     # Rutas de API
│   │   ├── services/                   # Reglas y persistencia
│   │   └── utils/                      # Paginación, auditoría y sesión
│   ├── tests/                          # Pruebas de API y de negocio
│   ├── .env.example                    # Plantilla sin secretos reales
│   └── docker-compose.yml              # PostgreSQL para desarrollo local
├── frontend/
│   └── mi-proyecto-plataformas/
│       ├── public/                     # Recursos estáticos
│       └── src/
│           ├── components/             # Componentes reutilizables
│           ├── config/                 # Configuración del cliente API
│           ├── hooks/                  # Hooks React
│           ├── pages/                  # Vistas
│           ├── services/               # Comunicación con la API
│           └── utils/                  # Sesión, paginación y tema
├── render.yaml                         # Configuración de despliegue Render
└── README.md
```

## 6. Configuración

### Backend

Define estas variables en `backend/.env` para desarrollo o como variables protegidas del proveedor en producción.

| Variable | Requerida | Uso |
| --- | --- | --- |
| `DATABASE_URL` | Sí | Conexión PostgreSQL. Formato: `postgresql://<USUARIO_EJEMPLO>:<CONTRASENA_EJEMPLO>@<HOST_EJEMPLO>:5432/<BASE_EJEMPLO>?schema=public`. Codifica caracteres reservados de usuario y contraseña como URL. |
| `JWT_SECRET` | Sí en producción | Clave de firma aleatoria de al menos 32 caracteres. En desarrollo, si se omite, se genera una clave temporal que cambia al reiniciar el backend. |
| `FRONTEND_URL` | Sí en producción | Origen exacto del frontend autorizado. En local: `http://localhost:5173`; en producción: origen HTTPS. |
| `NODE_ENV` | No | Entorno: `development`, `test` o `production`. Predeterminado según la plataforma; establece `production` al desplegar. |
| `PORT` | No | Puerto HTTP de la API; predeterminado `3000`. |
| `TRUST_PROXY` | No | Número o configuración de proxies confiables. En Render se establece `1` para reconocer la IP reenviada por el proxy. |
| `COOKIE_SAMESITE` | No | `strict` por defecto. Usa `none` cuando frontend y API están en sitios distintos; requiere HTTPS en producción. Valores admitidos: `strict`, `lax`, `none`. |
| `LOGIN_MAX_INTENTOS` | No | Intentos de login fallidos permitidos por IP dentro de la ventana. Predeterminado `4`. |
| `LOGIN_VENTANA_MIN` | No | Ventana del límite de login en minutos. Predeterminado `1`. |
| `API_MAX_PETICIONES` | No | Solicitudes permitidas por IP en la ventana general de 15 minutos. Predeterminado `300`. |
| `USER_STATUS_CACHE_TTL_MS` | No | Caché del estado de usuario en milisegundos; predeterminado `5000`, máximo `60000`; `0` la desactiva. |
| `BCRYPT_COST` | No | Factor de costo de bcrypt, limitado entre `10` y `14`; predeterminado `12`. |

Ejemplo de plantilla local, con un secreto descriptivo de ejemplo:

```dotenv
DATABASE_URL="postgresql://<USUARIO_EJEMPLO>:<CONTRASENA_EJEMPLO>@localhost:5432/<BASE_EJEMPLO>?schema=public"
JWT_SECRET="<SECRETO_ALEATORIO_DE_EJEMPLO_DE_32_CARACTERES_O_MAS>"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
PORT=3000
```

El archivo `backend/.env.example` es la referencia para otras opciones. No subas `.env` ni introduzcas credenciales reales en el código o la documentación.

### Frontend

| Variable | Requerida | Uso |
| --- | --- | --- |
| `VITE_API_URL` | No | URL base de la API, sin `/api`. En desarrollo, si se omite, usa `http://localhost:3000`; en producción, si se omite, usa el mismo origen. Se incorpora durante la compilación y no debe contener secretos. |

Ejemplo en `frontend/mi-proyecto-plataformas/.env`:

```dotenv
VITE_API_URL="https://<HOST_API_EJEMPLO>"
```

## 7. Comandos

Ejecuta cada comando desde la carpeta del componente correspondiente.

### Backend (`backend/`)

| Comando | Descripción |
| --- | --- |
| `npm install` | Instala dependencias para desarrollo. |
| `npm run dev` | Inicia Express con recarga automática de Node.js. |
| `npm start` | Inicia Express para el entorno de ejecución. |
| `npm run build` | Genera Prisma Client. |
| `npx prisma migrate deploy` | Aplica migraciones pendientes a la base configurada. |
| `npm test` | Ejecuta pruebas de API con `node:test`. |
| `npm run test:jest` | Ejecuta las pruebas Jest de reglas de negocio. |
| `npm run test:jest:evidencia` | Ejecuta las pruebas de evidencia configuradas para demostrar detección de errores; se espera que fallen. |
| `npm run lint` | Ejecuta ESLint. |
| `npm run audit:prod` | Audita dependencias de producción. |
| `npm run migrate:passwords` | Inspecciona hashes heredados; modificar datos requiere confirmación explícita. |

Para migrar hashes heredados, primero ejecuta `npm run migrate:passwords` sin confirmación para obtener el conteo. Antes de transformar datos, revisa el entorno y respalda la base. La operación exige `CONFIRM_LEGACY_PASSWORD_HASH_MIGRATION=true` solo para esa ejecución; consulta [backend/README.md](./backend/README.md) para el procedimiento PowerShell detallado. El script convierte a bcrypt con costo 12 los valores que no sean ya bcrypt.

### Frontend (`frontend/mi-proyecto-plataformas/`)

| Comando | Descripción |
| --- | --- |
| `npm install` | Instala dependencias para desarrollo. |
| `npm run dev` | Inicia Vite. |
| `npm run build` | Genera la SPA de producción en `dist/`. |
| `npm run preview` | Previsualiza localmente la compilación. |
| `npm test` | Ejecuta pruebas unitarias con `node:test`. |
| `npm run lint` | Ejecuta ESLint. |

## 8. Modelos de datos

Los modelos están definidos en `backend/prisma/schema.prisma`; las solicitudes se validan mediante esquemas Zod en `backend/src/models/`.

### Usuario

| Campo | Tipo / restricción | Descripción |
| --- | --- | --- |
| `id` | Entero, autoincremental | Identificador. |
| `nombre`, `apellido` | Texto, máximo 100 caracteres | Nombre de la persona. |
| `email` | Texto, único, máximo 100 caracteres | Correo normalizado a minúsculas. |
| `password` | Texto, máximo 255 en base de datos | Hash bcrypt; nunca debe almacenarse ni exponerse como texto plano. |
| `rol` | Texto, máximo 50 caracteres | `Administrador`, `Analista` o `Supervisor`. |
| `status` | Enumeración | `PENDING`, `ACTIVE`, `SUSPENDED` o `DELETED`; por defecto `PENDING`. Solo usuarios `ACTIVE` pueden autenticarse. |
| `createdAt`, `updatedAt` | Fecha y hora | Creación y última actualización. |
| `deletedAt` | Fecha y hora nullable | Marca de eliminación lógica. |

### Incidente

| Campo | Tipo / restricción | Descripción |
| --- | --- | --- |
| `id` | Entero, autoincremental | Identificador. |
| `tituloIncidente` | Texto, máximo 120 caracteres | Título; la entrada requiere al menos 5 caracteres. |
| `tipo` | Texto, máximo 100 caracteres | Tipo validado contra la lista admitida por la API. |
| `sistemaAfectado` | Texto nullable en base de datos, máximo 100 caracteres | Sistema o servicio afectado; requerido y no vacío en las solicitudes validadas por la API. |
| `descripcion` | Texto | Descripción de 10 a 2000 caracteres. |
| `prioridad` | Enumeración | `BAJA`, `MEDIA`, `ALTA` o `CRITICA`; predeterminado `MEDIA`. |
| `estado` | Enumeración | `ABIERTO`, `EN_PROCESO` o `CERRADO`; predeterminado `ABIERTO`. |
| `usuarioId` | Entero, clave foránea | Usuario propietario del incidente. |
| `createdAt`, `updatedAt` | Fecha y hora | Creación y última actualización. |
| `deletedAt` | Fecha y hora nullable | Marca de eliminación lógica. |

La API valida `tipo` con una lista que incluye `Phishing`, `Malware`, `Ransomware`, `Fuerza bruta`, `Acceso no autorizado`, `Fuga de información`, `Denegación de servicio`, `Ingeniería social` y `Otro`. Los índices de estado, prioridad, propietario y eliminación lógica se definen en Prisma.

## 9. API REST

Las rutas de negocio están prefijadas con `/api`. Excepto login y logout, requieren autenticación. Las respuestas de error son JSON.

### Sesión

| Método y ruta | Acceso | Resultado |
| --- | --- | --- |
| `POST /api/auth/login` | Público; limitado por IP | Acepta `{ "email": "...", "password": "..." }`. Establece la cookie `authToken` y responde con `csrfToken`, `expiraEn` y datos públicos del usuario. |
| `GET /api/auth/me` | Requiere cookie de sesión | Devuelve el usuario autenticado actual. |
| `POST /api/auth/logout` | Público | Revoca el token disponible y elimina la cookie; responde `204`. |

### Incidentes

| Método y ruta | Acceso | Resultado |
| --- | --- | --- |
| `GET /api/incidentes` | Lectura | Lista incidentes no eliminados; filtros opcionales `estado` y `prioridad`; admite `pagina` y `limite`. |
| `GET /api/incidentes/eliminados` | Administrador | Lista incidentes eliminados lógicamente. |
| `GET /api/incidentes/:id` | Lectura | Devuelve un incidente dentro del alcance permitido por el rol. |
| `POST /api/incidentes` | Crear | Crea un incidente; `usuarioId` se deriva de la sesión. |
| `PUT /api/incidentes/:id` | Editar | Reemplaza los campos validados del incidente. |
| `DELETE /api/incidentes/:id` | Eliminar | Marca el incidente como eliminado; responde `204`. |

Cuerpo de ejemplo para crear o actualizar:

```json
{
  "tituloIncidente": "Acceso sospechoso a cuenta",
  "tipo": "Acceso no autorizado",
  "sistemaAfectado": "Portal de ejemplo",
  "descripcion": "Se observó un inicio de sesión inusual que requiere investigación.",
  "prioridad": "ALTA",
  "estado": "ABIERTO"
}
```

Los valores de `estado` y `prioridad` deben coincidir con las enumeraciones indicadas. La paginación acepta `pagina` (mínimo 1) y `limite` (1–100, predeterminado 15). Si se envía cualquiera de los dos parámetros, la respuesta tiene el formato:

```json
{
  "datos": [],
  "pagina": 1,
  "limite": 15,
  "total": 0,
  "totalPaginas": 1
}
```

Sin parámetros de paginación, las listas devuelven un arreglo JSON.

### Usuarios

Todas las rutas de usuarios requieren rol `Administrador`.

| Método y ruta | Resultado |
| --- | --- |
| `GET /api/usuarios` | Lista usuarios; admite `pagina` y `limite`. |
| `GET /api/usuarios/:id` | Consulta un usuario por identificador. |
| `POST /api/usuarios` | Crea un usuario validado. |
| `PUT /api/usuarios/:id` | Actualiza un usuario validado. |
| `PATCH /api/usuarios/:id/estado` | Cambia `status` a `PENDING`, `ACTIVE`, `SUSPENDED` o `DELETED`. |
| `DELETE /api/usuarios/:id` | Marca al usuario como eliminado; responde `204`. |

## 10. Seguridad y permisos

- **Contraseñas:** se almacenan como hashes bcrypt; el factor de costo configurable está limitado a 10–14 y usa 12 por defecto.
- **JWT y sesión:** los tokens duran dos horas. `JWT_SECRET` debe ser aleatorio, tener al menos 32 caracteres y ser obligatorio en producción. La cookie `authToken` es `HttpOnly`, usa `Secure` en producción y `SameSite` configurable.
- **CSRF y orígenes:** las solicitudes mutables autenticadas por cookie requieren `X-CSRF-Token`, que se devuelve en el login. Se validan los orígenes de navegador contra `FRONTEND_URL`; configura el origen exacto.
- **Autorización:** administrador tiene permisos de lectura, creación, edición y eliminación; analista, lectura y creación; supervisor, lectura y edición. Administradores y supervisores pueden consultar el conjunto de incidentes; los analistas solo ven los propios. La consulta de incidentes eliminados está restringida a administradores.
- **Cabeceras y límites:** Helmet agrega cabeceras HTTP de seguridad; el middleware limita por defecto la API a 300 solicitudes por IP cada 15 minutos y el login a 4 intentos fallidos por IP por minuto.
- **Validación:** Zod verifica datos y enumeraciones; el cuerpo JSON tiene límite de 10 KB. No confíes en la validación exclusiva del frontend.
- **Eliminación y auditoría:** usuarios e incidentes se eliminan lógicamente. Eventos de auditoría y solicitudes se escriben en la salida estándar sin query strings ni credenciales.
- **Transporte:** la API no termina TLS. En producción, usa HTTPS mediante el proxy o proveedor, configura `TRUST_PROXY` según la topología y restringe el acceso a PostgreSQL.
- **Escalado:** tokens revocados y caché de estado de usuarios viven en memoria de proceso. No se comparten entre instancias y se pierden al reiniciar; el despliegue horizontal requiere mover esos datos a almacenamiento compartido, por ejemplo Redis.
- **Datos y secretos:** no registres ni publiques contraseñas, tokens, cookies, claves privadas o URLs de base de datos reales. Cambia o elimina usuarios de prueba antes de publicar.

También es posible enviar el JWT mediante `Authorization: Bearer <TOKEN_EJEMPLO>`. Para solicitudes mutables autenticadas por cookie, incluye `X-CSRF-Token`; si se utiliza autenticación Bearer no se activa la comprobación CSRF asociada a cookie.

## 11. Pruebas y comprobaciones

Ejecuta desde cada carpeta de proyecto:

```powershell
# backend
npm run lint
npm test
npm run test:jest
npm run audit:prod

# frontend
npm run lint
npm test
npm run build
```

Las pruebas HTTP del backend sustituyen el servicio de persistencia por memoria y comprueban rutas y controles de acceso sin modificar registros de la base configurada. Jest cubre reglas de negocio como visibilidad, borrado lógico y paginación. El frontend tiene pruebas unitarias de sus utilidades. `npm run test:jest:evidencia` está diseñado para producir fallos como demostración y no forma parte de la verificación normal.

Antes de producción, verifica además `GET /health`, las migraciones en una base de ensayo, el origen CORS, el uso de HTTPS y la navegación de la SPA después de recargar rutas internas.

## 12. Despliegue y operación

El repositorio incluye `render.yaml` para desplegar la API como servicio Node y el frontend como sitio estático:

- **API:** directorio raíz `backend`; build `npm ci && npm run build && npm run migrate:deploy`; inicio `npm start`; health check `/health`.
- **Frontend:** directorio raíz `frontend/mi-proyecto-plataformas`; build `npm ci && npm run build`; publica `dist/`; `VITE_API_URL` apunta al origen de la API.
- **Variables de producción:** configura `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` y `NODE_ENV=production` como variables protegidas. Configura `TRUST_PROXY=1` si corresponde. Si frontend y API usan dominios distintos, establece `COOKIE_SAMESITE=none`; el navegador exigirá HTTPS.
- **Base de datos:** usa PostgreSQL administrado y backups comprobables. Añade `sslmode=require` a la URL solo si el proveedor lo exige. La migración de producción se ejecuta durante el build configurado en Render.
- **SPA:** configura reescritura de rutas al documento de entrada del frontend; `render.yaml` ya define una regla de rewrite hacia `/index.html`.
- **Observabilidad:** revisa logs del proveedor y alertas del health check. El backend registra solicitudes estructuradas; protege el acceso a los logs y establece retención adecuada.

Para mantener el sistema, revisa las dependencias con `npm audit` (frontend) y `npm run audit:prod` (backend), aplica migraciones revisadas antes de desplegar y prueba el procedimiento de recuperación a partir de respaldos. La migración de hashes heredados debe ejecutarse por separado, con respaldo y confirmación expresa.

## Referencias del repositorio

- [README principal](./README.md): guía breve de instalación, variables, API y pruebas.
- [README del backend](./backend/README.md): procedimiento operativo para PostgreSQL y hashes heredados.
- [Esquema Prisma](./backend/prisma/schema.prisma): modelo persistente.
- [Configuración Render](./render.yaml): servicios y comandos de despliegue.