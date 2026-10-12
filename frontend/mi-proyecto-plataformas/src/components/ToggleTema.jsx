import { useState } from "react";
import { aplicarTema, guardarTema, obtenerTemaGuardado } from "../utils/tema";

export default function ToggleTema() {
  const [tema, setTema] = useState(obtenerTemaGuardado);
  const esOscuro = tema === "dark";
  const etiqueta = esOscuro ? "Cambiar a tema claro" : "Cambiar a tema oscuro";

  const alternar = () => {
    const siguiente = esOscuro ? "light" : "dark";
    aplicarTema(siguiente);
    guardarTema(siguiente);
    setTema(siguiente);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={alternar}
      aria-label={etiqueta}
      title={etiqueta}
      aria-pressed={esOscuro}
    >
      <span aria-hidden="true">{esOscuro ? "☀️" : "🌙"}</span>
    </button>
  );
}
