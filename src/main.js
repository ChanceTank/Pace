const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

let db;

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
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

	db = new sqlite3.Database(dbPath, (err) => {
		if (err) {
			console.error("Error opening database:", err.message);
		} else {
			console.log("Connected to the SQLite database.");
			// Run schema
			const schema = fs.readFileSync(schemaPath, "utf8");
			db.exec(schema, (err) => {
				if (err) {
					console.error("Error creating tables:", err.message);
				} else {
					console.log("Database tables created.");
				}
			});
		}
	});
}

function setupIpcHandlers() {
	ipcMain.handle("get-circles", async () => {
		return new Promise((resolve, reject) => {
			db.all("SELECT * FROM circles", [], (err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	});

	ipcMain.handle("add-circle", async (event, circleData) => {
		return new Promise((resolve, reject) => {
			const { name, frequency_days } = circleData;
			db.run(
				"INSERT INTO circles (name, frequency_days) VALUES (?, ?)",
				[name, frequency_days],
				function (err) {
					if (err) reject(err);
					else resolve({ id: this.lastID, ...circleData });
				},
			);
		});
	});

	ipcMain.handle("get-friends", async () => {
		return new Promise((resolve, reject) => {
			db.all("SELECT * FROM friends", [], (err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	});

	ipcMain.handle("add-friend", async (event, friendData) => {
		return new Promise((resolve, reject) => {
			const { name, circle_id, last_contact } = friendData;
			db.run(
				"INSERT INTO friends (name, circle_id, last_contact) VALUES (?, ?, ?)",
				[name, circle_id, last_contact],
				function (err) {
					if (err) reject(err);
					else resolve({ id: this.lastID, ...friendData });
				},
			);
		});
	});

	ipcMain.handle("get-interactions", async () => {
		return new Promise((resolve, reject) => {
			db.all("SELECT * FROM interactions", [], (err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	});

	ipcMain.handle("add-interaction", async (event, interactionData) => {
		return new Promise((resolve, reject) => {
			const {
				friend_id,
				date,
				notes,
				direction = "outgoing",
			} = interactionData;
			db.run(
				"INSERT INTO interactions (friend_id, date, notes, direction) VALUES (?, ?, ?, ?)",
				[friend_id, date, notes, direction],
				function (err) {
					if (err) reject(err);
					else resolve({ id: this.lastID, ...interactionData });
				},
			);
		});
	});
}

app.whenReady().then(() => {
	initDatabase();
	setupIpcHandlers();
	createWindow();
});

app.on("window-all-closed", () => {
	if (db) {
		db.close((err) => {
			if (err) {
				console.error("Error closing database:", err.message);
			} else {
				console.log("Database connection closed.");
			}
		});
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
