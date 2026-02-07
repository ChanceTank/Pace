const { expect } = require("chai");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

describe("Pace Database Schema Tests", () => {
	let db;

	before(() => {
		// Initialize test database
		const dbPath = path.join(__dirname, "../backend/db/schema_test.db");
		const schemaPath = path.join(__dirname, "../backend/db/schema.sql");

		// Ensure db directory exists
		const dbDir = path.dirname(dbPath);
		if (!fs.existsSync(dbDir)) {
			fs.mkdirSync(dbDir, { recursive: true });
		}

		try {
			db = new Database(dbPath);
			const schema = fs.readFileSync(schemaPath, "utf8");
			db.exec(schema);
			console.log("Schema test database initialized.");
		} catch (err) {
			console.error("Error initializing schema test database:", err.message);
			throw err;
		}
	});

	after(() => {
		if (db) {
			db.close();
		}
		// Clean up test database
		const dbPath = path.join(__dirname, "../backend/db/schema_test.db");
		if (fs.existsSync(dbPath)) {
			try {
				fs.unlinkSync(dbPath);
			} catch (err) {
				console.log("Could not delete schema test database, but that's ok");
			}
		}
	});

	it("should create all tables successfully", () => {
		const tables = [
			"people",
			"circles",
			"covenant_types",
			"checkins",
			"tags",
			"groups",
			"action_items",
			"person_tags",
			"person_groups",
			"person_circles",
			"person_covenant_types",
			"checkin_tags",
			"action_item_tags",
			"checkin_covenant_types",
		];

		tables.forEach((table) => {
			try {
				db.prepare(`SELECT 1 FROM ${table} LIMIT 1`).get();
			} catch (err) {
				throw new Error(`Table ${table} does not exist: ${err.message}`);
			}
		});
	});

	it("should insert and retrieve data from people table", () => {
		const insert = db.prepare(
			"INSERT INTO people (name, birthday, anniversary, preferred_communication, profile_picture) VALUES (?, ?, ?, ?, ?)",
		);
		const info = insert.run(
			"John Doe",
			"1990-01-01",
			"2015-06-15",
			"Text",
			"profile.jpg",
		);
		const personId = info.lastInsertRowid;

		const person = db
			.prepare("SELECT * FROM people WHERE id = ?")
			.get(personId);
		expect(person.name).to.equal("John Doe");
		expect(person.birthday).to.equal("1990-01-01");
		expect(person.anniversary).to.equal("2015-06-15");
		expect(person.preferred_communication).to.equal("Text");
		expect(person.profile_picture).to.equal("profile.jpg");
	});

	it("should enforce CHECK constraint on preferred_communication in people table", () => {
		expect(() => {
			db.prepare(
				"INSERT INTO people (name, preferred_communication) VALUES (?, ?)",
			).run("Jane Doe", "Invalid");
		}).to.throw();
	});

	it("should insert and retrieve data from circles table", () => {
		const insert = db.prepare(
			"INSERT INTO circles (name, frequency_days) VALUES (?, ?)",
		);
		const info = insert.run("Weekly Circle", 7);
		const circleId = info.lastInsertRowid;

		const circle = db
			.prepare("SELECT * FROM circles WHERE id = ?")
			.get(circleId);
		expect(circle.name).to.equal("Weekly Circle");
		expect(circle.frequency_days).to.equal(7);
	});

	it("should insert and retrieve data from covenant_types table", () => {
		const insert = db.prepare(
			"INSERT INTO covenant_types (name, description) VALUES (?, ?)",
		);
		const info = insert.run("Mentorship", "Mentoring relationship");
		const covenantId = info.lastInsertRowid;

		const covenant = db
			.prepare("SELECT * FROM covenant_types WHERE id = ?")
			.get(covenantId);
		expect(covenant.name).to.equal("Mentorship");
		expect(covenant.description).to.equal("Mentoring relationship");
	});

	it("should insert and retrieve data from checkins table with foreign key", () => {
		// Insert person and covenant first
		const personInsert = db.prepare("INSERT INTO people (name) VALUES (?)");
		const personInfo = personInsert.run("Checkin Person");
		const personId = personInfo.lastInsertRowid;

		const covenantInsert = db.prepare(
			"INSERT INTO covenant_types (name) VALUES (?)",
		);
		const covenantInfo = covenantInsert.run("Test Covenant");
		const covenantId = covenantInfo.lastInsertRowid;

		const checkinInsert = db.prepare(
			"INSERT INTO checkins (person_id, type_id, duration, notes, summary_feeling, topics_discussed, next_followup_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
		);
		const checkinInfo = checkinInsert.run(
			personId,
			covenantId,
			"1 hour",
			"Test notes",
			"Positive",
			"Topic 1, Topic 2",
			"2023-12-01",
		);
		const checkinId = checkinInfo.lastInsertRowid;

		const checkin = db
			.prepare("SELECT * FROM checkins WHERE id = ?")
			.get(checkinId);
		expect(checkin.person_id).to.equal(personId);
		expect(checkin.type_id).to.equal(covenantId);
		expect(checkin.duration).to.equal("1 hour");
		expect(checkin.notes).to.equal("Test notes");
		expect(checkin.summary_feeling).to.equal("Positive");
		expect(checkin.topics_discussed).to.equal("Topic 1, Topic 2");
		expect(checkin.next_followup_date).to.equal("2023-12-01");
	});

	it("should enforce foreign key constraint in checkins table", () => {
		expect(() => {
			db.prepare(
				"INSERT INTO checkins (person_id, type_id) VALUES (?, ?)",
			).run(999, 999);
		}).to.throw();
	});

	it("should insert and retrieve data from tags table", () => {
		const insert = db.prepare("INSERT INTO tags (tag) VALUES (?)");
		const info = insert.run("Test Tag");
		const tagId = info.lastInsertRowid;

		const tag = db.prepare("SELECT * FROM tags WHERE id = ?").get(tagId);
		expect(tag.tag).to.equal("Test Tag");
	});

	it("should enforce UNIQUE constraint on tag in tags table", () => {
		db.prepare("INSERT INTO tags (tag) VALUES (?)").run("Unique Tag");
		expect(() => {
			db.prepare("INSERT INTO tags (tag) VALUES (?)").run("Unique Tag");
		}).to.throw();
	});

	it("should insert and retrieve data from groups table", () => {
		const insert = db.prepare(
			"INSERT INTO groups (name, description, meeting_frequency) VALUES (?, ?, ?)",
		);
		const info = insert.run(
			"Church Group",
			"Weekly church meetings",
			"Weekly",
		);
		const groupId = info.lastInsertRowid;

		const group = db
			.prepare("SELECT * FROM groups WHERE id = ?")
			.get(groupId);
		expect(group.name).to.equal("Church Group");
		expect(group.description).to.equal("Weekly church meetings");
		expect(group.meeting_frequency).to.equal("Weekly");
	});

	it("should insert and retrieve data from action_items table", () => {
		// Insert person and checkin first
		const personInsert = db.prepare("INSERT INTO people (name) VALUES (?)");
		const personInfo = personInsert.run("Action Person");
		const personId = personInfo.lastInsertRowid;

		const checkinInsert = db.prepare(
			"INSERT INTO checkins (person_id, duration) VALUES (?, ?)",
		);
		const checkinInfo = checkinInsert.run(personId, "30 minutes");
		const checkinId = checkinInfo.lastInsertRowid;

		const actionInsert = db.prepare(
			"INSERT INTO action_items (checkin_id, person_id, description, due_date, status) VALUES (?, ?, ?, ?, ?)",
		);
		const actionInfo = actionInsert.run(
			checkinId,
			personId,
			"Follow up on topic",
			"2023-12-15",
			"Pending",
		);
		const actionId = actionInfo.lastInsertRowid;

		const action = db
			.prepare("SELECT * FROM action_items WHERE id = ?")
			.get(actionId);
		expect(action.checkin_id).to.equal(checkinId);
		expect(action.person_id).to.equal(personId);
		expect(action.description).to.equal("Follow up on topic");
		expect(action.due_date).to.equal("2023-12-15");
		expect(action.status).to.equal("Pending");
	});

	it("should enforce CHECK constraint on status in action_items table", () => {
		expect(() => {
			db.prepare(
				"INSERT INTO action_items (person_id, description, status) VALUES (?, ?, ?)",
			).run(1, "Test", "Invalid");
		}).to.throw();
	});

	it("should insert and retrieve data from linking tables", () => {
		// Insert base entities
		const personInsert = db.prepare("INSERT INTO people (name) VALUES (?)");
		const personInfo = personInsert.run("Linking Person");
		const personId = personInfo.lastInsertRowid;

		const tagInsert = db.prepare("INSERT INTO tags (tag) VALUES (?)");
		const tagInfo = tagInsert.run("Linking Tag");
		const tagId = tagInfo.lastInsertRowid;

		const groupInsert = db.prepare("INSERT INTO groups (name) VALUES (?)");
		const groupInfo = groupInsert.run("Linking Group");
		const groupId = groupInfo.lastInsertRowid;

		const circleInsert = db.prepare("INSERT INTO circles (name) VALUES (?)");
		const circleInfo = circleInsert.run("Linking Circle");
		const circleId = circleInfo.lastInsertRowid;

		const covenantInsert = db.prepare(
			"INSERT INTO covenant_types (name) VALUES (?)",
		);
		const covenantInfo = covenantInsert.run("Linking Covenant");
		const covenantId = covenantInfo.lastInsertRowid;

		const checkinInsert = db.prepare(
			"INSERT INTO checkins (person_id, duration) VALUES (?, ?)",
		);
		const checkinInfo = checkinInsert.run(personId, "45 minutes");
		const checkinId = checkinInfo.lastInsertRowid;

		const actionInsert = db.prepare(
			"INSERT INTO action_items (person_id, description) VALUES (?, ?)",
		);
		const actionInfo = actionInsert.run(personId, "Linking Action");
		const actionId = actionInfo.lastInsertRowid;

		// Test person_tags
		const ptInsert = db.prepare(
			"INSERT INTO person_tags (person_id, tag_id) VALUES (?, ?)",
		);
		ptInsert.run(personId, tagId);
		const pt = db
			.prepare(
				"SELECT * FROM person_tags WHERE person_id = ? AND tag_id = ?",
			)
			.get(personId, tagId);
		expect(pt).to.not.be.undefined;

		// Test person_groups
		const pgInsert = db.prepare(
			"INSERT INTO person_groups (person_id, group_id, role_in_group, join_date) VALUES (?, ?, ?, ?)",
		);
		pgInsert.run(personId, groupId, "Member", "2023-01-01");
		const pg = db
			.prepare(
				"SELECT * FROM person_groups WHERE person_id = ? AND group_id = ?",
			)
			.get(personId, groupId);
		expect(pg.role_in_group).to.equal("Member");

		// Test person_circles
		const pcInsert = db.prepare(
			"INSERT INTO person_circles (person_id, circle_id, role_in_circle) VALUES (?, ?, ?)",
		);
		pcInsert.run(personId, circleId, "Leader");
		const pc = db
			.prepare(
				"SELECT * FROM person_circles WHERE person_id = ? AND circle_id = ?",
			)
			.get(personId, circleId);
		expect(pc.role_in_circle).to.equal("Leader");

		// Test person_covenant_types
		const pctInsert = db.prepare(
			"INSERT INTO person_covenant_types (person_id, covenant_type_id, start_date) VALUES (?, ?, ?)",
		);
		pctInsert.run(personId, covenantId, "2023-01-01");
		const pct = db
			.prepare(
				"SELECT * FROM person_covenant_types WHERE person_id = ? AND covenant_type_id = ?",
			)
			.get(personId, covenantId);
		expect(pct.start_date).to.equal("2023-01-01");

		// Test checkin_tags
		const ctInsert = db.prepare(
			"INSERT INTO checkin_tags (checkin_id, tag_id) VALUES (?, ?)",
		);
		ctInsert.run(checkinId, tagId);
		const ct = db
			.prepare(
				"SELECT * FROM checkin_tags WHERE checkin_id = ? AND tag_id = ?",
			)
			.get(checkinId, tagId);
		expect(ct).to.not.be.undefined;

		// Test action_item_tags
		const atInsert = db.prepare(
			"INSERT INTO action_item_tags (action_item_id, tag_id) VALUES (?, ?)",
		);
		atInsert.run(actionId, tagId);
		const at = db
			.prepare(
				"SELECT * FROM action_item_tags WHERE action_item_id = ? AND tag_id = ?",
			)
			.get(actionId, tagId);
		expect(at).to.not.be.undefined;

		// Test checkin_covenant_types
		const cctInsert = db.prepare(
			"INSERT INTO checkin_covenant_types (checkin_id, covenant_type_id) VALUES (?, ?)",
		);
		cctInsert.run(checkinId, covenantId);
		const cct = db
			.prepare(
				"SELECT * FROM checkin_covenant_types WHERE checkin_id = ? AND covenant_type_id = ?",
			)
			.get(checkinId, covenantId);
		expect(cct).to.not.be.undefined;
	});

	it("should enforce PRIMARY KEY constraints in linking tables", () => {
		// Insert initial data
		const personInsert = db.prepare("INSERT INTO people (name) VALUES (?)");
		const personInfo = personInsert.run("PK Test Person");
		const personId = personInfo.lastInsertRowid;

		const tagInsert = db.prepare("INSERT INTO tags (tag) VALUES (?)");
		const tagInfo = tagInsert.run("PK Test Tag");
		const tagId = tagInfo.lastInsertRowid;

		// Insert once
		db.prepare(
			"INSERT INTO person_tags (person_id, tag_id) VALUES (?, ?)",
		).run(personId, tagId);

		// Try to insert duplicate
		expect(() => {
			db.prepare(
				"INSERT INTO person_tags (person_id, tag_id) VALUES (?, ?)",
			).run(personId, tagId);
		}).to.throw();
	});

	it("should support JOIN queries across relationships", () => {
		// Insert related data
		const personInsert = db.prepare("INSERT INTO people (name) VALUES (?)");
		const personInfo = personInsert.run("Join Test Person");
		const personId = personInfo.lastInsertRowid;

		const covenantInsert = db.prepare(
			"INSERT INTO covenant_types (name) VALUES (?)",
		);
		const covenantInfo = covenantInsert.run("Join Test Covenant");
		const covenantId = covenantInfo.lastInsertRowid;

		const checkinInsert = db.prepare(
			"INSERT INTO checkins (person_id, type_id, duration) VALUES (?, ?, ?)",
		);
		const checkinInfo = checkinInsert.run(personId, covenantId, "2 hours");
		const checkinId = checkinInfo.lastInsertRowid;

		// Test JOIN
		const result = db
			.prepare(
				`
			SELECT p.name AS person_name, ct.name AS covenant_name, c.duration
			FROM checkins c
			JOIN people p ON c.person_id = p.id
			JOIN covenant_types ct ON c.type_id = ct.id
			WHERE c.id = ?
		`,
			)
			.get(checkinId);

		expect(result.person_name).to.equal("Join Test Person");
		expect(result.covenant_name).to.equal("Join Test Covenant");
		expect(result.duration).to.equal("2 hours");
	});
});
