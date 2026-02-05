-- CreateTable: Organization members (links VATSIM users to organizations)
CREATE TABLE `org_members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cid` VARCHAR(255) NOT NULL,
    `api_key_id` INTEGER NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'member',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `org_members_cid_api_key_id_key`(`cid`, `api_key_id`),
    INDEX `org_members_cid_idx`(`cid`),
    INDEX `org_members_api_key_id_idx`(`api_key_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: User sessions for VATSIM OAuth
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `api_key_id` INTEGER NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sessions_cid_idx`(`cid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `org_members` ADD CONSTRAINT `org_members_api_key_id_fkey` FOREIGN KEY (`api_key_id`) REFERENCES `api_keys`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
