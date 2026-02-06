const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
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
	const dbPath = path.join(__dirname, "./db/pace.db");
	const schemaPath = path.join(__dirname, "./db/schema.sql");

	// Ensure db directory exists
	const dbDir = path.dirname(dbPath);
	if (!fs.existsSync(dbDir)) {
		fs.mkdirSync(dbDir, { recursive: true });
	}

	try {
		db = new Database(dbPath);
		console.log("Connected to the SQLite database.");

		// Run schema
		const schema = fs.readFileSync(schemaPath, "utf8");
		db.exec(schema);
		console.log("Database tables created.");
	} catch (err) {
		console.error("Error initializing database:", err.message);
		throw err;
	}
}

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
			return res.status(400).json({ error: "Missing required fields" });
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

app.delete("/api/circles/:id", (req, res) => {
	try {
		const circleId = req.params.id;
		// Delete all friends in this circle first
		const deleteStmt = db.prepare("DELETE FROM friends WHERE circle_id = ?");
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

app.get("/api/friends/circle/:circleId", (req, res) => {
	try {
		const circleId = req.params.circleId;
		const result = db
			.prepare("SELECT * FROM friends WHERE circle_id = ? ORDER BY name")
			.all(circleId);
		res.json(result);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/friends", (req, res) => {
	try {
		const { name, circle_id, last_contact } = req.body;
		if (!name || !circle_id) {
			return res.status(400).json({ error: "Missing required fields" });
		}
		const stmt = db.prepare(
			"INSERT INTO friends (name, circle_id, last_contact) VALUES (?, ?, ?)",
		);
		const info = stmt.run(name, circle_id, last_contact || null);
		res.json({ id: info.lastInsertRowid, name, circle_id, last_contact });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.put("/api/friends/:id/last-contact", (req, res) => {
	try {
		const friendId = req.params.id;
		const { date } = req.body;
		if (!date) {
			return res.status(400).json({ error: "Missing date field" });
		}
		const stmt = db.prepare(
			"UPDATE friends SET last_contact = ? WHERE id = ?",
		);
		stmt.run(date, friendId);
		res.json({ id: friendId, last_contact: date });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.delete("/api/friends/:id", (req, res) => {
	try {
		const friendId = req.params.id;
		// Delete all interactions for this friend first
		const deleteInteractions = db.prepare(
			"DELETE FROM interactions WHERE friend_id = ?",
		);
		deleteInteractions.run(friendId);
		// Then delete the friend
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

app.get("/api/interactions/friend/:friendId", (req, res) => {
	try {
		const friendId = req.params.friendId;
		const result = db
			.prepare(
				"SELECT * FROM interactions WHERE friend_id = ? ORDER BY date DESC",
			)
			.all(friendId);
		res.json(result);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/interactions", (req, res) => {
	try {
		const { friend_id, date, notes, direction = "outgoing" } = req.body;
		if (!friend_id || !date) {
			return res.status(400).json({ error: "Missing required fields" });
		}
		const stmt = db.prepare(
			"INSERT INTO interactions (friend_id, date, notes, direction) VALUES (?, ?, ?, ?)",
		);
		const info = stmt.run(friend_id, date, notes || null, direction);

		// Update friend's last_contact if interaction is not in the future
		const interactionDate = new Date(date);
		const today = new Date();
		if (interactionDate <= today) {
			const updateStmt = db.prepare(
				"UPDATE friends SET last_contact = ? WHERE id = ?",
			);
			updateStmt.run(date, friend_id);
		}

		res.json({ id: info.lastInsertRowid, friend_id, date, notes, direction });
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

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ error: "Internal server error" });
});

// Start server
function startServer() {
	initDatabase();
	app.listen(PORT, () => {
		console.log(`🚀 REST API server running on http://localhost:${PORT}`);
	});
}

// Export for use in main.js
module.exports = { startServer, app };
