import { useState } from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { obtenerUsuarioActual, limpiarSesion, tieneAccesoARuta } from "../utils/sesion";
import { cerrarSesionEnServidor } from "../services/authApi";
import ToggleTema from "./ToggleTema";
import DashboardIcon from "./DashboardIcon";
import protegerImage from "../../img/proteger.png";

// Layout común del panel: cabecera, menú lateral y contenido de la ruta activa
export default function DashboardLayout() {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const navigate = useNavigate();
  const { usuario, rol } = obtenerUsuarioActual();
  const puedeVerUsuarios = tieneAccesoARuta(rol, "usuarios");
  const nombreUsuario = usuario
    ? `${usuario.nombre} ${usuario.apellido}`.trim()
    : "Usuario";
  const claseItem = ({ isActive }) => `dashboard-nav__item${isActive ? " is-active" : ""}`;
  const cerrarMenu = () => setMenuMovilAbierto(false);

  const handleLogout = async () => {
    await cerrarSesionEnServidor();
    limpiarSesion();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar">
        <button
          type="button"
          className="dashboard-menu-toggle"
          aria-label={menuMovilAbierto ? "Cerrar menú principal" : "Abrir menú principal"}
          aria-expanded={menuMovilAbierto}
          aria-controls="dashboard-navigation"
          onClick={() => setMenuMovilAbierto((abierto) => !abierto)}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuMovilAbierto ? (
              <path d="m6 6 12 12M18 6 6 18" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <Link className="dashboard-brand" to="/dashboard" aria-label="PCiberseguridadIC, panel principal">
          <img className="app-header__icon" src={protegerImage} alt="" aria-hidden="true" />
          <span>
            <strong>PCiberseguridadIC</strong>
            <small>Plataforma centralizada para registro y seguimiento de amenazas</small>
          </span>
        </Link>
        <div className="dashboard-user">
          <ToggleTema />
          <span className="dashboard-avatar" aria-hidden="true">
            <DashboardIcon name="user" />
          </span>
          <span className="dashboard-user__name">{nombreUsuario}</span>
          <button type="button" onClick={handleLogout} className="dashboard-logout">
            <DashboardIcon name="logout" />
            Salir
          </button>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div>
            <p className="dashboard-sidebar__heading">Menú principal</p>
            <nav id="dashboard-navigation" aria-label="Menú principal" className={`dashboard-nav${menuMovilAbierto ? " is-open" : ""}`}>
              <NavLink to="/dashboard/incidentes" className={claseItem} onClick={cerrarMenu}>
                <DashboardIcon name="home" />
                <span>Registrar incidentes</span>
              </NavLink>
              {puedeVerUsuarios && (
                <>
                  <NavLink to="/dashboard/usuarios" className={claseItem} onClick={cerrarMenu}>
                    <DashboardIcon name="user" />
                    <span>Registrar nuevo usuario</span>
                  </NavLink>
                  <NavLink to="/dashboard/usuarios-fuera-servicio" className={claseItem} onClick={cerrarMenu}>
                    <DashboardIcon name="userOff" />
                    <span>Usuarios fuera de servicio</span>
                  </NavLink>
                  <NavLink to="/dashboard/incidentes-eliminados" className={claseItem} onClick={cerrarMenu}>
                    <DashboardIcon name="trash" />
                    <span>Incidentes eliminados</span>
                  </NavLink>
                </>
              )}
            </nav>
          </div>
          <div className="dashboard-sidebar__footer">

          </div>
        </aside>

        <main className="dashboard-content">
          <Outlet />
          <footer className="dashboard-footer">
            <span>© 2026 PCiberseguridadIC · Ismael Condo</span>
            <span>Equipo SOC: soc@PCiberseguridadIC.com</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

