/*
  Warnings:

  - You are about to drop the column `createdAt` on the `library_resources` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `library_resources` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `library_resources` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `library_resources` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `uploaded_by_faculty_id` INTEGER NULL,
    ADD COLUMN `uploaded_by_name` VARCHAR(100) NULL;

-- CreateTable
CREATE TABLE `schedules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `faculty_id` INTEGER NOT NULL,
    `course_id` INTEGER NOT NULL,
    `days` VARCHAR(255) NOT NULL,
    `start_time` VARCHAR(50) NOT NULL,
    `end_time` VARCHAR(50) NOT NULL,
    `mode` ENUM('Online', 'Offline') NOT NULL,
    `venue` VARCHAR(100) NOT NULL,
    `note` TEXT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by_role` VARCHAR(20) NOT NULL DEFAULT 'ADMIN',

    INDEX `schedules_course_id_fkey`(`course_id`),
    UNIQUE INDEX `schedules_faculty_id_course_id_key`(`faculty_id`, `course_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `library_resources_uploaded_by_faculty_id_fkey` ON `library_resources`(`uploaded_by_faculty_id`);

-- AddForeignKey
ALTER TABLE `library_resources` ADD CONSTRAINT `library_resources_uploaded_by_faculty_id_fkey` FOREIGN KEY (`uploaded_by_faculty_id`) REFERENCES `faculties`(`faculty_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`course_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_faculty_id_fkey` FOREIGN KEY (`faculty_id`) REFERENCES `faculties`(`faculty_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
