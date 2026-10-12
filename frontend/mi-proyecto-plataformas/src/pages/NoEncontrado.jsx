import { Link } from "react-router-dom";

export default function NoEncontrado({ pantallaCompleta = false }) {
  return (
    <section className={`acceso-denegado${pantallaCompleta ? " acceso-denegado--pantalla" : ""}`} aria-labelledby="titulo-no-encontrado">
      <div className="acceso-denegado__card">
        <h1 id="titulo-no-encontrado">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4M9 9l4 4M13 9l-4 4" />
          </svg>
          Página no encontrada
        </h1>
        <p>
          La ruta que intentas visitar no existe o fue movida.
          <br />
          Verifica la dirección o regresa al inicio.
        </p>
        <Link className="acceso-denegado__btn" to="/">
          Regresar al inicio
        </Link>
      </div>
    </section>
  );
}
