-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('ABIERTO', 'EN_PROCESO', 'CERRADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "rol" VARCHAR(50) NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incidente" (
    "id" SERIAL NOT NULL,
    "tituloIncidente" VARCHAR(120) NOT NULL,
    "tipo" VARCHAR(100) NOT NULL,
    "sistemaAfectado" VARCHAR(100),
    "descripcion" TEXT NOT NULL,
    "prioridad" "Prioridad" NOT NULL DEFAULT 'MEDIA',
    "estado" "Estado" NOT NULL DEFAULT 'ABIERTO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Incidente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Incidente_estado_idx" ON "Incidente"("estado");

-- CreateIndex
CREATE INDEX "Incidente_deletedAt_idx" ON "Incidente"("deletedAt");

-- CreateIndex
CREATE INDEX "Incidente_prioridad_idx" ON "Incidente"("prioridad");

-- CreateIndex
CREATE INDEX "Incidente_usuarioId_idx" ON "Incidente"("usuarioId");

-- CreateIndex
CREATE INDEX "Incidente_usuarioId_deletedAt_createdAt_idx" ON "Incidente"("usuarioId", "deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "Incidente_deletedAt_createdAt_idx" ON "Incidente"("deletedAt", "createdAt");

-- AddForeignKey
ALTER TABLE "Incidente" ADD CONSTRAINT "Incidente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
