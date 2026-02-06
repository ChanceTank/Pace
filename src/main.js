const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Database = require("better-sqlite3");
const fs = require("fs");

let db;

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	mainWindow.loadFile(path.join(__dirname, "index.html"));

	// Open the DevTools (optional)
	// mainWindow.webContents.openDevTools();
}

function initDatabase() {
	const dbPath = path.join(__dirname, "../db/pace.db");
	const schemaPath = path.join(__dirname, "../db/schema.sql");

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

function setupIpcHandlers() {
	ipcMain.handle("get-circles", async () => {
		try {
			const result = db.prepare("SELECT * FROM circles").all();
			return result;
		} catch (err) {
			throw err;
		}
	});

	ipcMain.handle("add-circle", async (event, circleData) => {
		try {
			const { name, frequency_days } = circleData;
			const stmt = db.prepare(
				"INSERT INTO circles (name, frequency_days) VALUES (?, ?)",
			);
			const info = stmt.run(name, frequency_days);
			return { id: info.lastInsertRowid, ...circleData };
		} catch (err) {
			throw err;
		}
	});

	ipcMain.handle("get-friends", async () => {
		try {
			const result = db.prepare("SELECT * FROM friends").all();
			return result;
		} catch (err) {
			throw err;
		}
	});

	ipcMain.handle("add-friend", async (event, friendData) => {
		try {
			const { name, circle_id, last_contact } = friendData;
			const stmt = db.prepare(
				"INSERT INTO friends (name, circle_id, last_contact) VALUES (?, ?, ?)",
			);
			const info = stmt.run(name, circle_id, last_contact);
			return { id: info.lastInsertRowid, ...friendData };
		} catch (err) {
			throw err;
		}
	});

	ipcMain.handle("get-interactions", async () => {
		try {
			const result = db.prepare("SELECT * FROM interactions").all();
			return result;
		} catch (err) {
			throw err;
		}
	});

	ipcMain.handle("add-interaction", async (event, interactionData) => {
		try {
			const {
				friend_id,
				date,
				notes,
				direction = "outgoing",
			} = interactionData;
			const stmt = db.prepare(
				"INSERT INTO interactions (friend_id, date, notes, direction) VALUES (?, ?, ?, ?)",
			);
			const info = stmt.run(friend_id, date, notes, direction);

			// Update friend's last_contact if interaction is not in the future
			const interactionDate = new Date(date);
			const today = new Date();
			if (interactionDate <= today) {
				const updateStmt = db.prepare(
					"UPDATE friends SET last_contact = ? WHERE id = ?",
				);
				updateStmt.run(date, friend_id);
			}

			return { id: info.lastInsertRowid, ...interactionData };
		} catch (err) {
			throw err;
		}
	});

	ipcMain.handle("get-friends-by-circle", async (event, circleId) => {
		try {
			const result = db
				.prepare("SELECT * FROM friends WHERE circle_id = ? ORDER BY name")
				.all(circleId);
			return result;
		} catch (err) {
			throw err;
		}
	});

	ipcMain.handle("get-interactions-by-friend", async (event, friendId) => {
		try {
			const result = db
				.prepare(
					"SELECT * FROM interactions WHERE friend_id = ? ORDER BY date DESC",
				)
				.all(friendId);
			return result;
		} catch (err) {
			throw err;
		}
	});

	ipcMain.handle(
		"update-friend-last-contact",
		async (event, friendId, date) => {
			try {
				const stmt = db.prepare(
					"UPDATE friends SET last_contact = ? WHERE id = ?",
				);
				stmt.run(date, friendId);
				return { id: friendId, last_contact: date };
			} catch (err) {
				throw err;
			}
		},
	);

	ipcMain.handle("delete-circle", async (event, circleId) => {
		try {
			// Delete all friends in this circle first
			const deleteStmt = db.prepare(
				"DELETE FROM friends WHERE circle_id = ?",
			);
			deleteStmt.run(circleId);

			// Then delete the circle
			const stmt = db.prepare("DELETE FROM circles WHERE id = ?");
			stmt.run(circleId);
			return { id: circleId };
		} catch (err) {
			throw err;
		}
	});

	ipcMain.handle("delete-friend", async (event, friendId) => {
		try {
			// Delete all interactions for this friend first
			const deleteInteractions = db.prepare(
				"DELETE FROM interactions WHERE friend_id = ?",
			);
			deleteInteractions.run(friendId);

			// Then delete the friend
			const stmt = db.prepare("DELETE FROM friends WHERE id = ?");
			stmt.run(friendId);
			return { id: friendId };
		} catch (err) {
			throw err;
		}
	});

	ipcMain.handle("delete-interaction", async (event, interactionId) => {
		try {
			const stmt = db.prepare("DELETE FROM interactions WHERE id = ?");
			stmt.run(interactionId);
			return { id: interactionId };
		} catch (err) {
			throw err;
		}
	});
}

app.whenReady().then(() => {
	initDatabase();
	setupIpcHandlers();
	createWindow();
});

app.on("window-all-closed", () => {
	if (db) {
		try {
			db.close();
			console.log("Database connection closed.");
		} catch (err) {
			console.error("Error closing database:", err.message);
		}
	}
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
