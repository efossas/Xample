CREATE DATABASE xample;
USE xample;

CREATE TABLE Users (uid INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL, password CHAR(60) NOT NULL, email VARCHAR(50), phone VARCHAR(15), autosave SMALLINT UNSIGNED NOT NULL, defaulttext TINYINT UNSIGNED NOT NULL );

CREATE DATABASE xsessionstore;
USE xsessionstore;

CREATE TABLE sessions (session_id VARCHAR(255) NOT NULL PRIMARY KEY, expires INT(11) UNSIGNED NOT NULL, data TEXT);

CREATE DATABASE xanalytics;
USE xanalytics;

CREATE TABLE xerror (ekey BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, id TINYINT UNSIGNED, scriptName VARCHAR(32), functionName VARCHAR(32), lineNumber SMALLINT UNSIGNED, userID INT UNSIGNED, eventTime DATETIME, message VARCHAR(256) );

CREATE TABLE xdata (scriptName VARCHAR(32), functionName VARCHAR(32), lineNumber SMALLINT UNSIGNED, userID INT UNSIGNED, eventTime DATETIME );

CREATE USER 'nodesql'@'localhost' IDENTIFIED BY 'Vup}Ur34';
GRANT ALL PRIVILEGES ON xample.* TO 'nodesql'@'localhost';
GRANT ALL PRIVILEGES ON xanalytics.* TO 'nodesql'@'localhost';
GRANT ALL PRIVILEGES ON xsessionstore.* TO 'nodesql'@'localhost';
