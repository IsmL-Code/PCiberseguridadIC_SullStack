import { useState } from 'react';

function ListaIncidentes({ incidentes, onGuardar, onEliminar, onBuscarPorId, filtros, onFiltrosChange }) {
  const [busqueda, setBusqueda] = useState('');
  const [resultadoPorId, setResultadoPorId] = useState(null);
  const [buscandoPorId, setBuscandoPorId] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState(filtros?.prioridad || '');
  const [filtroEstado, setFiltroEstado] = useState(filtros?.estado || '');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [incidenteEnEdicion, setIncidenteEnEdicion] = useState(null);
  const [incidenteAEliminar, setIncidenteAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Estado para controlar los campos del formulario
  const [formData, setFormData] = useState({
    tituloIncidente: '',
    tipo: '',
    sistemaAfectado: '',
    prioridad: 'MEDIA',
    estado: 'ABIERTO',
    descripcion: '',
    evidencia: ''
  });

  // Manejar el cambio en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const abrirFormulario = (incidente = null) => {
    setIncidenteEnEdicion(incidente);
    setFormData(incidente || {
      tituloIncidente: '',
      tipo: '',
      sistemaAfectado: '',
      prioridad: 'MEDIA',
      estado: 'ABIERTO',
      descripcion: '',
      evidencia: ''
    });
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setIncidenteEnEdicion(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onGuardar) return;

    setGuardando(true);
    try {
      await onGuardar(formData, incidenteEnEdicion?.id);
      cerrarFormulario();
    } catch {
      // App muestra el error devuelto por el backend y conserva los datos del formulario.
    } finally {
      setGuardando(false);
    }
  };

  const buscar = async (e) => {
    e.preventDefault();
    const texto = busqueda.trim();
    setErrorBusqueda('');
    setResultadoPorId(null);

    if (!texto || !/^\d+$/.test(texto)) return;
    if (!onBuscarPorId) return;

    setBuscandoPorId(true);
    try {
      const incidente = await onBuscarPorId(texto);
      setResultadoPorId(incidente);
    } catch (err) {
      setErrorBusqueda(err.message);
    } finally {
      setBuscandoPorId(false);
    }
  };

  const limpiarBusqueda = () => {
    setBusqueda('');
    setResultadoPorId(null);
    setErrorBusqueda('');
  };

  const confirmarEliminacion = async () => {
    if (!incidenteAEliminar || !onEliminar) return;

    setEliminando(true);
    try {
      await onEliminar(incidenteAEliminar.id);
      setIncidenteAEliminar(null);
    } catch {
      // App muestra el error devuelto por el backend y conserva la confirmación abierta.
    } finally {
      setEliminando(false);
    }
  };

  // Filtrado dinámico
  const incidentesFiltrados = (resultadoPorId ? [resultadoPorId] : incidentes).filter((incidente) => {
    const coincideTexto = Boolean(resultadoPorId) ||
      (incidente.tituloIncidente || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (incidente.tipo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (incidente.descripcion || '').toLowerCase().includes(busqueda.toLowerCase());

    const coincidePrioridad = filtroPrioridad === '' || incidente.prioridad === filtroPrioridad;

    return coincideTexto && coincidePrioridad;
  });

  return (
    <div className="contenedor-incidentes w-full p-3 sm:p-5">
      
      {/* Barra superior: Botón + Búsqueda + Filtro */}
      <div className="mb-5 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <form onSubmit={buscar} className="flex w-full gap-1.5 sm:w-auto">
          <input 
            type="search" 
            placeholder="Buscar por título, tipo o ID..." 
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              if (!e.target.value.trim()) limpiarBusqueda();
            }}
            className="w-full sm:min-w-[220px]"
            style={{ ...inputStyle, marginTop: 0 }}
          />
          <button type="submit" disabled={buscandoPorId} style={searchButtonStyle}>
            {buscandoPorId ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {errorBusqueda && <span style={{ color: '#dc3545' }}>{errorBusqueda}</span>}

        <select 
          value={filtroPrioridad}
          onChange={(e) => {
            const prioridad = e.target.value;
            setFiltroPrioridad(prioridad);
            onFiltrosChange?.({ estado: filtroEstado, prioridad });
          }}
          className="w-full sm:w-auto"
          style={{ ...inputStyle, cursor: 'pointer', marginTop: 0 }}
        >
          <option value="">Todas las prioridades</option>
          <option value="ALTA">Alta</option>
          <option value="MEDIA">Media</option>
          <option value="BAJA">Baja</option>
        </select>

        <select
          value={filtroEstado}
          onChange={(e) => {
            const estado = e.target.value;
            setFiltroEstado(estado);
            onFiltrosChange?.({ estado, prioridad: filtroPrioridad });
          }}
          className="w-full sm:w-auto"
          style={{ ...inputStyle, cursor: 'pointer', marginTop: 0 }}
        >
          <option value="">Todos los estados</option>
          <option value="ABIERTO">Abierto</option>
          <option value="EN_PROCESO">En proceso</option>
          <option value="CERRADO">Cerrado</option>
        </select>

        <button 
          className="btn-crear w-full sm:ml-auto sm:w-auto"
          onClick={() => abrirFormulario()}
          style={{ 
            padding: '10px 18px', 
            backgroundColor: '#198754', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            marginLeft: 'auto'
          }}
        >
          Crear nuevo registro
        </button>
      </div>

      {/* Modal / Formulario de Creación */}
      {mostrarFormulario && (
        <div className="p-3" style={modalOverlayStyle}>
          <div className="max-h-[90vh] overflow-y-auto" style={modalContentStyle}>
            <h2 style={{ marginTop: 0, color: '#111827' }}>{incidenteEnEdicion ? 'Editar Incidente' : 'Crear Nuevo Incidente'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={formGroupStyle}>
                <label>Título del Incidente:</label>
                <input 
                  type="text" 
                  name="tituloIncidente" 
                  value={formData.tituloIncidente} 
                  onChange={handleChange} 
                  required 
                  minLength={5}
                  style={inputStyle}
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div style={{ ...formGroupStyle, flex: 1 }}>
                  <label>Tipo:</label>
                  <input 
                    type="text" 
                    name="tipo" 
                    value={formData.tipo} 
                    onChange={handleChange} 
                    required 
                    minLength={2}
                    placeholder="Ej. Phishing" 
                    style={inputStyle}
                  />
                </div>
                <div style={{ ...formGroupStyle, flex: 1 }}>
                  <label>Sistema Afectado:</label>
                  <input 
                    type="text" 
                    name="sistemaAfectado" 
                    value={formData.sistemaAfectado} 
                    onChange={handleChange} 
                    placeholder="Ej. Mac OS" 
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div style={{ ...formGroupStyle, flex: 1 }}>
                  <label>Prioridad:</label>
                  <select name="prioridad" value={formData.prioridad} onChange={handleChange} style={inputStyle}>
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                    <option value="CRITICA">Crítica</option>
                  </select>
                </div>
                <div style={{ ...formGroupStyle, flex: 1 }}>
                  <label>Estado:</label>
                  <select name="estado" value={formData.estado} onChange={handleChange} style={inputStyle}>
                    <option value="ABIERTO">Abierto</option>
                    <option value="EN_PROCESO">En proceso</option>
                    <option value="CERRADO">Cerrado</option>
                  </select>
                </div>
              </div>

              <div style={formGroupStyle}>
                <label>Evidencia:</label>
                <input 
                  type="text" 
                  name="evidencia" 
                  value={formData.evidencia} 
                  onChange={handleChange} 
                  placeholder="Ej. captura.png" 
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label>Descripción:</label>
                <textarea 
                  name="descripcion" 
                  value={formData.descripcion} 
                  onChange={handleChange} 
                  rows="3" 
                  required
                  minLength={10}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div className="flex flex-col justify-end gap-2 pt-3 sm:flex-row" style={{ marginTop: '15px' }}>
                <button 
                  type="button" 
                  onClick={cerrarFormulario}
                  disabled={guardando}
                  style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: '#e2e8f0', color: '#333' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#28a745', color: '#fff', cursor: 'pointer' }}
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de Incidentes */}
      {incidentesFiltrados.length === 0 ? (
        <p>No se encontraron incidentes.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="tabla-incidentes min-w-[900px]" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'sans-serif' }}>
            <thead>
              <tr style={{ backgroundColor: '#2d3748', color: '#ffffff' }}>
                <th style={cellStyle}>ID</th>
                <th style={cellStyle}>Título</th>
                <th style={cellStyle}>Tipo</th>
                <th style={cellStyle}>Sistema Afectado</th>
                <th style={cellStyle}>Prioridad</th>
                <th style={cellStyle}>Estado</th>
                <th style={cellStyle}>Descripción</th>
                <th style={cellStyle}>Fecha</th>
                <th style={cellStyle}>Evidencia</th>
                <th style={{ ...cellStyle, textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {incidentesFiltrados.map((incidente) => (
                <tr key={incidente.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={cellStyle}>{incidente.id}</td>
                  <td style={cellStyle}><strong>{incidente.tituloIncidente || "-"}</strong></td>
                  <td style={cellStyle}>{incidente.tipo || "-"}</td>
                  <td style={cellStyle}>{incidente.sistemaAfectado || "-"}</td>
                  <td style={cellStyle}>{incidente.prioridad || "-"}</td>
                  <td style={cellStyle}>{incidente.estado || "-"}</td>
                  <td style={cellStyle}>{incidente.descripcion || "-"}</td>
                  <td style={cellStyle}>{incidente.fechaCreacion || "-"}</td>
                  <td style={cellStyle}>{incidente.evidencia || "-"}</td>
                  <td style={{ ...cellStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button 
                      title="Editar"
                      onClick={() => abrirFormulario(incidente)}
                      style={{ ...btnIconStyle, backgroundColor: '#ffc107', marginRight: '8px' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button 
                      title="Eliminar"
                      onClick={() => setIncidenteAEliminar(incidente)}
                      style={{ ...btnIconStyle, backgroundColor: '#dc3545', color: '#fff' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {incidenteAEliminar && (
        <div style={modalOverlayStyle} role="presentation">
          <div className="max-h-[90vh] overflow-y-auto" style={deleteModalStyle} role="dialog" aria-modal="true" aria-labelledby="titulo-confirmacion">
            <h2 id="titulo-confirmacion" style={{ marginTop: 0, color: '#111827' }}>¿Está seguro de eliminar este registro?</h2>
            <p style={{ marginBottom: '24px' }}>
              Esta acción eliminará el incidente seleccionado.
            </p>
            <div style={deleteDetailsStyle}>
              <p><strong>ID:</strong> {incidenteAEliminar.id}</p>
              <p><strong>Título:</strong> {incidenteAEliminar.tituloIncidente || 'Sin título'}</p>
              <p><strong>Prioridad:</strong> {incidenteAEliminar.prioridad || 'Sin prioridad'}</p>
            </div>
            <div className="flex flex-col justify-end gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setIncidenteAEliminar(null)}
                disabled={eliminando}
                style={cancelButtonStyle}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminacion}
                disabled={eliminando}
                style={deleteButtonStyle}
              >
                {eliminando ? 'Eliminando...' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: '#fff',
  padding: '24px',
  borderRadius: '8px',
  width: '100%',
  maxWidth: '550px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  color: '#333'
};

const deleteModalStyle = {
  ...modalContentStyle,
  maxWidth: '420px'
};

const deleteDetailsStyle = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  padding: '12px 14px',
  marginBottom: '24px',
  color: '#1f2937'
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '12px'
};

const inputStyle = {
  backgroundColor: '#ffffff',
  color: '#212529',
  colorScheme: 'light',
  padding: '8px 10px',
  borderRadius: '4px',
  border: '1px solid #ced4da',
  marginTop: '4px',
  outline: 'none'
};

const cellStyle = {
  padding: '8px 10px',
  fontSize: '12px',
  lineHeight: '1.25'
};

const btnIconStyle = {
  border: 'none',
  borderRadius: '4px',
  padding: '6px 10px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const cancelButtonStyle = {
  padding: '9px 18px',
  borderRadius: '4px',
  border: '1px solid #ced4da',
  backgroundColor: '#fff',
  color: '#333',
  cursor: 'pointer'
};

const deleteButtonStyle = {
  padding: '9px 18px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#dc3545',
  color: '#fff',
  cursor: 'pointer'
};

const searchButtonStyle = {
  padding: '8px 12px',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#007bff',
  color: '#fff',
  cursor: 'pointer'
};

export default ListaIncidentes;