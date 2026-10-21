# Interfaz web de gestión de incidentes

Cliente React 19 y Vite para la plataforma de gestión de incidentes de ciberseguridad. Se comunica con la API Express del directorio `backend` y utiliza React Router para las vistas del panel.

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0`.
- npm.
- API backend configurada y disponible. Para los pasos de instalación local, consulta el [README principal](../../README.md).

## Instalación y desarrollo

Desde esta carpeta:

```bash
npm install
npm run dev
```

Vite muestra la dirección local del frontend, normalmente `http://localhost:5173`. En desarrollo, la API predeterminada es `http://localhost:3000`.

## Configuración

Opcionalmente, crea un archivo `.env` en esta carpeta para establecer la URL base de la API:

```dotenv
VITE_API_URL="http://localhost:3000"
```

`VITE_API_URL` debe ser la URL base, sin `/api`. En producción se define durante la compilación; si se omite, el cliente usa el mismo origen del sitio. Esta variable queda incorporada al código generado y no debe contener secretos.

## Funcionalidad

- Inicio de sesión y rutas del panel protegidas.
- Consulta, creación, edición y eliminación lógica de incidentes, con filtros y paginación local.
- Vistas administrativas de usuarios, usuarios fuera de servicio e incidentes eliminados, según permisos.
- Tema claro/oscuro y estado de sesión.

La sesión se valida con el backend. El JWT se conserva en una cookie `HttpOnly`; el almacenamiento local del navegador no es fuente de autorización y el servidor vuelve a comprobar los permisos.

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo de Vite. |
| `npm test` | Ejecuta las pruebas unitarias con el test runner de Node.js. |
| `npm run lint` | Ejecuta ESLint. |
| `npm run build` | Genera la versión de producción en `dist/`. |
| `npm run preview` | Sirve localmente la compilación para revisión. |
| `npm audit` | Revisa las dependencias del frontend. |

Antes de publicar, ejecuta `npm test`, `npm run lint`, `npm run build` y `npm audit`. Configura en el servicio de hosting las reglas de fallback a `index.html` para las rutas de la SPA; este repositorio incluye `public/_redirects`.
