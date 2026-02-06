// Preload script for secure IPC communication
const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
	// Database operations - Basic CRUD
	getCircles: () => ipcRenderer.invoke("get-circles"),
	addCircle: (circleData) => ipcRenderer.invoke("add-circle", circleData),
	deleteCircle: (circleId) => ipcRenderer.invoke("delete-circle", circleId),
	getFriends: () => ipcRenderer.invoke("get-friends"),
	addFriend: (friendData) => ipcRenderer.invoke("add-friend", friendData),
	deleteFriend: (friendId) => ipcRenderer.invoke("delete-friend", friendId),
	getInteractions: () => ipcRenderer.invoke("get-interactions"),
	addInteraction: (interactionData) =>
		ipcRenderer.invoke("add-interaction", interactionData),
	deleteInteraction: (interactionId) =>
		ipcRenderer.invoke("delete-interaction", interactionId),

	// Database operations - Queries
	getFriendsByCircle: (circleId) =>
		ipcRenderer.invoke("get-friends-by-circle", circleId),
	getInteractionsByFriend: (friendId) =>
		ipcRenderer.invoke("get-interactions-by-friend", friendId),
	updateFriendLastContact: (friendId, date) =>
		ipcRenderer.invoke("update-friend-last-contact", friendId, date),

	// App operations
	minimizeWindow: () => ipcRenderer.invoke("minimize-window"),
	maximizeWindow: () => ipcRenderer.invoke("maximize-window"),
	closeWindow: () => ipcRenderer.invoke("close-window"),
});
