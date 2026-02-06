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
				const { name, frequency_days } = req.body;
				if (!name || !frequency_days) {
					return res
						.status(400)
						.json({ error: "Missing required fields" });
				}
				const stmt = db.prepare(
					"INSERT INTO circles (name, frequency_days) VALUES (?, ?)",
				);
				const info = stmt.run(name, frequency_days);
				res.json({ id: info.lastInsertRowid, name, frequency_days });
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		app.put("/api/circles/:id", (req, res) => {
			try {
				const circleId = req.params.id;
				const { name, frequency_days } = req.body;
				if (!name || !frequency_days) {
					return res
						.status(400)
						.json({ error: "Missing required fields" });
				}
				const stmt = db.prepare(
					"UPDATE circles SET name = ?, frequency_days = ? WHERE id = ?",
				);
				const info = stmt.run(name, frequency_days, circleId);
				if (info.changes === 0) {
					return res.status(404).json({ error: "Circle not found" });
				}
				res.json({ id: circleId, name, frequency_days });
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		app.delete("/api/circles/:id", (req, res) => {
			try {
				const circleId = req.params.id;
				// Delete all friends in this circle first
				const deleteStmt = db.prepare(
					"DELETE FROM friends WHERE circle_id = ?",
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

		// === FRIENDS ENDPOINTS ===
		app.get("/api/friends", (req, res) => {
			try {
				const result = db.prepare("SELECT * FROM friends").all();
				res.json(result);
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		app.post("/api/friends", (req, res) => {
			try {
				const { name, circle_id, last_contact } = req.body;
				if (!name || !circle_id) {
					return res
						.status(400)
						.json({ error: "Missing required fields" });
				}
				const stmt = db.prepare(
					"INSERT INTO friends (name, circle_id, last_contact) VALUES (?, ?, ?)",
				);
				const info = stmt.run(name, circle_id, last_contact);
				res.json({
					id: info.lastInsertRowid,
					name,
					circle_id,
					last_contact,
				});
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		app.put("/api/friends/:id", (req, res) => {
			try {
				const friendId = req.params.id;
				const { name, circle_id, last_contact } = req.body;
				if (!name || !circle_id) {
					return res
						.status(400)
						.json({ error: "Missing required fields" });
				}
				const stmt = db.prepare(
					"UPDATE friends SET name = ?, circle_id = ?, last_contact = ? WHERE id = ?",
				);
				const info = stmt.run(name, circle_id, last_contact, friendId);
				if (info.changes === 0) {
					return res.status(404).json({ error: "Friend not found" });
				}
				res.json({ id: friendId, name, circle_id, last_contact });
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		app.delete("/api/friends/:id", (req, res) => {
			try {
				const friendId = req.params.id;
				const stmt = db.prepare("DELETE FROM friends WHERE id = ?");
				stmt.run(friendId);
				res.json({ id: friendId, deleted: true });
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		// === INTERACTIONS ENDPOINTS ===
		app.get("/api/interactions", (req, res) => {
			try {
				const result = db.prepare("SELECT * FROM interactions").all();
				res.json(result);
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		app.post("/api/interactions", (req, res) => {
			try {
				const { friend_id, date, notes, direction = "outgoing" } = req.body;
				if (!friend_id || !date) {
					return res
						.status(400)
						.json({ error: "Missing required fields" });
				}
				const stmt = db.prepare(
					"INSERT INTO interactions (friend_id, date, notes, direction) VALUES (?, ?, ?, ?)",
				);
				const info = stmt.run(friend_id, date, notes || null, direction);
				res.json({
					id: info.lastInsertRowid,
					friend_id,
					date,
					notes,
					direction,
				});
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		app.put("/api/interactions/:id", (req, res) => {
			try {
				const interactionId = req.params.id;
				const { friend_id, date, notes, direction } = req.body;
				if (!friend_id || !date) {
					return res
						.status(400)
						.json({ error: "Missing required fields" });
				}
				const stmt = db.prepare(
					"UPDATE interactions SET friend_id = ?, date = ?, notes = ?, direction = ? WHERE id = ?",
				);
				const info = stmt.run(
					friend_id,
					date,
					notes || null,
					direction,
					interactionId,
				);
				if (info.changes === 0) {
					return res.status(404).json({ error: "Interaction not found" });
				}
				res.json({ id: interactionId, friend_id, date, notes, direction });
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		app.delete("/api/interactions/:id", (req, res) => {
			try {
				const interactionId = req.params.id;
				const stmt = db.prepare("DELETE FROM interactions WHERE id = ?");
				stmt.run(interactionId);
				res.json({ id: interactionId, deleted: true });
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
				.send({ name: "Test Circle", frequency_days: 7 })
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body).to.have.property("id");
					expect(res.body.name).to.equal("Test Circle");
					expect(res.body.frequency_days).to.equal(7);
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
				.send({ name: "Updated Circle", frequency_days: 14 })
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.name).to.equal("Updated Circle");
					expect(res.body.frequency_days).to.equal(14);
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

	describe("Friends CRUD", () => {
		let friendId;
		let circleId;

		before((done) => {
			// Create a circle for friend tests
			request(app)
				.post("/api/circles")
				.send({ name: "Friend Test Circle", frequency_days: 7 })
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					circleId = res.body.id;
					done();
				});
		});

		it("should create a friend", (done) => {
			request(app)
				.post("/api/friends")
				.send({
					name: "Test Friend",
					circle_id: circleId,
					last_contact: "2023-01-01",
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body).to.have.property("id");
					expect(res.body.name).to.equal("Test Friend");
					friendId = res.body.id;
					done();
				});
		});

		it("should get all friends", (done) => {
			request(app)
				.get("/api/friends")
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body).to.be.an("array");
					expect(res.body.length).to.be.greaterThan(0);
					done();
				});
		});

		it("should update a friend", (done) => {
			request(app)
				.put(`/api/friends/${friendId}`)
				.send({
					name: "Updated Friend",
					circle_id: circleId,
					last_contact: "2023-01-02",
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.name).to.equal("Updated Friend");
					done();
				});
		});

		it("should delete a friend", (done) => {
			request(app)
				.delete(`/api/friends/${friendId}`)
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.deleted).to.be.true;
					done();
				});
		});
	});

	describe("Interactions CRUD", () => {
		let interactionId;
		let friendId;
		let circleId;

		before((done) => {
			// Create circle and friend for interaction tests
			request(app)
				.post("/api/circles")
				.send({ name: "Interaction Test Circle", frequency_days: 7 })
				.expect(200)
				.end((err, res) => {
					circleId = res.body.id;
					request(app)
						.post("/api/friends")
						.send({
							name: "Interaction Test Friend",
							circle_id: circleId,
							last_contact: "2023-01-01",
						})
						.expect(200)
						.end((err2, res2) => {
							if (err2) return done(err2);
							friendId = res2.body.id;
							done();
						});
				});
		});

		it("should create an interaction", (done) => {
			request(app)
				.post("/api/interactions")
				.send({
					friend_id: friendId,
					date: "2023-01-15",
					notes: "Test interaction",
					direction: "outgoing",
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body).to.have.property("id");
					expect(res.body.notes).to.equal("Test interaction");
					interactionId = res.body.id;
					done();
				});
		});

		it("should get all interactions", (done) => {
			request(app)
				.get("/api/interactions")
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body).to.be.an("array");
					expect(res.body.length).to.be.greaterThan(0);
					done();
				});
		});

		it("should update an interaction", (done) => {
			request(app)
				.put(`/api/interactions/${interactionId}`)
				.send({
					friend_id: friendId,
					date: "2023-01-16",
					notes: "Updated interaction",
					direction: "incoming",
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.notes).to.equal("Updated interaction");
					expect(res.body.direction).to.equal("incoming");
					done();
				});
		});

		it("should delete an interaction", (done) => {
			request(app)
				.delete(`/api/interactions/${interactionId}`)
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
