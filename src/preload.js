// Preload script for secure IPC communication
const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
	// Database operations
	getCircles: () => ipcRenderer.invoke("get-circles"),
	addCircle: (circleData) => ipcRenderer.invoke("add-circle", circleData),
	getFriends: () => ipcRenderer.invoke("get-friends"),
	addFriend: (friendData) => ipcRenderer.invoke("add-friend", friendData),
	getInteractions: () => ipcRenderer.invoke("get-interactions"),
	addInteraction: (interactionData) =>
		ipcRenderer.invoke("add-interaction", interactionData),

	// App operations
	minimizeWindow: () => ipcRenderer.invoke("minimize-window"),
	maximizeWindow: () => ipcRenderer.invoke("maximize-window"),
	closeWindow: () => ipcRenderer.invoke("close-window"),
});
