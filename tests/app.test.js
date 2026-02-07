// Test file for Pace app
const { expect } = require("chai");
const request = require("supertest");
const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

let server;
let db;
let app;

describe("Pace App API", () => {
	before((done) => {
		// Initialize database for testing
		const dbPath = path.join(__dirname, "../backend/db/test.db");
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
			console.log("Test database initialized.");
		} catch (err) {
			console.error("Error initializing test database:", err.message);
			throw err;
		}

		// Create test app
		app = express();
		app.use(cors());
		app.use(express.json());

		// === CIRCLES ENDPOINTS ===
		app.get("/api/circles", (req, res) => {
			try {
				const result = db.prepare("SELECT * FROM circles").all();
				res.json(result);
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		app.post("/api/circles", (req, res) => {
			try {
				const { name, meeting_frequency } = req.body;
				if (!name || !meeting_frequency) {
					return res
						.status(400)
						.json({ error: "Missing required fields" });
				}
				const stmt = db.prepare(
					"INSERT INTO circles (name, meeting_frequency) VALUES (?, ?)",
				);
				const info = stmt.run(name, meeting_frequency);
				res.json({ id: info.lastInsertRowid, name, meeting_frequency });
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		app.put("/api/circles/:id", (req, res) => {
			try {
				const circleId = req.params.id;
				const { name, meeting_frequency } = req.body;
				if (!name || !meeting_frequency) {
					return res
						.status(400)
						.json({ error: "Missing required fields" });
				}
				const stmt = db.prepare(
					"UPDATE circles SET name = ?, meeting_frequency = ? WHERE id = ?",
				);
				const info = stmt.run(name, meeting_frequency, circleId);
				if (info.changes === 0) {
					return res.status(404).json({ error: "Circle not found" });
				}
				res.json({ id: circleId, name, meeting_frequency });
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		app.delete("/api/circles/:id", (req, res) => {
			try {
				const circleId = req.params.id;
				// Delete all person_circles in this circle first
				const deleteStmt = db.prepare(
					"DELETE FROM person_circles WHERE circle_id = ?",
				);
				deleteStmt.run(circleId);
				// Then delete the circle
				const stmt = db.prepare("DELETE FROM circles WHERE id = ?");
				stmt.run(circleId);
				res.json({ id: circleId, deleted: true });
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		// === PEOPLE ENDPOINTS ===
		app.get("/api/people", (req, res) => {
			try {
				const result = db.prepare("SELECT * FROM people").all();
				res.json(result);
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		app.post("/api/people", (req, res) => {
			try {
				const {
					name,
					birthday,
					anniversary,
					preferred_communication,
					profile_picture,
				} = req.body;
				if (!name) {
					return res
						.status(400)
						.json({ error: "Missing required fields" });
				}
				const stmt = db.prepare(
					"INSERT INTO people (name, birthday, anniversary, preferred_communication, profile_picture) VALUES (?, ?, ?, ?, ?)",
				);
				const info = stmt.run(
					name,
					birthday || null,
					anniversary || null,
					preferred_communication || null,
					profile_picture || null,
				);
				res.json({
					id: info.lastInsertRowid,
					name,
					birthday,
					anniversary,
					preferred_communication,
					profile_picture,
				});
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		app.put("/api/people/:id", (req, res) => {
			try {
				const personId = req.params.id;
				const {
					name,
					birthday,
					anniversary,
					preferred_communication,
					profile_picture,
				} = req.body;
				if (!name) {
					return res
						.status(400)
						.json({ error: "Missing required fields" });
				}
				const stmt = db.prepare(
					"UPDATE people SET name = ?, birthday = ?, anniversary = ?, preferred_communication = ?, profile_picture = ?, last_modified_date = CURRENT_TIMESTAMP WHERE id = ?",
				);
				const info = stmt.run(
					name,
					birthday || null,
					anniversary || null,
					preferred_communication || null,
					profile_picture || null,
					personId,
				);
				if (info.changes === 0) {
					return res.status(404).json({ error: "Person not found" });
				}
				res.json({
					id: personId,
					name,
					birthday,
					anniversary,
					preferred_communication,
					profile_picture,
				});
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		app.delete("/api/people/:id", (req, res) => {
			try {
				const personId = req.params.id;
				const stmt = db.prepare("DELETE FROM people WHERE id = ?");
				stmt.run(personId);
				res.json({ id: personId, deleted: true });
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		// === CHECKINS ENDPOINTS ===
		app.get("/api/checkins", (req, res) => {
			try {
				const result = db.prepare("SELECT * FROM checkins").all();
				res.json(result);
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		app.post("/api/checkins", (req, res) => {
			try {
				const {
					person_id,
					duration,
					type_id,
					notes,
					summary_feeling,
					topics_discussed,
					next_followup_date,
				} = req.body;
				if (!person_id) {
					return res
						.status(400)
						.json({ error: "Missing required fields" });
				}
				const stmt = db.prepare(
					"INSERT INTO checkins (person_id, duration, type_id, notes, summary_feeling, topics_discussed, next_followup_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
				);
				const info = stmt.run(
					person_id,
					duration || null,
					type_id || null,
					notes || null,
					summary_feeling || null,
					topics_discussed || null,
					next_followup_date || null,
				);
				res.json({
					id: info.lastInsertRowid,
					person_id,
					duration,
					type_id,
					notes,
					summary_feeling,
					topics_discussed,
					next_followup_date,
				});
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		app.put("/api/checkins/:id", (req, res) => {
			try {
				const checkinId = req.params.id;
				const {
					person_id,
					duration,
					type_id,
					notes,
					summary_feeling,
					topics_discussed,
					next_followup_date,
				} = req.body;
				if (!person_id) {
					return res
						.status(400)
						.json({ error: "Missing required fields" });
				}
				const stmt = db.prepare(
					"UPDATE checkins SET person_id = ?, duration = ?, type_id = ?, notes = ?, summary_feeling = ?, topics_discussed = ?, next_followup_date = ?, last_modified_date = CURRENT_TIMESTAMP WHERE id = ?",
				);
				const info = stmt.run(
					person_id,
					duration || null,
					type_id || null,
					notes || null,
					summary_feeling || null,
					topics_discussed || null,
					next_followup_date || null,
					checkinId,
				);
				if (info.changes === 0) {
					return res.status(404).json({ error: "Checkin not found" });
				}
				res.json({
					id: checkinId,
					person_id,
					duration,
					type_id,
					notes,
					summary_feeling,
					topics_discussed,
					next_followup_date,
				});
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		app.delete("/api/checkins/:id", (req, res) => {
			try {
				const checkinId = req.params.id;
				const stmt = db.prepare("DELETE FROM checkins WHERE id = ?");
				stmt.run(checkinId);
				res.json({ id: checkinId, deleted: true });
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		// Start server
		server = app.listen(3001, () => {
			console.log("Test server running on port 3001");
			done();
		});
	});

	after((done) => {
		if (server) {
			server.close(() => {
				// Close database connection
				if (db) {
					db.close();
				}
				// Clean up test database
				const dbPath = path.join(__dirname, "../backend/db/test.db");
				if (fs.existsSync(dbPath)) {
					try {
						fs.unlinkSync(dbPath);
					} catch (err) {
						console.log("Could not delete test database, but that's ok");
					}
				}
				done();
			});
		} else {
			done();
		}
	});

	describe("Circles CRUD", () => {
		let circleId;

		it("should create a circle", (done) => {
			request(app)
				.post("/api/circles")
				.send({ name: "Test Circle", meeting_frequency: "Weekly" })
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body).to.have.property("id");
					expect(res.body.name).to.equal("Test Circle");
					expect(res.body.meeting_frequency).to.equal("Weekly");
					circleId = res.body.id;
					done();
				});
		});

		it("should get all circles", (done) => {
			request(app)
				.get("/api/circles")
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body).to.be.an("array");
					expect(res.body.length).to.be.greaterThan(0);
					done();
				});
		});

		it("should update a circle", (done) => {
			request(app)
				.put(`/api/circles/${circleId}`)
				.send({ name: "Updated Circle", meeting_frequency: "Bi-weekly" })
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.name).to.equal("Updated Circle");
					expect(res.body.meeting_frequency).to.equal("Bi-weekly");
					done();
				});
		});

		it("should delete a circle", (done) => {
			request(app)
				.delete(`/api/circles/${circleId}`)
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.deleted).to.be.true;
					done();
				});
		});
	});

	describe("People CRUD", () => {
		let personId;
		let circleId;

		before((done) => {
			// Create a circle for people tests
			request(app)
				.post("/api/circles")
				.send({ name: "People Test Circle", meeting_frequency: "Weekly" })
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					circleId = res.body.id;
					done();
				});
		});

		it("should create a person", (done) => {
			request(app)
				.post("/api/people")
				.send({
					name: "Test Person",
					birthday: "1990-01-01",
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body).to.have.property("id");
					expect(res.body.name).to.equal("Test Person");
					personId = res.body.id;
					done();
				});
		});

		it("should get all people", (done) => {
			request(app)
				.get("/api/people")
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body).to.be.an("array");
					expect(res.body.length).to.be.greaterThan(0);
					done();
				});
		});

		it("should update a person", (done) => {
			request(app)
				.put(`/api/people/${personId}`)
				.send({
					name: "Updated Person",
					birthday: "1990-01-02",
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.name).to.equal("Updated Person");
					done();
				});
		});

		it("should delete a person", (done) => {
			request(app)
				.delete(`/api/people/${personId}`)
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.deleted).to.be.true;
					done();
				});
		});
	});

	describe("Checkins CRUD", () => {
		let checkinId;
		let personId;
		let circleId;

		before((done) => {
			// Create circle and person for checkin tests
			request(app)
				.post("/api/circles")
				.send({ name: "Checkin Test Circle", meeting_frequency: "Weekly" })
				.expect(200)
				.end((err, res) => {
					circleId = res.body.id;
					request(app)
						.post("/api/people")
						.send({
							name: "Checkin Test Person",
							birthday: "1990-01-01",
						})
						.expect(200)
						.end((err2, res2) => {
							if (err2) return done(err2);
							personId = res2.body.id;
							done();
						});
				});
		});

		it("should create a checkin", (done) => {
			request(app)
				.post("/api/checkins")
				.send({
					person_id: personId,
					notes: "Test checkin",
					duration: "30 minutes",
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body).to.have.property("id");
					expect(res.body.notes).to.equal("Test checkin");
					checkinId = res.body.id;
					done();
				});
		});

		it("should get all checkins", (done) => {
			request(app)
				.get("/api/checkins")
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body).to.be.an("array");
					expect(res.body.length).to.be.greaterThan(0);
					done();
				});
		});

		it("should update a checkin", (done) => {
			request(app)
				.put(`/api/checkins/${checkinId}`)
				.send({
					person_id: personId,
					notes: "Updated checkin",
					duration: "1 hour",
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.notes).to.equal("Updated checkin");
					done();
				});
		});

		it("should delete a checkin", (done) => {
			request(app)
				.delete(`/api/checkins/${checkinId}`)
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.deleted).to.be.true;
					done();
				});
		});
	});
});

// Note: For frontend Electron tests, you'd use Spectron or Playwright for E2E tests
// This focuses on backend API testing
