-- Fix Latvia subdivision code from LATVIA to LVA
UPDATE `api_keys` SET `name` = 'EUD - LVA', `subdivision` = 'LVA' WHERE `subdivision` = 'LATVIA';
UPDATE `bookings` SET `subdivision` = 'LVA' WHERE `subdivision` = 'LATVIA';

-- Fix Czech Republic subdivision code from CZCH to CZE
UPDATE `api_keys` SET `name` = 'EUD - CZE', `subdivision` = 'CZE' WHERE `subdivision` = 'CZCH';
UPDATE `bookings` SET `subdivision` = 'CZE' WHERE `subdivision` = 'CZCH';
