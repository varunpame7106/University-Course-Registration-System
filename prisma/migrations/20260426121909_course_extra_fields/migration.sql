-- AlterTable
ALTER TABLE `courses` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;
