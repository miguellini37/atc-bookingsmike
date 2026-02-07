-- Fix Netherlands subdivision code from NETH to NLD
UPDATE `api_keys` SET `name` = 'EUD - NLD', `subdivision` = 'NLD' WHERE `subdivision` = 'NETH';
UPDATE `bookings` SET `subdivision` = 'NLD' WHERE `subdivision` = 'NETH';
