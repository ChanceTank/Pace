// Renderer process script for Pace app
const { ipcRenderer } = require("electron");

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
	console.log("Pace app renderer loaded successfully");

	// Initialize the app
	initApp();
});

async function initApp() {
	try {
		// Load initial data
		await loadCircles();
		await loadFriends();
		await loadInteractions();

		// Set up event listeners
		setupEventListeners();

		console.log("App initialized successfully");
	} catch (error) {
		console.error("Error initializing app:", error);
	}
}

async function loadCircles() {
	try {
		const circles = await window.electronAPI.getCircles();
		displayCircles(circles);
	} catch (error) {
		console.error("Error loading circles:", error);
	}
}

async function loadFriends() {
	try {
		const friends = await window.electronAPI.getFriends();
		displayFriends(friends);
	} catch (error) {
		console.error("Error loading friends:", error);
	}
}

async function loadInteractions() {
	try {
		const interactions = await window.electronAPI.getInteractions();
		displayInteractions(interactions);
	} catch (error) {
		console.error("Error loading interactions:", error);
	}
}

function displayCircles(circles) {
	const container = document.querySelector(".container");
	let circlesHtml = "<h2>Circles</h2>";
	if (circles.length === 0) {
		circlesHtml += "<p>No circles yet. Add your first circle!</p>";
	} else {
		circlesHtml += "<ul>";
		circles.forEach((circle) => {
			circlesHtml += `<li>${circle.name} (Frequency: ${circle.frequency_days} days)</li>`;
		});
		circlesHtml += "</ul>";
	}
	container.innerHTML += circlesHtml;
}

function displayFriends(friends) {
	const container = document.querySelector(".container");
	let friendsHtml = "<h2>Friends</h2>";
	if (friends.length === 0) {
		friendsHtml += "<p>No friends yet. Add your first friend!</p>";
	} else {
		friendsHtml += "<ul>";
		friends.forEach((friend) => {
			friendsHtml += `<li>${friend.name} (Last contact: ${friend.last_contact || "Never"})</li>`;
		});
		friendsHtml += "</ul>";
	}
	container.innerHTML += friendsHtml;
}

function displayInteractions(interactions) {
	const container = document.querySelector(".container");
	let interactionsHtml = "<h2>Recent Interactions</h2>";
	if (interactions.length === 0) {
		interactionsHtml +=
			"<p>No interactions yet. Log your first interaction!</p>";
	} else {
		interactionsHtml += "<ul>";
		interactions.forEach((interaction) => {
			const directionIcon =
				interaction.direction === "incoming" ? "📥" : "📤";
			interactionsHtml += `<li>${directionIcon} Friend ID ${interaction.friend_id}: ${interaction.notes} (${interaction.date})</li>`;
		});
		interactionsHtml += "</ul>";
	}
	container.innerHTML += interactionsHtml;
}

function setupEventListeners() {
	// Add event listeners for adding new items
	// This is a basic setup - in a real app, you'd have forms for input

	// Theme toggle
	const themeToggle = document.getElementById("themeToggle");
	themeToggle.addEventListener("click", () => {
		document.body.classList.toggle("dark-theme");
		const isDark = document.body.classList.contains("dark-theme");
		localStorage.setItem("theme", isDark ? "dark" : "light");
		themeToggle.textContent = isDark ? "Light Theme" : "Dark Theme";
	});

	// Load saved theme
	const savedTheme = localStorage.getItem("theme");
	if (savedTheme === "dark") {
		document.body.classList.add("dark-theme");
		themeToggle.textContent = "Light Theme";
	} else {
		themeToggle.textContent = "Dark Theme";
	}

	console.log("Event listeners set up");
}

// Example functions for adding data (would be called from forms in a real app)
async function addCircle(name, frequencyDays) {
	try {
		const newCircle = await window.electronAPI.addCircle({
			name,
			frequency_days: frequencyDays,
		});
		console.log("Added circle:", newCircle);
		await loadCircles(); // Refresh display
	} catch (error) {
		console.error("Error adding circle:", error);
	}
}

async function addFriend(name, circleId, lastContact) {
	try {
		const newFriend = await window.electronAPI.addFriend({
			name,
			circle_id: circleId,
			last_contact: lastContact,
		});
		console.log("Added friend:", newFriend);
		await loadFriends(); // Refresh display
	} catch (error) {
		console.error("Error adding friend:", newFriend);
	}
}

async function addInteraction(friendId, date, notes) {
	try {
		const newInteraction = await window.electronAPI.addInteraction({
			friend_id: friendId,
			date,
			notes,
		});
		console.log("Added interaction:", newInteraction);
		await loadInteractions(); // Refresh display
	} catch (error) {
		console.error("Error adding interaction:", error);
	}
}

// Expose functions to global scope for debugging (remove in production)
window.addCircle = addCircle;
window.addFriend = addFriend;
window.addInteraction = addInteraction;
