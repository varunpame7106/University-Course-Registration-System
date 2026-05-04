-- DropForeignKey
ALTER TABLE `courses` DROP FOREIGN KEY `courses_created_by_fkey`;

-- AlterTable
ALTER TABLE `courses` ADD COLUMN `created_by_faculty` INTEGER NULL,
    ADD COLUMN `created_by_role` VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
    MODIFY `created_by` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `administrators`(`admin_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_created_by_faculty_fkey` FOREIGN KEY (`created_by_faculty`) REFERENCES `faculties`(`faculty_id`) ON DELETE SET NULL ON UPDATE CASCADE;
