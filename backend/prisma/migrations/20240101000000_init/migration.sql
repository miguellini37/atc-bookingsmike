-- CreateTable
CREATE TABLE `api_keys` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cid` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `key` VARCHAR(255) NOT NULL,
    `division` VARCHAR(255) NOT NULL,
    `subdivision` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `api_keys_key_key`(`key`),
    INDEX `api_keys_key_idx`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `api_key_id` INTEGER NOT NULL,
    `cid` VARCHAR(255) NOT NULL,
    `callsign` VARCHAR(255) NOT NULL,
    `type` ENUM('booking', 'event', 'exam', 'training') NOT NULL DEFAULT 'booking',
    `start` DATETIME(3) NOT NULL,
    `end` DATETIME(3) NOT NULL,
    `division` VARCHAR(255) NOT NULL,
    `subdivision` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `bookings_api_key_id_idx`(`api_key_id`),
    INDEX `bookings_start_idx`(`start`),
    INDEX `bookings_end_idx`(`end`),
    INDEX `bookings_callsign_idx`(`callsign`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_api_key_id_fkey` FOREIGN KEY (`api_key_id`) REFERENCES `api_keys`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
