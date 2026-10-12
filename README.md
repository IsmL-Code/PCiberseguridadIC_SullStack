# Plataforma de gestión de incidentes de ciberseguridad

Aplicación web para registrar y consultar incidentes de ciberseguridad. Incluye una API REST con autenticación y control de acceso, una interfaz React y persistencia en MySQL mediante Prisma.

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0` y npm (requisito de Vite).
- Docker Compose para iniciar MySQL localmente, o una instancia MySQL 8 compatible.
- Git, si se clona el repositorio.

## Instalación y ejecución local

1. Inicia MySQL desde la raíz del repositorio:

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
| `DATABASE_URL` | Sí | URL de conexión MySQL con formato `mysql://usuario:contraseña@host:puerto/base`. Codifica caracteres especiales de usuario o contraseña como URL. |
| `JWT_SECRET` | Sí en producción | Secreto para firmar tokens; debe ser aleatorio y tener al menos 32 caracteres. Fuera de producción, si no está configurado, se genera un secreto temporal que cambia al reiniciar el proceso. |
| `FRONTEND_URL` | Sí en producción | Origen del frontend permitido por CORS. Usa, por ejemplo, `http://localhost:5173` en desarrollo y el origen HTTPS real en producción. |
| `NODE_ENV` | No | Usa `development`, `test` o `production`. El modo de producción requiere `JWT_SECRET` y un `FRONTEND_URL` HTTPS. |
| `PORT` | No | Puerto HTTP de la API; por defecto `3000`. |

Ejemplo de configuración local:

```dotenv
DATABASE_URL="mysql://app_user:app_segura@localhost:3306/incidentes_ic"
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
| `npm run dev` | Inicia la API con recarga automática mediante Nodemon. |
| `npm test` | Ejecuta las pruebas con el test runner integrado de Node.js. |
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

## API REST

Todas las rutas están bajo `/api`. Salvo el inicio de sesión, requieren un token JWT en `Authorization: Bearer <token>`. Los errores se devuelven como JSON.

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Público | Inicia sesión con `email` y `password`; devuelve el token y los datos públicos del usuario. |
| `GET` | `/api/incidentes` | Autenticado, permiso de lectura | Lista incidentes; acepta los filtros opcionales `estado` y `prioridad`. |
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

Los roles admitidos son `Administrador`, `Analista` y `Supervisor`. Los incidentes tienen tipo, prioridad (`BAJA`, `MEDIA`, `ALTA`, `CRITICA`) y estado (`ABIERTO`, `EN_PROCESO`, `CERRADO`). Administradores y supervisores pueden consultar el conjunto de incidentes; los analistas trabajan con los propios. La autorización efectiva de cada operación se aplica en la API.

## Modelos de datos

- **Usuario**: `id`, nombre, apellido, email único, contraseña almacenada como hash, rol, estado (`PENDING`, `ACTIVE`, `SUSPENDED`, `DELETED`) y marcas de tiempo. Solo las cuentas activas pueden iniciar sesión. La eliminación es lógica.
- **Incidente**: `id`, título, tipo, sistema afectado opcional, descripción, prioridad, estado, fecha de creación y actualización, usuario propietario y fecha opcional de eliminación lógica.

Prisma define los modelos en `backend/prisma/schema.prisma`; los cambios de esquema se versionan en `backend/prisma/migrations/`. Las validaciones de entrada de la API usan Zod.

## Dependencias externas y arquitectura

- **React, React DOM y React Router** construyen la interfaz de usuario y su navegación.
- **Vite**, junto con sus complementos para React y Tailwind CSS, desarrolla y compila el frontend.
- **Express** expone la API; **CORS** restringe los orígenes permitidos y **Zod** valida los datos recibidos.
- **Prisma Client** con el adaptador MariaDB/MySQL conecta la API a MySQL.
- **bcryptjs** verifica y genera hashes de contraseñas; **jsonwebtoken** gestiona tokens de sesión.

El código del backend separa rutas, controladores y servicios: las rutas aplican autenticación, autorización y validación; los controladores gestionan el intercambio HTTP y los servicios encapsulan el acceso a datos. Esta separación mantiene las reglas de acceso y persistencia fuera del manejo de transporte. Los incidentes y usuarios se eliminan lógicamente para conservar sus registros y relaciones en la base.

En producción, despliega la API detrás de un proxy o servicio de entrada que gestione HTTPS, configure correctamente los encabezados de proxy y proteja la base de datos. La API no termina TLS directamente. Configura el origen HTTPS exacto del frontend y credenciales seguras fuera del repositorio.

## Estructura del repositorio

```text
.
├── backend/
│   ├── prisma/
│   │   ├── migrations/             # Historial de cambios de base de datos
│   │   └── schema.prisma           # Modelos y enums de persistencia
│   ├── scripts/                    # Tareas operativas, como hashes heredados
│   ├── src/
│   │   ├── config/                 # Configuración JWT
│   │   ├── controllers/            # Manejadores HTTP
│   │   ├── database/               # Cliente Prisma y conexión
│   │   ├── middlewares/            # Autenticación, permisos, validación y errores
│   │   ├── models/                 # Esquemas de validación y roles
│   │   ├── routes/                 # Rutas de autenticación, incidentes y usuarios
│   │   ├── services/               # Acceso y reglas de persistencia
│   │   └── utils/                  # Utilidades de validación
│   ├── tests/                      # Pruebas de API
│   ├── .env.example                # Plantilla de configuración del backend
│   └── docker-compose.yml          # MySQL local
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

Las pruebas de API se ejecutan con `npm test` desde `backend/`. La prueba de incidentes sustituye los métodos del servicio de persistencia por implementaciones en memoria, por lo que el ciclo CRUD probado no modifica datos de MySQL. Hay pruebas de utilitarios del frontend junto a su código, pero actualmente `package.json` no define un comando para ejecutarlas.
