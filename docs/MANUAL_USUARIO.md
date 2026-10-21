# Manual de usuario

**Plataforma de gestión de incidentes de ciberseguridad (PCiberseguridadIC)**

Estudiante: Jefferson Ismael Condo Cepeda · Asignatura: Desarrollo en Plataformas V · PUCE Virtual
Versión: 1.0 · Fecha: 21/10/2026
URL de la plataforma: debe ser proporcionada por el administrador del despliegue (usar siempre HTTPS).

## 1. Para qué sirve

La plataforma permite que un equipo de seguridad registre, consulte, actualice y cierre incidentes de ciberseguridad (por ejemplo, un intento de phishing o un acceso no autorizado), y que un administrador gestione las cuentas de quienes la usan. Todo queda guardado en una base de datos, por lo que la información no se pierde al reiniciar el servicio.

## 2. Roles y permisos

El rol lo valida el servidor: aunque un botón no aparezca, la acción tampoco se puede ejecutar por otros medios.

| Acción | Administrador | Supervisor | Analista |
| --- | --- | --- | --- |
| Consultar incidentes | Todos | Todos | Solo los propios |
| Crear incidentes | Sí | No | Sí |
| Editar incidentes | Sí | Sí | No |
| Eliminar incidentes | Sí | No | No |
| Ver incidentes eliminados | Sí | No | No |
| Gestionar usuarios | Sí | No | No |

## 3. Acceso

### 3.1 Iniciar sesión

1. Abra la URL de la plataforma (debe empezar con `https://`).
2. Escriba su **correo electrónico** y su **contraseña**.
3. Pulse **Ingresar**. Verá el **Panel de monitoreo**; su nombre aparece arriba a la derecha junto al botón **Salir**.

### 3.2 Mensajes al ingresar

| Mensaje | Qué significa | Qué hacer |
| --- | --- | --- |
| «Credenciales inválidas» | Correo o contraseña incorrectos, o cuenta aún no activa | Revise los datos; si son correctos, pida a un administrador que active su cuenta |
| «Demasiados intentos de inicio de sesión. Intenta de nuevo más tarde.» | Se superó el límite de intentos fallidos | Espere unos minutos |
| Regreso a la pantalla de inicio de sesión | La sesión venció (dura 2 horas) o fue cerrada | Inicie sesión de nuevo |

Una cuenta nueva queda en estado **Pendiente** y no puede ingresar hasta que un administrador la cambie a **Activo**.

### 3.3 Cerrar sesión

Pulse **Salir**, arriba a la derecha. Hágalo siempre en equipos compartidos.

## 4. Panel de monitoreo

Muestra cuatro tarjetas: **Incidentes totales**, **Severidad crítica**, **En proceso** y **Resultados** (cantidad de incidentes cerrados). Debajo está el **Registro de incidentes**, con título, tipo, sistema afectado, prioridad, estado y descripción. El botón de sol/luna cambia entre tema claro y oscuro.

## 5. Gestión de incidentes

### 5.1 Crear un incidente

1. Pulse **Crear nuevo registro**.
2. Complete el formulario:
   - **Título:** al menos 5 caracteres, como palabra o frase legible.
   - **Tipo:** Phishing, Malware, Ransomware, Fuerza bruta, Acceso no autorizado, Fuga de información, Denegación de servicio, Ingeniería social u Otro.
   - **Sistema afectado:** servidor, aplicación o equipo comprometido.
   - **Prioridad:** Baja, Media, Alta o Crítica.
   - **Estado:** Abierto, En proceso o Cerrado.
   - **Descripción:** entre 10 y 2000 caracteres.
3. Pulse **Guardar**. El incidente aparece en la tabla y los contadores se actualizan.

### 5.2 Buscar y filtrar

Use el cuadro de búsqueda para buscar por ID, título, tipo o descripción, y los desplegables **Todas las prioridades** y **Todos los estados**.

### 5.3 Editar

1. Pulse el botón amarillo de **editar** (lápiz) en la fila del incidente.
2. Modifique los campos (los datos actuales aparecen cargados) y pulse **Guardar**.

Para cerrar un caso, cambie su **Estado** a *Cerrado*.

### 5.4 Eliminar

1. Pulse el botón rojo de **eliminar** (papelera).
2. Revise el título y la prioridad que aparecen en la confirmación y pulse **Aceptar**, o cancele.

La eliminación es **lógica**: el incidente sale de la lista normal pero se conserva para auditoría. Solo el administrador lo ve en **Incidentes eliminados** (menú lateral).

### 5.5 Mensajes de validación

Si un campo no cumple las reglas, el formulario no se guarda y aparece un aviso general en la parte superior de la pantalla. Por ejemplo, un título como «asdfgh» se rechaza con «Debe ser una palabra o frase legible, no una secuencia aleatoria de letras o números». Corrija el campo indicado en el aviso y guarde de nuevo.

## 6. Gestión de usuarios (solo Administrador)

Desde el menú lateral: **Registrar nuevo usuario** y **Usuarios fuera de servicio**.

1. **Crear:** pulse **Registrar nuevo usuario**; complete nombre, apellido, correo, contraseña y rol (Administrador, Analista o Supervisor); pulse **Guardar**. La contraseña debe tener entre 8 y 72 caracteres, sin espacios, e incluir mayúscula, minúscula, número y símbolo. No puede contener secuencias comunes ni el nombre, apellido o parte inicial del correo. Repita la contraseña en el campo de confirmación. La cuenta queda *Pendiente*.
2. **Activar, modificar o suspender:** pulse **editar** en la lista; cambie los datos o el **Estado** (*Pendiente*, *Activo*, *Suspendido*). La contraseña es opcional: déjela vacía para conservar la actual.
3. **Marcar fuera de servicio:** pulse el botón rojo y confirme. El usuario deja de poder ingresar, pero su registro se conserva para auditorías.

Solo los usuarios **Activos** pueden iniciar sesión.

## 7. Problemas frecuentes

| Situación | Posible causa | Solución |
| --- | --- | --- |
| No puedo ingresar con datos correctos | Cuenta Pendiente o Suspendida | Pida a un administrador que la active |
| Me bloquea por demasiados intentos | Límite de intentos de login | Espere unos minutos |
| No veo todos los incidentes | Su rol es Analista | Los analistas solo ven los que crearon |
| No aparece el botón de crear, editar o eliminar | Su rol no tiene ese permiso | Consulte la tabla de la sección 2 |
| La página tarda en abrir la primera vez | El servicio en la nube se reactiva tras un tiempo sin uso | Espere unos segundos y recargue |
| Volví a la pantalla de inicio de sesión | La sesión venció | Inicie sesión de nuevo |
| Un formulario no se guarda | Algún campo no cumple las reglas | Lea el aviso general que aparece en la parte superior y corrija el campo indicado |

## 8. Uso seguro

- Use una contraseña única y no la comparta.
- Cierre sesión al terminar, sobre todo en equipos compartidos.
- No escriba contraseñas, tokens ni datos personales reales en la descripción de un incidente.
- Verifique que la dirección comience con `https://` antes de ingresar sus datos.

## 9. Cuentas de demostración

Las cuentas de demostración dependen del entorno desplegado y no se incluyen en este documento.