const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const { startServer } = require("../backend/server");

let mainWindow;

function toggleTheme() {
	if (mainWindow) {
		mainWindow.webContents.send("toggle-theme");
	}
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1000,
		height: 700,
		autoHideMenuBar: false,
		webPreferences: {
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	mainWindow.loadFile(path.join(__dirname, "index.html"));

	// Create menu
	createMenu();

	// Open the DevTools (optional)
	// mainWindow.webContents.openDevTools();
}

function createMenu() {
	const template = [
		{
			label: "File",
			submenu: [
				{
					label: "Quit",
					accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
					click: () => {
						app.quit();
					},
				},
			],
		},
		{
			label: "View",
			submenu: [
				{
					label: "Toggle Dark/Light Theme",
					accelerator: "CmdOrCtrl+T",
					click: () => {
						toggleTheme();
					},
				},
				{ type: "separator" },
				{ role: "reload" },
				{ role: "forceReload" },
				{ role: "toggleDevTools" },
				{ type: "separator" },
				{ role: "resetZoom" },
				{ role: "zoomIn" },
				{ role: "zoomOut" },
				{ type: "separator" },
				{ role: "togglefullscreen" },
			],
		},
		{
			label: "Window",
			submenu: [{ role: "minimize" }, { role: "close" }],
		},
	];

	// macOS specific menu adjustments
	if (process.platform === "darwin") {
		template.unshift({
			label: app.getName(),
			submenu: [
				{ role: "about" },
				{ type: "separator" },
				{ role: "services" },
				{ type: "separator" },
				{ role: "hide" },
				{ role: "hideOthers" },
				{ role: "unhide" },
				{ type: "separator" },
				{ role: "quit" },
			],
		});

		// Window menu
		template[3].submenu = [
			{ role: "close" },
			{ role: "minimize" },
			{ role: "zoom" },
			{ type: "separator" },
			{ role: "front" },
		];
	}

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}

function toggleTheme() {
	if (mainWindow) {
		mainWindow.webContents.send("toggle-theme");
	}
}

// IPC communication is handled via webContents.send() to renderer

// Start the server and create window
app.whenReady().then(() => {
	startServer();
	createWindow();
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
