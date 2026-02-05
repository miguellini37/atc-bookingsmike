-- AlterTable: Remove CID from api_keys
-- API keys are now issued to FIRs/vARTCCs/divisions, not individual controllers
ALTER TABLE `api_keys` DROP COLUMN `cid`;
