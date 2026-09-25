import { useState, useEffect } from "react";
import ListaIncidentes from "./components/ListaIncidentes";
import {
  obtenerIncidentes,
  obtenerIncidentePorId,
  crearIncidente,
  actualizarIncidente,
  eliminarIncidente
} from "./services/incidentesApi";
import protegerImage from "../img/proteger.png";
 
function App() {
  const [incidentes, setIncidentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarIncidentes = async () => {
    setError(null);
    try {
      const datos = await obtenerIncidentes();
      setIncidentes(datos);
    } catch (err) {
      setError(err.message);
    }
  };
 
  useEffect(() => {
    let componenteActivo = true;

    obtenerIncidentes()
      .then((datos) => {
        if (componenteActivo) setIncidentes(datos);
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

  const guardarIncidente = async (datos, id) => {
    setError(null);
    try {
      if (id) {
        await actualizarIncidente(id, datos);
      } else {
        await crearIncidente(datos);
      }
      await cargarIncidentes();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const borrarIncidente = async (id) => {
    setError(null);
    try {
      await eliminarIncidente(id);
      setIncidentes((actuales) => actuales.filter((incidente) => incidente.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const buscarIncidentePorId = (id) => obtenerIncidentePorId(id);
 
  return (
<div className="app">
      <header className="app-header">
        <div className="app-header__brand">
          <img className="app-header__icon" src={protegerImage} alt="" aria-hidden="true" />
          <div>
            <h1>PCiberseguridadIC</h1>
            <p>Plataforma centralizada para registro y seguimiento de amenazas</p>
          </div>
        </div>
      </header>
      {cargando && <p>Cargando incidentes...</p>}
      {error && <p className="error">Error: {error}</p>}
      {!cargando && <ListaIncidentes
        incidentes={incidentes}
        onGuardar={guardarIncidente}
        onEliminar={borrarIncidente}
        onBuscarPorId={buscarIncidentePorId}
      />}
</div>
  );
}
 
export default App;