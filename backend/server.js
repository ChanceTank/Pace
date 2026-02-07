const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

let db;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
function initDatabase() {
	return new Promise((resolve, reject) => {
		const dbPath = path.join(__dirname, "./db/pace.db");
		const schemaPath = path.join(__dirname, "./db/schema.sql");

		// Ensure db directory exists
		const dbDir = path.dirname(dbPath);
		if (!fs.existsSync(dbDir)) {
			fs.mkdirSync(dbDir, { recursive: true });
		}

		db = new sqlite3.Database(dbPath, (err) => {
			if (err) {
				console.error("Error opening database:", err.message);
				reject(err);
				return;
			}
			console.log("Connected to the SQLite database.");

			// Run schema
			const schema = fs.readFileSync(schemaPath, "utf8");
			db.exec(schema, (err) => {
				if (err) {
					console.error("Error creating tables:", err.message);
					reject(err);
					return;
				}
				console.log("Database tables created.");
				resolve();
			});
		});
	});
}

// === CIRCLES ENDPOINTS ===
app.get("/api/circles", (req, res) => {
	db.all("SELECT * FROM circles", [], (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json(rows);
		}
	});
});

app.post("/api/circles", (req, res) => {
	const { name, meeting_frequency } = req.body;
	if (!name || !meeting_frequency) {
		return res.status(400).json({ error: "Missing required fields" });
	}
	db.run(
		"INSERT INTO circles (name, meeting_frequency) VALUES (?, ?)",
		[name, meeting_frequency],
		function (err) {
			if (err) {
				res.status(500).json({ error: err.message });
			} else {
				res.json({ id: this.lastID, name, meeting_frequency });
			}
		},
	);
});

app.put("/api/circles/:id", (req, res) => {
	const circleId = req.params.id;
	const { name, meeting_frequency } = req.body;
	if (!name || !meeting_frequency) {
		return res.status(400).json({ error: "Missing required fields" });
	}
	db.run(
		"UPDATE circles SET name = ?, meeting_frequency = ? WHERE id = ?",
		[name, meeting_frequency, circleId],
		function (err) {
			if (err) {
				res.status(500).json({ error: err.message });
			} else {
				res.json({ id: circleId, name, meeting_frequency });
			}
		},
	);
});

