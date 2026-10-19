# Plataforma de gestión de incidentes de ciberseguridad

Aplicación web para registrar y consultar incidentes de ciberseguridad. Incluye una API REST con autenticación y control de acceso, una interfaz React y persistencia en PostgreSQL mediante Prisma.

## Cambio de base de datos

Con fines prácticos y de portabilidad, la base de datos del proyecto se migró de MySQL a PostgreSQL. PostgreSQL cuenta con una oferta de servicio administrado en prácticamente todas las plataformas de despliegue (Render, Railway, Heroku, Fly.io, Supabase, Neon, AWS RDS, Google Cloud SQL, Azure, entre otras), con planes gratuitos o de bajo costo que facilitan las fases de prueba y académicas. Esto evita tener que montar y mantener un servidor de base de datos propio, y aporta respaldos automáticos, actualizaciones de seguridad, escalado y monitoreo gestionados por el proveedor.

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0` y npm (requisito de Vite).
- Docker Compose para iniciar PostgreSQL localmente, o una instancia PostgreSQL 14+ compatible.
- Git, si se clona el repositorio.

## Instalación y ejecución local

1. Inicia PostgreSQL desde la raíz del repositorio:

   ```bash
   docker compose -f backend/docker-compose.yml up -d
   ```

   El contenedor local crea la base `incidentes_ic` y el usuario `app_user`. Las credenciales que aparecen en `docker-compose.yml` son solo para desarrollo; no las uses en producción.

2. Configura el backend:

   ```bash
   cd backend
   npm install
   ```

   Copia `.env.example` a `.env` y configura las variables como se indica en [Variables de entorno](#variables-de-entorno). Para desarrollo local, usa `http://localhost:5173` como `FRONTEND_URL`.

3. Aplica las migraciones de la base de datos:

   ```bash
   npx prisma migrate deploy
   ```

4. Inicia la API desde `backend/`:

   ```bash
   npm run dev
   ```

   La API escucha por defecto en `http://localhost:3000`.

5. En otra terminal, instala e inicia el frontend:

   ```bash
   cd frontend/mi-proyecto-plataformas
   npm install
   npm run dev
   ```

   Vite muestra la dirección local, normalmente `http://localhost:5173`. El frontend usa `http://localhost:3000` para la API de forma predeterminada.

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `DATABASE_URL` | Sí | URL de conexión PostgreSQL con formato `postgresql://usuario:contraseña@host:puerto/base?schema=public`. Codifica caracteres especiales de usuario o contraseña como URL. |
| `JWT_SECRET` | Sí en producción | Secreto para firmar tokens; debe ser aleatorio y tener al menos 32 caracteres. Fuera de producción, si no está configurado, se genera un secreto temporal que cambia al reiniciar el proceso. |
| `FRONTEND_URL` | Sí en producción | Origen del frontend permitido por CORS. Usa, por ejemplo, `http://localhost:5173` en desarrollo y el origen HTTPS real en producción. |
| `NODE_ENV` | No | Usa `development`, `test` o `production`. El modo de producción requiere `JWT_SECRET` y un `FRONTEND_URL` HTTPS. |
| `PORT` | No | Puerto HTTP de la API; por defecto `3000`. |
| `LOGIN_MAX_INTENTOS` | No | Intentos de inicio de sesión permitidos por IP en la ventana; por defecto `4`. |
| `LOGIN_VENTANA_MIN` | No | Duración en minutos de la ventana del límite de login; por defecto `1`. |
| `API_MAX_PETICIONES` | No | Peticiones máximas por IP en la ventana general de la API; por defecto `300`. |
| `USER_STATUS_CACHE_TTL_MS` | No | Duración en ms de la caché del estado del usuario; por defecto `5000`, máximo `60000`, `0` la desactiva. |
| `BCRYPT_COST` | No | Costo de bcrypt, acotado entre `10` y `14`; por defecto `12`. |

Ejemplo de configuración local:

```dotenv
DATABASE_URL="postgresql://app_user:app_segura@localhost:5432/incidentes_ic?schema=public"
JWT_SECRET="secreto-local-aleatorio-de-al-menos-32-caracteres"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
PORT=3000
```

### Frontend (`frontend/mi-proyecto-plataformas/.env`)

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `VITE_API_URL` | No | URL base de la API, sin el sufijo `/api`; por defecto `http://localhost:3000`. |

Ejemplo:

```dotenv
VITE_API_URL="http://localhost:3000"
```

No publiques archivos `.env` ni reutilices secretos o credenciales locales en producción. `VITE_API_URL` se incorpora al cliente durante la compilación y no debe contener secretos.

## Comandos

Ejecuta los comandos de cada componente desde su propia carpeta.

