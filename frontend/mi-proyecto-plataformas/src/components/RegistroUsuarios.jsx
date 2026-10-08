import { useEffect, useMemo, useState } from "react";
import { actualizarUsuario, crearUsuario, eliminarUsuario, listarUsuarios } from "../services/usuariosApi";

const formularioVacio = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  rol: "",
  status: "PENDING"
};

const etiquetasEstado = {
  PENDING: "Pendiente",
  ACTIVE: "Activo"
};

function fechaLegible(fecha) {
  if (!fecha) return "—";
  const fechaValida = new Date(fecha);
  return Number.isNaN(fechaValida.getTime())
    ? fecha
    : fechaValida.toLocaleDateString("es-EC", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default function RegistroUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState(formularioVacio);
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const usuariosVisibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return usuarios.filter((usuario) => {
      if (usuario.status !== "PENDING" && usuario.status !== "ACTIVE") return false;
      if (!termino) return true;
      return [usuario.id, usuario.nombre, usuario.apellido, usuario.email, usuario.rol, etiquetasEstado[usuario.status]]
        .some((valor) => String(valor || "").toLowerCase().includes(termino));
    });
  }, [usuarios, busqueda]);

  useEffect(() => {
    let activo = true;

    listarUsuarios()
      .then((datos) => {
        if (activo) setUsuarios(datos);
      })
      .catch((err) => {
        if (activo) setError(err.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
    setError("");
    setMensaje("");
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setUsuarioEnEdicion(null);
    setFormulario(formularioVacio);
    setConfirmarPassword("");
    setMostrarPassword(false);
    setMostrarConfirmarPassword(false);
    setError("");
  };

  const abrirFormulario = (usuario = null) => {
    setUsuarioEnEdicion(usuario);
    setFormulario(usuario
      ? {
          nombre: usuario.nombre || "",
          apellido: usuario.apellido || "",
          email: usuario.email || "",
          password: "",
          rol: usuario.rol || "",
          status: usuario.status || "PENDING"
        }
      : formularioVacio);
    setConfirmarPassword("");
    setMostrarPassword(false);
    setMostrarConfirmarPassword(false);
    setError("");
    setMensaje("");
    setMostrarFormulario(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMensaje("");

    if (!usuarioEnEdicion && formulario.password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setGuardando(true);

    try {
      const datosUsuario = {
        ...formulario,
        nombre: formulario.nombre.trim(),
        apellido: formulario.apellido.trim(),
        email: formulario.email.trim().toLowerCase(),
        rol: formulario.rol.trim()
      };

      if (usuarioEnEdicion && !datosUsuario.password) {
        delete datosUsuario.password;
      }

      if (usuarioEnEdicion) {
        const usuarioActualizado = await actualizarUsuario(usuarioEnEdicion.id, datosUsuario);
        setUsuarios((actuales) => actuales.map((usuario) => (
          usuario.id === usuarioActualizado.id ? usuarioActualizado : usuario
        )));
        setMensaje("Usuario modificado satisfactoriamente.");
      } else {
        const usuarioCreado = await crearUsuario(datosUsuario);
        setUsuarios((actuales) => [usuarioCreado, ...actuales]);
        setMensaje("Usuario registrado satisfactoriamente.");
      }
      cerrarFormulario();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminacion = async () => {
    if (!usuarioAEliminar) return;

    setError("");
    setMensaje("");
    setEliminando(true);
    try {
      await eliminarUsuario(usuarioAEliminar.id);
      setUsuarios((actuales) => actuales.map((usuario) => (
        usuario.id === usuarioAEliminar.id
          ? { ...usuario, status: "DELETED", deletedAt: new Date().toISOString() }
          : usuario
      )));
      setMensaje("Usuario marcado fuera de servicio.");
      setUsuarioAEliminar(null);
    } catch (err) {
      setError(err.message);
      setUsuarioAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <section className="dashboard-records user-records" aria-labelledby="titulo-usuarios">
      <div className="dashboard-records__heading user-records__heading">
        <div>
          <h2 id="titulo-usuarios">Registro de usuarios</h2>
          <p>Consulta los usuarios registrados o agrega uno nuevo a la plataforma.</p>
        </div>
        <button
          type="button"
          className="btn-crear"
          onClick={() => mostrarFormulario ? cerrarFormulario() : abrirFormulario()}
          aria-expanded={mostrarFormulario}
          aria-controls="formulario-usuario"
        >
          <span aria-hidden="true" className="btn-crear__plus">{mostrarFormulario ? "−" : "+"}</span>
          {mostrarFormulario ? "Cancelar" : "Registrar nuevo usuario"}
        </button>
      </div>

      {mensaje && <p className="dashboard-message dashboard-message--success" role="status">{mensaje}</p>}
      {error && <p className="dashboard-message dashboard-message--error" role="alert">{error}</p>}

      {mostrarFormulario && (
        <div className="user-form-overlay" role="presentation">
          <form
            id="formulario-usuario"
            className="user-form"
            onSubmit={handleSubmit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-formulario-usuario"
          >
            <h3 id="titulo-formulario-usuario" className="user-form__title">
              {usuarioEnEdicion ? "Modificar usuario" : "Registrar nuevo usuario"}
            </h3>
            <p className="user-form__description">
              {usuarioEnEdicion ? "Actualiza los datos de la cuenta." : "Completa los datos para crear una cuenta en la plataforma."}
            </p>
            {error && <p className="dashboard-message dashboard-message--error user-form__error" role="alert">{error}</p>}
            <label className="user-form__field">
              <span>Nombre</span>
              <input name="nombre" value={formulario.nombre} onChange={handleChange} maxLength={100} autoComplete="given-name" required />
            </label>
            <label className="user-form__field">
              <span>Apellido</span>
              <input name="apellido" value={formulario.apellido} onChange={handleChange} maxLength={100} autoComplete="family-name" required />
            </label>
            <label className="user-form__field">
              <span>Correo electrónico</span>
              <input name="email" type="email" value={formulario.email} onChange={handleChange} maxLength={100} autoComplete="email" required />
            </label>
            <label className="user-form__field">
              <span>
                Contraseña{" "}
                <small>
                  {usuarioEnEdicion ? "(opcional; déjala vacía para conservarla)" : "(mínimo 8 caracteres)"}
                </small>
              </span>
              <div className="user-password-input">
                <input
                  name="password"
                  type={mostrarPassword ? "text" : "password"}
                  value={formulario.password}
                  onChange={handleChange}
                  minLength={8}
                  autoComplete="new-password"
                  required={!usuarioEnEdicion}
                  aria-label="Contraseña"
                />
                <button
                  type="button"
                  className="user-password-toggle"
                  onClick={() => setMostrarPassword((visible) => !visible)}
                  aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={mostrarPassword}
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {mostrarPassword ? (
                      <>
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    ) : (
                      <>
                        <path d="m3 3 18 18" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.1 3.8" />
                        <path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10.5 10.5 0 0 0 4-.8" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </label>
            {!usuarioEnEdicion && (
              <label className="user-form__field">
                <span>Reescribir contraseña</span>
                <div className="user-password-input">
                  <input
                    type={mostrarConfirmarPassword ? "text" : "password"}
                    value={confirmarPassword}
                    onChange={(event) => {
                      setConfirmarPassword(event.target.value);
                      setError("");
                    }}
                    minLength={8}
                    autoComplete="new-password"
                    required
                    aria-label="Reescribir contraseña"
                    aria-invalid={Boolean(confirmarPassword && formulario.password !== confirmarPassword)}
                    aria-describedby="confirmar-password-ayuda"
                  />
                  <button
                    type="button"
                    className="user-password-toggle"
                    onClick={() => setMostrarConfirmarPassword((visible) => !visible)}
                    aria-label={mostrarConfirmarPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
                    aria-pressed={mostrarConfirmarPassword}
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {mostrarConfirmarPassword ? (
                        <>
                          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      ) : (
                        <>
                          <path d="m3 3 18 18" />
                          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                          <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.1 3.8" />
                          <path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10.5 10.5 0 0 0 4-.8" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                <small id="confirmar-password-ayuda" className={confirmarPassword && formulario.password !== confirmarPassword ? "user-password-mismatch" : ""} aria-live="polite">
                  {confirmarPassword && formulario.password !== confirmarPassword ? "Las contraseñas no coinciden." : "Repite la contraseña para confirmarla."}
                </small>
              </label>
            )}
            <label className="user-form__field">
              <span>Rol</span>
              <select name="rol" value={formulario.rol} onChange={handleChange} required>
                <option value="">Selecciona un rol</option>
                <option value="Analista">Analista</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Administrador">Administrador</option>
              </select>
            </label>
            {usuarioEnEdicion && (
              <label className="user-form__field">
                <span>Estado</span>
                <select name="status" value={formulario.status} onChange={handleChange} required>
                  <option value="PENDING">Pendiente</option>
                  <option value="ACTIVE">Activo</option>
                  <option value="SUSPENDED">Suspendido</option>
                </select>
              </label>
            )}
            <div className="user-form__actions">
              <button type="button" className="user-form__cancel" onClick={cerrarFormulario} disabled={guardando}>
                Cancelar
              </button>
              <button type="submit" className="btn-crear user-form__submit" disabled={guardando}>
                {guardando ? "Guardando..." : usuarioEnEdicion ? "Guardar cambios" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="incidentes-toolbar user-status-toolbar">
        <label className="incidentes-search">
          <span className="visually-hidden">Buscar usuario</span>
          <input
            className="incidentes-search__input"
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por nombre, correo, rol o ID..."
          />
        </label>
        <span className="user-status-count">
          {usuariosVisibles.length} {usuariosVisibles.length === 1 ? "usuario" : "usuarios"}
        </span>
      </div>

      {cargando ? (
        <p className="user-records__status">Cargando usuarios...</p>
      ) : usuariosVisibles.length === 0 ? (
        <p className="user-records__status">
          {usuarios.length === 0
            ? "No hay usuarios registrados."
            : busqueda.trim()
              ? "No se encontraron usuarios que coincidan con la búsqueda."
              : "No hay usuarios activos o pendientes que coincidan con la búsqueda. Consulta Usuarios fuera de servicio para ver suspendidos o eliminados."}
        </p>
      ) : (
        <div className="tabla-incidentes__scroll">
          <table className="tabla-incidentes user-records__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo electrónico</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha de registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosVisibles.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td><strong>{`${usuario.nombre || ""} ${usuario.apellido || ""}`.trim() || "—"}</strong></td>
                  <td>{usuario.email || "—"}</td>
                  <td><span className="incidente-badge">{usuario.rol || "—"}</span></td>
                  <td>
                    <span className={`user-status-badge user-status-badge--${usuario.status.toLowerCase()}`}>
                      {etiquetasEstado[usuario.status]}
                    </span>
                  </td>
                  <td>{fechaLegible(usuario.createdAt)}</td>
                  <td className="user-records__actions">
                    <button
                      type="button"
                      className="user-action user-action--edit"
                      aria-label={`Modificar usuario ${usuario.nombre} ${usuario.apellido}`}
                      title="Modificar usuario"
                      onClick={() => abrirFormulario(usuario)}
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="user-action user-action--delete"
                      aria-label={`Marcar fuera de servicio a ${usuario.nombre} ${usuario.apellido}`}
                      title="Marcar fuera de servicio"
                      onClick={() => setUsuarioAEliminar(usuario)}
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2m3 0-1 14H6L5 6" />
                        <path d="M10 11v5m4-5v5" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {usuarioAEliminar && (
        <div className="user-delete-overlay" role="presentation">
          <section
            className="user-delete-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titulo-eliminar-usuario"
            aria-describedby="detalle-eliminar-usuario"
          >
            <h3 id="titulo-eliminar-usuario">¿Marcar fuera de servicio este usuario?</h3>
            <p id="detalle-eliminar-usuario">
              Se marcará fuera de servicio a <strong>{usuarioAEliminar.nombre} {usuarioAEliminar.apellido}</strong>. El registro se conservará para consulta.
            </p>
            <div className="user-delete-dialog__actions">
              <button type="button" className="user-form__cancel user-delete-dialog__cancel" onClick={() => setUsuarioAEliminar(null)} disabled={eliminando}>
                Cancelar
              </button>
              <button type="button" className="user-delete-confirm" onClick={confirmarEliminacion} disabled={eliminando}>
                {eliminando ? "Procesando..." : "Marcar fuera de servicio"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