app.delete("/api/circles/:id", (req, res) => {
	const circleId = req.params.id;
	// Delete all person_circles in this circle first
	db.run(
		"DELETE FROM person_circles WHERE circle_id = ?",
		[circleId],
		function (err) {
			if (err) {
				res.status(500).json({ error: err.message });
				return;
			}
			// Then delete the circle
			db.run("DELETE FROM circles WHERE id = ?", [circleId], function (err) {
				if (err) {
					res.status(500).json({ error: err.message });
				} else {
					res.json({ id: circleId, deleted: true });
				}
			});
		},
	);
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
			return res.status(400).json({ error: "Missing required fields" });
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
			return res.status(400).json({ error: "Missing required fields" });
		}
		const stmt = db.prepare(
			"UPDATE people SET name = ?, birthday = ?, anniversary = ?, preferred_communication = ?, profile_picture = ?, last_modified_date = CURRENT_TIMESTAMP WHERE id = ?",
		);
		stmt.run(
			name,
			birthday || null,
			anniversary || null,
			preferred_communication || null,
			profile_picture || null,
			personId,
		);
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
		// Delete related records first
		const deleteCheckins = db.prepare(
			"DELETE FROM checkins WHERE person_id = ?",
		);
		deleteCheckins.run(personId);
		const deletePersonTags = db.prepare(
			"DELETE FROM person_tags WHERE person_id = ?",
		);
		deletePersonTags.run(personId);
		const deletePersonGroups = db.prepare(
			"DELETE FROM person_groups WHERE person_id = ?",
		);
		deletePersonGroups.run(personId);
		const deletePersonCircles = db.prepare(
			"DELETE FROM person_circles WHERE person_id = ?",
		);
		deletePersonCircles.run(personId);
		const deletePersonCovenants = db.prepare(
			"DELETE FROM person_covenant_types WHERE person_id = ?",
		);
		deletePersonCovenants.run(personId);
		const deleteActionItems = db.prepare(
			"DELETE FROM action_items WHERE person_id = ?",
		);
		deleteActionItems.run(personId);
		// Then delete the person
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

app.get("/api/checkins/person/:personId", (req, res) => {
	try {
		const personId = req.params.personId;
		const result = db
			.prepare(
				"SELECT * FROM checkins WHERE person_id = ? ORDER BY creation_date DESC",
			)
			.all(personId);
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
			return res.status(400).json({ error: "Missing required fields" });
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
			return res.status(400).json({ error: "Missing required fields" });
		}
		const stmt = db.prepare(
			"UPDATE checkins SET person_id = ?, duration = ?, type_id = ?, notes = ?, summary_feeling = ?, topics_discussed = ?, next_followup_date = ?, last_modified_date = CURRENT_TIMESTAMP WHERE id = ?",
		);
		stmt.run(
			person_id,
			duration || null,
			type_id || null,
			notes || null,
			summary_feeling || null,
			topics_discussed || null,
			next_followup_date || null,
			checkinId,
		);
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
		// Delete related action items first
		const deleteActionItems = db.prepare(
			"DELETE FROM action_items WHERE checkin_id = ?",
		);
		deleteActionItems.run(checkinId);
		const deleteCheckinTags = db.prepare(
			"DELETE FROM checkin_tags WHERE checkin_id = ?",
		);
		deleteCheckinTags.run(checkinId);
		const deleteCheckinCovenants = db.prepare(
			"DELETE FROM checkin_covenant_types WHERE checkin_id = ?",
		);
		deleteCheckinCovenants.run(checkinId);
		// Then delete the checkin
		const stmt = db.prepare("DELETE FROM checkins WHERE id = ?");
		stmt.run(checkinId);
		res.json({ id: checkinId, deleted: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// === GROUPS ENDPOINTS ===
app.get("/api/groups", (req, res) => {
	try {
		const result = db.prepare("SELECT * FROM groups").all();
		res.json(result);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/groups", (req, res) => {
	try {
		const { name, description, meeting_frequency } = req.body;
		if (!name || !meeting_frequency) {
			return res.status(400).json({ error: "Missing required fields" });
		}
		const stmt = db.prepare(
			"INSERT INTO groups (name, description, meeting_frequency) VALUES (?, ?, ?)",
		);
		const info = stmt.run(name, description || null, meeting_frequency);
		res.json({
			id: info.lastInsertRowid,
			name,
			description,
			meeting_frequency,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/groups/:id", (req, res) => {
	try {
		const groupId = req.params.id;
		const { name, description, meeting_frequency } = req.body;
		if (!name || !meeting_frequency) {
			return res.status(400).json({ error: "Missing required fields" });
		}
		const stmt = db.prepare(
			"UPDATE groups SET name = ?, description = ?, meeting_frequency = ?, last_modified_date = CURRENT_TIMESTAMP WHERE id = ?",
		);
		stmt.run(name, description || null, meeting_frequency, groupId);
		res.json({ id: groupId, name, description, meeting_frequency });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/groups/:id", (req, res) => {
	try {
		const groupId = req.params.id;
		// Delete related person_groups first
		const deleteStmt = db.prepare(
			"DELETE FROM person_groups WHERE group_id = ?",
		);
		deleteStmt.run(groupId);
		// Then delete the group
		const stmt = db.prepare("DELETE FROM groups WHERE id = ?");
		stmt.run(groupId);
		res.json({ id: groupId, deleted: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// === ACTION ITEMS ENDPOINTS ===
app.get("/api/action_items", (req, res) => {
	try {
		const result = db.prepare("SELECT * FROM action_items").all();
		res.json(result);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/action_items", (req, res) => {
	try {
		const { checkin_id, person_id, description, due_date, status } = req.body;
		if (!person_id || !description) {
			return res.status(400).json({ error: "Missing required fields" });
		}
		const stmt = db.prepare(
			"INSERT INTO action_items (checkin_id, person_id, description, due_date, status) VALUES (?, ?, ?, ?, ?)",
		);
		const info = stmt.run(
			checkin_id || null,
			person_id,
			description,
			due_date || null,
			status || "Pending",
		);
		res.json({
			id: info.lastInsertRowid,
			checkin_id,
			person_id,
			description,
			due_date,
			status,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/action_items/:id", (req, res) => {
	try {
		const actionItemId = req.params.id;
		const {
			checkin_id,
			person_id,
			description,
			due_date,
			completed_date,
			status,
		} = req.body;
		if (!person_id || !description) {
			return res.status(400).json({ error: "Missing required fields" });
		}
		const stmt = db.prepare(
			"UPDATE action_items SET checkin_id = ?, person_id = ?, description = ?, due_date = ?, completed_date = ?, status = ?, last_modified_date = CURRENT_TIMESTAMP WHERE id = ?",
		);
		stmt.run(
			checkin_id || null,
			person_id,
			description,
			due_date || null,
			completed_date || null,
			status || "Pending",
			actionItemId,
		);
		res.json({
			id: actionItemId,
			checkin_id,
			person_id,
			description,
			due_date,
			completed_date,
			status,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/action_items/:id", (req, res) => {
	try {
		const actionItemId = req.params.id;
		// Delete related action_item_tags first
		const deleteStmt = db.prepare(
			"DELETE FROM action_item_tags WHERE action_item_id = ?",
		);
		deleteStmt.run(actionItemId);
		// Then delete the action item
		const stmt = db.prepare("DELETE FROM action_items WHERE id = ?");
		stmt.run(actionItemId);
		res.json({ id: actionItemId, deleted: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// === COVENANT TYPES ENDPOINTS ===
app.get("/api/covenant_types", (req, res) => {
	try {
		const result = db.prepare("SELECT * FROM covenant_types").all();
		res.json(result);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/covenant_types", (req, res) => {
	try {
		const { name, description } = req.body;
		if (!name) {
			return res.status(400).json({ error: "Missing required fields" });
		}
		const stmt = db.prepare(
			"INSERT INTO covenant_types (name, description) VALUES (?, ?)",
		);
		const info = stmt.run(name, description || null);
		res.json({ id: info.lastInsertRowid, name, description });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/covenant_types/:id", (req, res) => {
	try {
		const covenantTypeId = req.params.id;
		const { name, description } = req.body;
		if (!name) {
			return res.status(400).json({ error: "Missing required fields" });
		}
		const stmt = db.prepare(
			"UPDATE covenant_types SET name = ?, description = ?, last_modified_date = CURRENT_TIMESTAMP WHERE id = ?",
		);
		stmt.run(name, description || null, covenantTypeId);
		res.json({ id: covenantTypeId, name, description });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/covenant_types/:id", (req, res) => {
	try {
		const covenantTypeId = req.params.id;
		// Delete related records first
		const deletePersonCovenants = db.prepare(
			"DELETE FROM person_covenant_types WHERE covenant_type_id = ?",
		);
		deletePersonCovenants.run(covenantTypeId);
		const deleteCheckinCovenants = db.prepare(
			"DELETE FROM checkin_covenant_types WHERE covenant_type_id = ?",
		);
		deleteCheckinCovenants.run(covenantTypeId);
		// Then delete the covenant type
		const stmt = db.prepare("DELETE FROM covenant_types WHERE id = ?");
		stmt.run(covenantTypeId);
		res.json({ id: covenantTypeId, deleted: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// === TAGS ENDPOINTS ===
app.get("/api/tags", (req, res) => {
	try {
		const result = db.prepare("SELECT * FROM tags").all();
		res.json(result);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/tags", (req, res) => {
	try {
		const { tag } = req.body;
		if (!tag) {
			return res.status(400).json({ error: "Missing required fields" });
		}
		const stmt = db.prepare("INSERT INTO tags (tag) VALUES (?)");
		const info = stmt.run(tag);
		res.json({ id: info.lastInsertRowid, tag });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/tags/:id", (req, res) => {
	try {
		const tagId = req.params.id;
		const { tag } = req.body;
		if (!tag) {
			return res.status(400).json({ error: "Missing required fields" });
		}
		const stmt = db.prepare(
			"UPDATE tags SET tag = ?, last_modified_date = CURRENT_TIMESTAMP WHERE id = ?",
		);
		stmt.run(tag, tagId);
		res.json({ id: tagId, tag });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/tags/:id", (req, res) => {
	try {
		const tagId = req.params.id;
		// Delete related records first
		const deletePersonTags = db.prepare(
			"DELETE FROM person_tags WHERE tag_id = ?",
		);
		deletePersonTags.run(tagId);
		const deleteCheckinTags = db.prepare(
			"DELETE FROM checkin_tags WHERE tag_id = ?",
		);
		deleteCheckinTags.run(tagId);
		const deleteActionItemTags = db.prepare(
			"DELETE FROM action_item_tags WHERE tag_id = ?",
		);
		deleteActionItemTags.run(tagId);
		// Then delete the tag
		const stmt = db.prepare("DELETE FROM tags WHERE id = ?");
		stmt.run(tagId);
		res.json({ id: tagId, deleted: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ error: "Internal server error" });
});

// Start server
async function startServer() {
	try {
		await initDatabase();
		app.listen(PORT, () => {
			console.log(`🚀 REST API server running on http://localhost:${PORT}`);
		});
	} catch (err) {
		console.error("Failed to start server:", err);
		process.exit(1);
	}
}

// Export for use in main.js
module.exports = { startServer, app };
