let incidentes = [
  
  { 
    id: 1, 
    tituloIncidente: "Sitio web clonado para Phishing", 
    tipo: "Phishing", 
    sistemaAfectado: "Linux / Apache", 
    prioridad: "Media", 
    estado: "Registrado", 
    descripcion: "Correo imitando a Microsoft 365 para robar credenciales. Solicitado bloqueo de dominio.", 
    fechaCreacion: "2023-05-01", 
    evidencia: "https://logs.empresa.com/phish_01.png" 
  },
  { 
    id: 2, 
    tituloIncidente: "Ejecución de Ransomware por adjunto", 
    tipo: "Malware", 
    sistemaAfectado: "Windows 11", 
    prioridad: "Alta", 
    estado: "En revisión", 
    descripcion: "Adjunto `.iso` infectó el equipo con Qakbot. Host aislado de la red.", 
    fechaCreacion: "2023-05-02", 
    evidencia: "https://logs.empresa.com/malware_02.png" 
  },
  { 
    id: 3, 
    tituloIncidente: "Inyección SQL en portal de pagos", 
    tipo: "Vulnerabilidad Web", 
    sistemaAfectado: "Web Server / MySQL", 
    prioridad: "Crítica", 
    estado: "En curso", 
    descripcion: "Petición POST manipulada en endpoint `/login`. Parche de código aplicado en staging.", 
    fechaCreacion: "2023-05-05", 
    evidencia: "https://logs.empresa.com/sqli_payload.txt" 
  },
  { 
    id: 4, 
    tituloIncidente: "Compromiso de cuenta por Credential Stuffing", 
    tipo: "Acceso No Autorizado", 
    sistemaAfectado: "Active Directory / VPN", 
    prioridad: "Alta", 
    estado: "Resuelto", 
    descripcion: "Acceso exitoso desde IP anómala mediante contraseña filtrada. Cuenta bloqueada y MFA forzado.", 
    fechaCreacion: "2023-05-06", 
    evidencia: "https://logs.empresa.com/vpn_login.log" 
  }

];
let nextId = Math.max(...incidentes.map((incidente) => incidente.id), 0) + 1;

function listar() {
  return [...incidentes].sort((a, b) => a.id - b.id);
}

function buscarPorId(id) {
  return incidentes.find((i) => i.id === Number(id));
}

function crear(datos) {
  const nuevo = { ...datos, id: nextId++ };
  incidentes.push(nuevo);
  return nuevo;
}

function actualizar(id, datos) {
  const incidente = buscarPorId(id);
  if (!incidente) return null;
  Object.assign(incidente, datos);
  return incidente;
}
 
function eliminar(id) {
  const antes = incidentes.length;
  incidentes = incidentes.filter((i) => i.id !== Number(id));
  return incidentes.length < antes;
}
 
module.exports = { listar, buscarPorId, crear, actualizar, eliminar };