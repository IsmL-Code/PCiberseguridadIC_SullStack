import { Link } from "react-router-dom";

export default function AccesoDenegado({ pantallaCompleta = false }) {
  return (
    <section className={`acceso-denegado${pantallaCompleta ? " acceso-denegado--pantalla" : ""}`} role="alert" aria-labelledby="titulo-acceso-denegado">
      <div className="acceso-denegado__card">
        <h1 id="titulo-acceso-denegado">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="m5.6 5.6 12.8 12.8" />
          </svg>
          Acceso Denegado
        </h1>
        <p>
          No tienes las credenciales suficientes para acceder a esta sección.
          <br />
          Por favor, contacta con el <strong>soporte técnico</strong> si crees que esto es un error.
        </p>
        <Link className="acceso-denegado__btn" to="/">
          Regresar al inicio
        </Link>
      </div>
    </section>
  );
}
