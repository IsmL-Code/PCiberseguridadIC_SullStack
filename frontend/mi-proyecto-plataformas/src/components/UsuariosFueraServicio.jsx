import { useEffect, useMemo, useState } from "react";
import { actualizarEstadoUsuario, listarUsuarios } from "../services/usuariosApi";

const etiquetasEstado = {
  PENDING: "Pendiente",
  ACTIVE: "Activo",
  SUSPENDED: "Suspendido",
  DELETED: "Eliminado"
};

function fechaLegible(fecha) {
  if (!fecha) return "—";
  const fechaValida = new Date(fecha);
  return Number.isNaN(fechaValida.getTime())
    ? fecha
    : fechaValida.toLocaleDateString("es-EC", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default function UsuariosFueraServicio() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [usuarioEditandoEstado, setUsuarioEditandoEstado] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [guardandoEstado, setGuardandoEstado] = useState(false);

  useEffect(() => {
    let componenteActivo = true;

    listarUsuarios()
      .then((datos) => {
        if (componenteActivo) setUsuarios(datos);
      })
      .catch((err) => {
        if (componenteActivo) setError(err.message);
      })
      .finally(() => {
        if (componenteActivo) setCargando(false);
      });

    return () => {
      componenteActivo = false;
    };
  }, []);

  const usuariosFueraServicio = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return usuarios.filter((usuario) => {
      const estado = usuario.status;
      if (estado !== "SUSPENDED" && estado !== "DELETED") return false;
      if (!termino) return true;
      return [
        usuario.id,
        usuario.nombre,
        usuario.apellido,
        usuario.email,
        usuario.rol,
        etiquetasEstado[estado] || estado
      ].some((valor) => String(valor || "").toLowerCase().includes(termino));
    });
  }, [usuarios, busqueda]);

  const abrirEdicionEstado = (usuario) => {
    setUsuarioEditandoEstado(usuario);
    setEstadoSeleccionado("");
    setError("");
    setMensaje("");
  };

  const guardarEstado = async (event) => {
    event.preventDefault();
    if (!usuarioEditandoEstado) return;
    if (!estadoSeleccionado) {
      setError("Selecciona un estado antes de guardar.");
      return;
    }

    setError("");
    setMensaje("");
    setGuardandoEstado(true);
    try {
      const usuarioActualizado = await actualizarEstadoUsuario(usuarioEditandoEstado.id, estadoSeleccionado);
      setUsuarios((actuales) => actuales.map((usuario) => (
        usuario.id === usuarioActualizado.id ? usuarioActualizado : usuario
      )));
      setMensaje(`Estado de ${usuarioActualizado.nombre} ${usuarioActualizado.apellido} actualizado.`);
      setUsuarioEditandoEstado(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoEstado(false);
    }
  };

  return (
    <section className="dashboard-records user-records" aria-labelledby="titulo-usuarios-fuera-servicio">
      <div className="dashboard-records__heading user-records__heading">
        <div>
          <h2 id="titulo-usuarios-fuera-servicio">Usuarios fuera de servicio</h2>
          <p>En esta lista aparecen únicamente los usuarios suspendidos o eliminados.</p>
        </div>
      </div>

      {mensaje && <p className="dashboard-message dashboard-message--success" role="status">{mensaje}</p>}
      {error && <p className="dashboard-message dashboard-message--error" role="alert">Error: {error}</p>}

      <div className="incidentes-toolbar user-status-toolbar">
        <label className="incidentes-search">
          <span className="visually-hidden">Buscar usuario fuera de servicio</span>
          <input
            className="incidentes-search__input"
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por nombre, correo o estado..."
          />
        </label>
        <span className="user-status-count">
          {usuariosFueraServicio.length} {usuariosFueraServicio.length === 1 ? "usuario" : "usuarios"}
        </span>
      </div>

      {cargando ? (
        <p className="user-records__status">Cargando usuarios...</p>
      ) : usuariosFueraServicio.length === 0 ? (
        <p className="user-records__status">
          {usuarios.length === 0
            ? "No hay usuarios registrados."
            : "No hay usuarios suspendidos o eliminados que coincidan con la búsqueda."}
        </p>
      ) : (
        <div className="tabla-incidentes__scroll">
          <table className="tabla-incidentes user-records__table user-status-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo electrónico</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha de registro</th>
                <th>Fecha de baja</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFueraServicio.map((usuario) => {
                const estado = usuario.status || "PENDING";
                return (
                  <tr key={usuario.id}>
                    <td>{usuario.id}</td>
                    <td><strong>{`${usuario.nombre || ""} ${usuario.apellido || ""}`.trim() || "—"}</strong></td>
                    <td>{usuario.email || "—"}</td>
                    <td><span className="incidente-badge">{usuario.rol || "—"}</span></td>
                    <td>
                      <span className={`user-status-badge user-status-badge--${estado.toLowerCase()}`}>
                        {etiquetasEstado[estado] || estado}
                      </span>
                    </td>
                    <td>{fechaLegible(usuario.createdAt)}</td>
                    <td>{fechaLegible(usuario.deletedAt)}</td>
                    <td className="user-records__actions">
                      <button
                        type="button"
                        className="user-action user-action--status"
                        aria-label={`Modificar estado de ${usuario.nombre} ${usuario.apellido}`}
                        title="Modificar estado"
                        onClick={() => abrirEdicionEstado(usuario)}
                      >
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 7h-9" />
                          <path d="M14 17H5" />
                          <circle cx="17" cy="17" r="3" />
                          <circle cx="7" cy="7" r="3" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {usuarioEditandoEstado && (
        <div className="user-delete-overlay" role="presentation">
          <form
            className="user-delete-dialog user-status-dialog"
            onSubmit={guardarEstado}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modificar-estado"
          >
            <h3 id="titulo-modificar-estado">Modificar estado del usuario</h3>
            <p>
              Cambia únicamente el estado de <strong>{usuarioEditandoEstado.nombre} {usuarioEditandoEstado.apellido}</strong>.
              {" "}Estado actual: {etiquetasEstado[usuarioEditandoEstado.status] || usuarioEditandoEstado.status}.
            </p>
            <label className="user-form__field">
              <span>Estado</span>
              <select
                value={estadoSeleccionado}
                onChange={(event) => setEstadoSeleccionado(event.target.value)}
                disabled={guardandoEstado}
                required
              >
                <option value="" disabled>Selecciona un estado</option>
                <option value="ACTIVE">Activo</option>
                <option value="DELETED">Eliminado</option>
              </select>
            </label>
            {error && <p className="dashboard-message dashboard-message--error" role="alert">{error}</p>}
            <div className="user-delete-dialog__actions">
              <button
                type="button"
                className="user-form__cancel"
                onClick={() => setUsuarioEditandoEstado(null)}
                disabled={guardandoEstado}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-crear" disabled={guardandoEstado}>
                {guardandoEstado ? "Guardando..." : "Guardar estado"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
