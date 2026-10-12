-- AlterTable
ALTER TABLE `Incidente` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Incidente_deletedAt_idx` ON `Incidente`(`deletedAt`);
