-- Database schema for Pace social-frequency tracker
-- SQLite syntax
-- People table
CREATE TABLE IF NOT EXISTS
    people (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        birthday DATE,
        anniversary DATE,
        preferred_communication TEXT CHECK (preferred_communication IN ('Text', 'Call', 'Email', 'In-person')),
        profile_picture TEXT, -- URL or file path
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Circles table
CREATE TABLE IF NOT EXISTS
    circles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        meeting_frequency TEXT CHECK (meeting_frequency IN ('Weekly', 'Bi-weekly', 'Monthly', 'Ad-hoc')),
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Covenant Types table
CREATE TABLE IF NOT EXISTS
    covenant_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Check-ins table
CREATE TABLE IF NOT EXISTS
    checkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        person_id INTEGER NOT NULL,
        duration TEXT, -- e.g., '30 minutes', '1 hour'
        type_id INTEGER,
        notes TEXT,
        summary_feeling TEXT,
        topics_discussed TEXT, -- Could be a list or text
        next_followup_date DATE,
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (person_id) REFERENCES people (id),
        FOREIGN KEY (type_id) REFERENCES covenant_types (id)
    );

-- Tags table
CREATE TABLE IF NOT EXISTS
    tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag TEXT NOT NULL UNIQUE,
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Groups table
CREATE TABLE IF NOT EXISTS
    GROUPS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        meeting_frequency TEXT CHECK (meeting_frequency IN ('Weekly', 'Bi-weekly', 'Monthly', 'Ad-hoc')),
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Action Items table
CREATE TABLE IF NOT EXISTS
    action_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        checkin_id INTEGER,
        person_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        due_date DATE,
        completed_date DATE,
        status TEXT CHECK (status IN ('Pending', 'Completed', 'Cancelled')) DEFAULT 'Pending',
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (checkin_id) REFERENCES checkins (id),
        FOREIGN KEY (person_id) REFERENCES people (id)
    );

-- Linking tables
-- Person_Tags
CREATE TABLE IF NOT EXISTS
    person_tags (
        person_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (person_id, tag_id),
        FOREIGN KEY (person_id) REFERENCES people (id),
        FOREIGN KEY (tag_id) REFERENCES tags (id)
    );

-- Person_Groups
CREATE TABLE IF NOT EXISTS
    person_groups (
        person_id INTEGER NOT NULL,
        group_id INTEGER NOT NULL,
        role_in_group TEXT,
        join_date DATE,
        leave_date DATE,
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (person_id, group_id),
        FOREIGN KEY (person_id) REFERENCES people (id),
        FOREIGN KEY (group_id) REFERENCES GROUPS (id)
    );

-- Person_Circles
CREATE TABLE IF NOT EXISTS
    person_circles (
        person_id INTEGER NOT NULL,
        circle_id INTEGER NOT NULL,
        role_in_circle TEXT,
        join_date DATE,
        leave_date DATE,
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (person_id, circle_id),
        FOREIGN KEY (person_id) REFERENCES people (id),
        FOREIGN KEY (circle_id) REFERENCES circles (id)
    );

-- Person_CovenantTypes
CREATE TABLE IF NOT EXISTS
    person_covenant_types (
        person_id INTEGER NOT NULL,
        covenant_type_id INTEGER NOT NULL,
        start_date DATE,
        end_date DATE,
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (person_id, covenant_type_id),
        FOREIGN KEY (person_id) REFERENCES people (id),
        FOREIGN KEY (covenant_type_id) REFERENCES covenant_types (id)
    );

-- Checkin_Tags
CREATE TABLE IF NOT EXISTS
    checkin_tags (
        checkin_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (checkin_id, tag_id),
        FOREIGN KEY (checkin_id) REFERENCES checkins (id),
        FOREIGN KEY (tag_id) REFERENCES tags (id)
    );

-- ActionItem_Tags
CREATE TABLE IF NOT EXISTS
    action_item_tags (
        action_item_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (action_item_id, tag_id),
        FOREIGN KEY (action_item_id) REFERENCES action_items (id),
        FOREIGN KEY (tag_id) REFERENCES tags (id)
    );

-- Checkin_CovenantTypes (if needed, assuming Type in Check-ins is a foreign key)
CREATE TABLE IF NOT EXISTS
    checkin_covenant_types (
        checkin_id INTEGER NOT NULL,
        covenant_type_id INTEGER NOT NULL,
        PRIMARY KEY (checkin_id, covenant_type_id),
        FOREIGN KEY (checkin_id) REFERENCES checkins (id),
        FOREIGN KEY (covenant_type_id) REFERENCES covenant_types (id)
    );