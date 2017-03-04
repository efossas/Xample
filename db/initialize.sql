CREATE DATABASE xample;

CREATE DATABASE xred;
USE xred;

SOURCE setup.sql;

CREATE DATABASE xanalytics;
USE xanalytics;

CREATE TABLE xerror (ekey BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, id TINYINT UNSIGNED, scriptName VARCHAR(32), functionName VARCHAR(32), lineNumber SMALLINT UNSIGNED, userID CHAR(24), eventTime DATETIME, message VARCHAR(1024) );

CREATE TABLE xdata (scriptName VARCHAR(32), functionName VARCHAR(32), lineNumber SMALLINT UNSIGNED, userID CHAR(24), eventTime DATETIME );

CREATE TABLE xviews ( ptype CHAR(5), aid CHAR(24), xid SMALLINT UNSIGNED, viewtime TIMESTAMP NOT NULL, quality SMALLINT UNSIGNED NOT NULL, KEY(ptype,aid,xid) );

CREATE DATABASE xsessionstore;
USE xsessionstore;

CREATE TABLE sessions (session_id VARCHAR(255) NOT NULL PRIMARY KEY, expires INT(11) UNSIGNED NOT NULL, data TEXT);

CREATE USER 'nodesql'@'localhost' IDENTIFIED BY 'Vup}Ur34';
GRANT ALL PRIVILEGES ON xample.* TO 'nodesql'@'localhost';
GRANT ALL PRIVILEGES ON xred.* TO 'nodesql'@'localhost';
GRANT ALL PRIVILEGES ON xanalytics.* TO 'nodesql'@'localhost';
GRANT ALL PRIVILEGES ON xsessionstore.* TO 'nodesql'@'localhost';

USE xample;
