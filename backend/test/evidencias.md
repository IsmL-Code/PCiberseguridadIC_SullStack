# Evidencias de pruebas automatizadas

**Comando:** `npm test`  
**Directorio:** `backend`  
**Runner:** Node.js `node:test`  
**Última ejecución verificada:** 2026-10-08  
**Resultado:** 8 pruebas aprobadas, 0 fallidas.

| N.º | Caso ejecutado | Resultado observado |
|---:|---|---|
| 1 | GET de incidentes sin token | HTTP 401 |
| 2 | GET con token Bearer inválido | HTTP 401 |
| 3 | Analista intenta eliminar un incidente | HTTP 403 |
| 4 | Administrador consulta desde `http://localhost:5173` | HTTP 200; `Access-Control-Allow-Origin` coincide con el origen permitido |
| 5 | Ciclo CRUD HTTP: POST, GET lista, GET detalle, PUT y DELETE | HTTP 201 para crear, HTTP 200 para consultar/actualizar y HTTP 204 para eliminar |
| 6 | POST con título `SELEC FROM #` | HTTP 400; el almacén de prueba queda sin registros |
| 7 | GET con filtro de estado no admitido | HTTP 400 |
| 8 | Solicitud desde origen no autorizado | No se devuelve `Access-Control-Allow-Origin`; el cliente de pruebas, que sí presenta credenciales, recibe respuesta HTTP 200 |

La prueba del origen no autorizado verifica el control CORS del navegador, no autorización de API: CORS no bloquea clientes que no sean navegadores. La suite reemplaza las funciones de persistencia por un almacén en memoria, así que no modifica la base configurada ni acredita por sí sola persistencia MySQL.

**Verificaciones adicionales:** `npm run lint` y `npm run build` completaron sin errores desde `frontend/mi-proyecto-plataformas`. La migración local de contraseña reportó una cuenta convertida a bcrypt; la ejecución posterior en modo de consulta reportó cero contraseñas heredadas pendientes. No se incluyeron secretos, contraseñas, tokens ni datos personales en este archivo.