### Backend (`backend/`)

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia la API con recarga automática (`node --watch`). |
| `npm test` | Ejecuta las pruebas de API con el test runner integrado de Node.js. |
| `npm run test:jest` | Ejecuta las pruebas de reglas de negocio con Jest. |
| `npm run test:jest:evidencia` | Ejecuta pruebas que **deben fallar** (2) para demostrar que la suite detecta errores. |
| `npm run lint` | Ejecuta ESLint sobre el backend. |
| `npm run audit:prod` | Audita las dependencias de producción. |
| `npm run migrate:passwords` | Revisa hashes heredados de contraseñas; la migración requiere confirmación explícita. |
| `npx prisma migrate deploy` | Aplica las migraciones pendientes a la base configurada. |

`migrate:passwords` primero muestra un conteo sin modificar datos. Antes de ejecutar la migración real, respalda la base y confirma el entorno. Luego establece `CONFIRM_LEGACY_PASSWORD_HASH_MIGRATION=true` solo para esa ejecución; consulta `backend/README.md` para el procedimiento PowerShell detallado.

### Frontend (`frontend/mi-proyecto-plataformas/`)

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo de Vite. |
| `npm run build` | Genera la compilación de producción en `dist/`. |
| `npm run preview` | Sirve localmente la compilación generada. |
| `npm run lint` | Ejecuta ESLint sobre el proyecto. |
| `npm test` | Ejecuta las pruebas unitarias de utilidades. |

## API REST

Todas las rutas de negocio están bajo `/api`. `GET /health` es público y comprueba la disponibilidad de la API y de PostgreSQL; devuelve `200` si ambas están disponibles y `503` si falla la base de datos. Salvo el inicio y cierre de sesión, las rutas de negocio requieren sesión autenticada: el JWT viaja en una cookie `HttpOnly` (`authToken`, `SameSite=Strict`, `Secure` en producción) o en la cabecera `Authorization: Bearer <token>`. Con cookie, las peticiones que modifican datos exigen además la cabecera `X-CSRF-Token` con el valor devuelto por el login. La sesión dura 2 horas y los errores se devuelven como JSON.

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Público (límite de intentos) | Inicia sesión con `email` y `password`; establece la cookie de sesión y devuelve `csrfToken`, `expiraEn` y los datos públicos del usuario. |
| `POST` | `/api/auth/logout` | Público | Cierra la sesión: revoca el token y borra la cookie. |
| `GET` | `/api/incidentes` | Autenticado, permiso de lectura | Lista incidentes; acepta los filtros opcionales `estado` y `prioridad` y la paginación `pagina` y `limite` (máximo 100; sin ellos devuelve un arreglo). |
| `GET` | `/api/incidentes/eliminados` | Solo administrador | Lista incidentes eliminados lógicamente; admite paginación. |
| `GET` | `/api/incidentes/:id` | Autenticado, permiso de lectura | Consulta un incidente por ID, sujeto al alcance del rol. |
| `POST` | `/api/incidentes` | Autenticado, permiso de creación | Crea un incidente. |
| `PUT` | `/api/incidentes/:id` | Autenticado, permiso de edición | Actualiza un incidente. |
| `DELETE` | `/api/incidentes/:id` | Autenticado, permiso de eliminación | Elimina lógicamente un incidente. |
| `GET` | `/api/usuarios` | Solo administrador | Lista usuarios. |
| `GET` | `/api/usuarios/:id` | Solo administrador | Consulta un usuario. |
| `POST` | `/api/usuarios` | Solo administrador | Crea un usuario. |
| `PUT` | `/api/usuarios/:id` | Solo administrador | Actualiza un usuario. |
| `PATCH` | `/api/usuarios/:id/estado` | Solo administrador | Cambia el estado de un usuario. |
| `DELETE` | `/api/usuarios/:id` | Solo administrador | Marca al usuario como eliminado. |

Las solicitudes HTTP se registran como JSON en la salida estándar, sin incluir query strings ni credenciales. Render recoge esa salida en los logs del servicio; la retención disponible depende del plan de Render.

Los roles admitidos son `Administrador`, `Analista` y `Supervisor`. Los incidentes tienen tipo, prioridad (`BAJA`, `MEDIA`, `ALTA`, `CRITICA`) y estado (`ABIERTO`, `EN_PROCESO`, `CERRADO`). Administradores y supervisores pueden consultar el conjunto de incidentes; los analistas trabajan con los propios. La autorización efectiva de cada operación se aplica en la API.

## Modelos de datos

- **Usuario**: `id`, nombre, apellido, email único, contraseña almacenada como hash, rol, estado (`PENDING`, `ACTIVE`, `SUSPENDED`, `DELETED`) y marcas de tiempo. Solo las cuentas activas pueden iniciar sesión. La eliminación es lógica.
- **Incidente**: `id`, título, tipo, sistema afectado opcional, descripción, prioridad, estado, fecha de creación y actualización, usuario propietario y fecha opcional de eliminación lógica.

Prisma define los modelos en `backend/prisma/schema.prisma`; los cambios de esquema se versionan en `backend/prisma/migrations/`. Las validaciones de entrada de la API usan Zod.

## Dependencias externas y arquitectura

