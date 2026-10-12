const RoleEnum = Object.freeze({
  ADMINISTRADOR: "Administrador",
  ANALISTA: "Analista",
  SUPERVISOR: "Supervisor"
});

const INCIDENT_OPERATIONAL_ROLES = Object.freeze([
  RoleEnum.ADMINISTRADOR,
  RoleEnum.ANALISTA,
  RoleEnum.SUPERVISOR
]);

const INCIDENT_FULL_ACCESS_ROLES = Object.freeze([
  RoleEnum.ADMINISTRADOR
]);

const INCIDENT_CONSULTATION_ROLES = Object.freeze(Object.values(RoleEnum));

module.exports = {
  RoleEnum,
  INCIDENT_OPERATIONAL_ROLES,
  INCIDENT_FULL_ACCESS_ROLES,
  INCIDENT_CONSULTATION_ROLES
};
