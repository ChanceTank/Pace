-- Database schema for Pace social-frequency tracker
-- SQLite syntax
CREATE TABLE IF NOT EXISTS
    circles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        frequency_days INTEGER NOT NULL
    );

CREATE TABLE IF NOT EXISTS
    friends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        circle_id INTEGER,
        last_contact DATE,
        FOREIGN KEY (circle_id) REFERENCES circles (id)
    );

CREATE TABLE IF NOT EXISTS
    interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        friend_id INTEGER,
        DATE DATE,
        notes TEXT,
        direction TEXT CHECK (direction IN ('incoming', 'outgoing')),
        FOREIGN KEY (friend_id) REFERENCES friends (id)
    );