- **React, React DOM y React Router** construyen la interfaz de usuario y su navegación.
- **Vite**, junto con sus complementos para React y Tailwind CSS, desarrolla y compila el frontend.
- **Express** expone la API; **Helmet** añade cabeceras de seguridad, **express-rate-limit** limita las peticiones, **CORS** restringe los orígenes permitidos y **Zod** valida los datos recibidos.
- **Prisma Client** con el adaptador `@prisma/adapter-pg` conecta la API a PostgreSQL.
- **bcryptjs** verifica y genera hashes de contraseñas; **jsonwebtoken** gestiona tokens de sesión.

El código del backend separa rutas, controladores y servicios: las rutas aplican autenticación, autorización y validación; los controladores gestionan el intercambio HTTP y los servicios encapsulan el acceso a datos. Esta separación mantiene las reglas de acceso y persistencia fuera del manejo de transporte. Los incidentes y usuarios se eliminan lógicamente para conservar sus registros y relaciones en la base.

En producción, despliega la API detrás de un proxy o servicio de entrada que gestione HTTPS, configure correctamente los encabezados de proxy y proteja la base de datos. La API no termina TLS directamente. Configura el origen HTTPS exacto del frontend y credenciales seguras fuera del repositorio.

## Despliegue

Variables y comandos para producción (backend):

| Elemento | Valor |
| --- | --- |
| Build | `npm ci && npm run build && npm run migrate:deploy` |
| Inicio | `npm start` |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | URL de la base PostgreSQL administrada (con `?sslmode=require` si el proveedor lo exige). |
| `JWT_SECRET`, `FRONTEND_URL` | Obligatorios en producción; `FRONTEND_URL` es el origen HTTPS exacto del frontend. |
| `TRUST_PROXY` | `1` si la API está detrás de un proxy del proveedor, para que los límites usen la IP real del cliente. |
| `COOKIE_SAMESITE` | `strict` si frontend y API comparten dominio; `none` si están en dominios distintos (requiere HTTPS). |

Render utiliza `GET /health` para comprobar la disponibilidad de la API y la conexión PostgreSQL antes de enrutar tráfico.

Frontend: define `VITE_API_URL` al compilar (si se omite en producción, usa el mismo origen). El repositorio incluye `public/_redirects` y `vercel.json` para que las rutas de la SPA funcionen al recargar. Define una Content-Security-Policy en el servidor web con la URL de la API en `connect-src`.

Limitaciones conocidas: la lista de tokens revocados (cierre de sesión) y la caché del estado de usuario viven en la memoria del proceso. Con más de una instancia o tras un reinicio no se comparten; para escalar horizontalmente muévelas a un almacén compartido como Redis. Cambia o elimina cualquier usuario de prueba antes de publicar.

## Estructura del repositorio

```text
.
├── backend/
│   ├── prisma/
│   │   ├── migrations/             # Historial de cambios de base de datos
│   │   └── schema.prisma           # Modelos y enums de persistencia
│   ├── scripts/                    # Tareas operativas, como hashes heredados
│   ├── src/
│   │   ├── config/                 # Configuración JWT y de sesión (cookie)
│   │   ├── controllers/            # Manejadores HTTP
│   │   ├── database/               # Cliente Prisma y conexión
│   │   ├── middlewares/            # Autenticación, CSRF, límites, permisos, validación y errores
│   │   ├── models/                 # Esquemas de validación y roles
│   │   ├── routes/                 # Rutas de autenticación, incidentes y usuarios
│   │   ├── services/               # Acceso y reglas de persistencia
│   │   └── utils/                  # Paginación, auditoría, caché de estado y tokens revocados
│   ├── tests/                      # Pruebas de API (node:test) y de reglas de negocio (Jest)
│   ├── eslint.config.mjs           # Configuración de ESLint
│   ├── .env.example                # Plantilla de configuración del backend
│   └── docker-compose.yml          # PostgreSQL local
├── frontend/
│   └── mi-proyecto-plataformas/
│       └── src/
│           ├── components/         # Componentes compartidos
│           ├── hooks/              # Hooks de React
│           ├── pages/              # Vistas de la aplicación
│           ├── services/           # Clientes HTTP de la API
│           └── utils/              # Sesión y tema
└── README.md
```

## Pruebas

Las pruebas de API se ejecutan con `npm test` desde `backend/`. La prueba de incidentes sustituye los métodos del servicio de persistencia por implementaciones en memoria, por lo que el ciclo CRUD probado no modifica datos de PostgreSQL. `npm run test:jest` valida reglas de negocio (visibilidad por rol, borrado lógico y paginación). En `frontend/mi-proyecto-plataformas/`, `npm test` ejecuta las pruebas unitarias de utilidades.

Antes de publicar, ejecuta `npm run lint`, `npm test`, `npm run test:jest` y `npm run audit:prod` en el backend, y `npm run lint`, `npm test`, `npm run build` y `npm audit` en el frontend.
