CREATE DATABASE flags;

USE flags;

CREATE TABLE players (
    p_id        CHAR(3) NOT NULL PRIMARY KEY,
    p_name      VARCHAR(50) NOT NULL UNIQUE,
    p_key       CHAR(16) NOT NULL UNIQUE,
    p_created   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);