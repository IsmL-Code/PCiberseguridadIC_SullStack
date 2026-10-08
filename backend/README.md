# Backend de la plataforma

## Configuración

Configura `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV` y `PORT` en el entorno o en un archivo `.env` local no versionado. En producción, `JWT_SECRET` es obligatorio y debe contener al menos 32 caracteres aleatorios; `FRONTEND_URL` debe ser el origen HTTPS exacto del cliente. No copies una clave de ejemplo a producción ni subas secretos al repositorio.

Para desarrollo, instala dependencias con `npm install` y ejecuta `npm run dev`. Si `JWT_SECRET` no está configurado fuera de producción, se crea una clave aleatoria temporal para el proceso; los tokens dejan de servir cuando el proceso se reinicia.

## Migrar contraseñas heredadas

El inicio de sesión solo acepta contraseñas bcrypt. Primero ejecuta `npm run migrate:passwords` para obtener un conteo sin modificar la base. Haz un respaldo y verifica el entorno de base de datos antes de migrar. Después, confirma expresamente la operación:

```powershell
$env:CONFIRM_LEGACY_PASSWORD_HASH_MIGRATION = "true"
npm run migrate:passwords
Remove-Item Env:CONFIRM_LEGACY_PASSWORD_HASH_MIGRATION
```

El script omite hashes bcrypt ya existentes, aplica bcrypt con factor 12 al resto y no imprime contraseñas ni sus hashes. Repetirlo no vuelve a transformar contraseñas ya migradas.

## Pruebas

Desde esta carpeta, ejecuta `npm test`. La suite HTTP usa servicios de persistencia en memoria, por lo que no crea, actualiza ni elimina datos de la base configurada. Incluye autenticación, permisos, CORS, validación de entradas y el ciclo CRUD.

## HTTPS y despliegue

En producción, publica la API detrás de un proxy inverso o servicio de entrada que gestione certificados TLS vigentes. Redirige HTTP a HTTPS, habilita TLS moderno, renueva certificados automáticamente y evita exponer directamente el puerto de Express a Internet. Configura el proxy para reenviar `Authorization`, limitar solicitudes y establecer los encabezados de proxy confiables según la plataforma. Configura `FRONTEND_URL` con el origen exacto HTTPS del cliente. No se deben tratar las URL locales de desarrollo como orígenes permitidos de producción.

La API no termina TLS por sí misma: la verificación de HTTPS, la redirección, los certificados y los encabezados deben probarse en el entorno donde se despliega.
