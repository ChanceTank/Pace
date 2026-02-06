// Renderer process script for Pace app

// Store data for filtering/search
let allCircles = [];
let allFriends = [];
let allInteractions = [];

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

		// Update stats
		updateStats();

		console.log("App initialized successfully");
	} catch (error) {
		console.error("Error initializing app:", error);
	}
}

async function loadCircles() {
	try {
		allCircles = await window.electronAPI.getCircles();
		displayCircles(allCircles);
		populateCircleSelect(allCircles);
	} catch (error) {
		console.error("Error loading circles:", error);
	}
}

async function loadFriends() {
	try {
		allFriends = await window.electronAPI.getFriends();
		displayFriends(allFriends);
		populateFriendSelect(allFriends);
	} catch (error) {
		console.error("Error loading friends:", error);
	}
}

async function loadInteractions() {
	try {
		allInteractions = await window.electronAPI.getInteractions();
		displayInteractions(allInteractions);
	} catch (error) {
		console.error("Error loading interactions:", error);
	}
}

function displayCircles(circles) {
	const display = document.getElementById("circlesDisplay");
	if (circles.length === 0) {
		display.innerHTML =
			"<p style='grid-column: 1 / -1; text-align: center; color: #999;'>No circles yet. Add your first circle!</p>";
		return;
	}

	const circlesHtml = circles
		.map(
			(circle) => `
		<div class="card">
			<div class="card-header">
				<h3 class="card-title">${circle.name}</h3>
				<button class="btn-delete" data-circle-id="${circle.id}" title="Delete circle">🗑️</button>
			</div>
			<div class="card-meta">
				<strong>Frequency:</strong> Every ${circle.frequency_days} days
			</div>
		</div>
	`,
		)
		.join("");

	display.innerHTML = circlesHtml;

	// Add event listeners to delete buttons
	display.querySelectorAll(".btn-delete[data-circle-id]").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			const circleId = parseInt(btn.dataset.circleId);
			const circleName = btn
				.closest(".card")
				.querySelector(".card-title").textContent;
			confirmDelete(`circle "${circleName}"`, () => deleteCircle(circleId));
		});
	});
}

function displayFriends(friends) {
	const display = document.getElementById("friendsDisplay");
	if (friends.length === 0) {
		display.innerHTML =
			"<p style='grid-column: 1 / -1; text-align: center; color: #999;'>No friends yet. Add your first friend!</p>";
		return;
	}

	const friendsHtml = friends
		.map((friend) => {
			const status = calculateFriendStatus(friend);
			const lastContactDate = friend.last_contact
				? new Date(friend.last_contact).toLocaleDateString()
				: "Never";
			const circle = allCircles.find((c) => c.id === friend.circle_id);

			return `
		<div class="card">
			<div class="card-header">
				<h3 class="card-title">${friend.name}</h3>
				<button class="btn-delete" data-friend-id="${friend.id}" title="Delete friend">🗑️</button>
			</div>
			<div class="card-header">
				<span class="badge badge-${status.statusClass}">${status.statusText}</span>
			</div>
			<div class="card-meta">
				<strong>Circle:</strong> ${circle ? circle.name : "Unknown"}<br>
				<strong>Last Contact:</strong> ${lastContactDate}<br>
				<strong>Days Since:</strong> ${status.daysSince}
			</div>
		</div>
	`;
		})
		.join("");

	display.innerHTML = friendsHtml;

	// Add event listeners to delete buttons
	display.querySelectorAll(".btn-delete[data-friend-id]").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			const friendId = parseInt(btn.dataset.friendId);
			const friendName = btn
				.closest(".card")
				.querySelector(".card-title").textContent;
			confirmDelete(`friend "${friendName}"`, () => deleteFriend(friendId));
		});
	});
}

function displayInteractions(interactions) {
	const display = document.getElementById("interactionsDisplay");
	if (interactions.length === 0) {
		display.innerHTML =
			"<p style='grid-column: 1 / -1; text-align: center; color: #999;'>No interactions yet. Log your first interaction!</p>";
		return;
	}

	// Sort by date, most recent first
	const sorted = [...interactions].sort(
		(a, b) => new Date(b.date) - new Date(a.date),
	);

	const interactionsHtml = sorted
		.slice(0, 12) // Show last 12 interactions
		.map((interaction) => {
			const friend = allFriends.find((f) => f.id === interaction.friend_id);
			const directionIcon =
				interaction.direction === "incoming" ? "📥" : "📤";
			const dateStr = new Date(interaction.date).toLocaleDateString();

			return `
		<div class="card">
			<div class="card-header">
				<h3 class="card-title">${directionIcon} ${friend ? friend.name : "Unknown"}</h3>
				<button class="btn-delete" data-interaction-id="${interaction.id}" title="Delete interaction">🗑️</button>
			</div>
			<div class="card-meta">
				<strong>Date:</strong> ${dateStr}
			</div>
			${interaction.notes ? `<div class="card-notes">"${interaction.notes}"</div>` : ""}
		</div>
	`;
		})
		.join("");

	display.innerHTML = interactionsHtml;

	// Add event listeners to delete buttons
	display
		.querySelectorAll(".btn-delete[data-interaction-id]")
		.forEach((btn) => {
			btn.addEventListener("click", (e) => {
				e.stopPropagation();
				const interactionId = parseInt(btn.dataset.interactionId);
				const friendName = btn
					.closest(".card")
					.querySelector(".card-title")
					.textContent.trim();
				confirmDelete(`interaction with ${friendName}`, () =>
					deleteInteraction(interactionId),
				);
			});
		});
}

function updateStats() {
	// Update friend count
	document.getElementById("statFriends").textContent = allFriends.length;

	// Update circle count
	document.getElementById("statCircles").textContent = allCircles.length;

	// Calculate overdue and due soon
	let overdueCount = 0;
	let dueSoonCount = 0;

	allFriends.forEach((friend) => {
		const status = calculateFriendStatus(friend);
		if (status.statusClass === "overdue") overdueCount++;
		else if (status.statusClass === "due-soon") dueSoonCount++;
	});

	document.getElementById("statOverdue").textContent = overdueCount;
	document.getElementById("statDueSoon").textContent = dueSoonCount;

	// Display priority contacts
	displayPriority();
}

function displayPriority() {
	const display = document.getElementById("priorityDisplay");

	// Filter friends who are overdue or due soon
	const priorityFriends = allFriends
		.map((friend) => ({
			friend,
			status: calculateFriendStatus(friend),
		}))
		.filter(
			(f) =>
				f.status.statusClass === "overdue" ||
				f.status.statusClass === "due-soon",
		)
		.sort((a, b) => {
			// Overdue first, then due soon
			if (
				a.status.statusClass === "overdue" &&
				b.status.statusClass !== "overdue"
			)
				return -1;
			if (
				a.status.statusClass !== "overdue" &&
				b.status.statusClass === "overdue"
			)
				return 1;
			// Within same status, sort by days
			return b.status.daysSince - a.status.daysSince;
		})
		.slice(0, 5); // Show top 5

	if (priorityFriends.length === 0) {
		display.innerHTML =
			"<p style='text-align: center; color: #7f8c8d;'> ✅ All friends are on track!</p>";
		return;
	}

	const priorityHtml = priorityFriends
		.map(({ friend, status }) => {
			const circle = allCircles.find((c) => c.id === friend.circle_id);
			const lastContactDate = friend.last_contact
				? new Date(friend.last_contact).toLocaleDateString()
				: "Never";
			const badgeClass =
				status.statusClass === "overdue"
					? "priority-badge-overdue"
					: "priority-badge-due-soon";

			return `
		<div class="priority-item ${status.statusClass}">
			<div>
				<div class="priority-item-name">${friend.name}</div>
				<div class="priority-item-details">
					${circle ? circle.name : "Unknown circle"} • Last: ${lastContactDate} • ${status.daysSince} days ago
				</div>
			</div>
			<div class="priority-item-footer">
				<span class="priority-badge ${badgeClass}">${status.statusText}</span>
			</div>
		</div>
	`;
		})
		.join("");

	display.innerHTML = priorityHtml;
}

function calculateFriendStatus(friend) {
	if (!friend.last_contact) {
		return {
			statusText: "Never contacted",
			statusClass: "overdue",
			daysSince: "N/A",
		};
	}

	const circle = allCircles.find((c) => c.id === friend.circle_id);
	if (!circle) {
		return {
			statusText: "Unknown",
			statusClass: "on-track",
			daysSince: "N/A",
		};
	}

	const lastContactDate = new Date(friend.last_contact);
	const today = new Date();
	const daysSince = Math.floor(
		(today - lastContactDate) / (1000 * 60 * 60 * 24),
	);
	const frequencyDays = circle.frequency_days;

	if (daysSince > frequencyDays) {
		return {
			statusText: "Overdue",
			statusClass: "overdue",
			daysSince: daysSince,
		};
	} else if (daysSince > frequencyDays * 0.75) {
		return {
			statusText: "Due Soon",
			statusClass: "due-soon",
			daysSince: daysSince,
		};
	} else {
		return {
			statusText: "On Track",
			statusClass: "on-track",
			daysSince: daysSince,
		};
	}
}

function setupEventListeners() {
	// Theme toggle
	const themeToggle = document.getElementById("themeToggle");

	// Load saved theme first
	const savedTheme = localStorage.getItem("theme");
	if (savedTheme === "dark") {
		document.body.classList.add("dark-theme");
		if (themeToggle) themeToggle.textContent = "☀️ Light Theme";
	} else {
		document.body.classList.remove("dark-theme");
		if (themeToggle) themeToggle.textContent = "🌙 Dark Theme";
	}

	// Add click listener
	if (themeToggle) {
		themeToggle.addEventListener("click", (e) => {
			e.preventDefault();
			console.log("Theme toggle clicked");
			document.body.classList.toggle("dark-theme");
			const isDark = document.body.classList.contains("dark-theme");
			console.log("Dark theme is now:", isDark);
			localStorage.setItem("theme", isDark ? "dark" : "light");
			themeToggle.textContent = isDark ? "☀️ Light Theme" : "🌙 Dark Theme";
		});
	} else {
		console.warn("Theme toggle button not found");
	}

	// Search functionality
	const searchInput = document.getElementById("searchInput");
	searchInput.addEventListener("input", (e) => {
		const query = e.target.value.toLowerCase();
		const filteredCircles = allCircles.filter((c) =>
			c.name.toLowerCase().includes(query),
		);
		const filteredFriends = allFriends.filter((f) =>
			f.name.toLowerCase().includes(query),
		);
		displayCircles(filteredCircles);
		displayFriends(filteredFriends);
	});

	// Tab switching
	const tabBtns = document.querySelectorAll(".tab-btn");
	tabBtns.forEach((btn) => {
		btn.addEventListener("click", () => {
			// Remove active class from all buttons and content
			tabBtns.forEach((b) => b.classList.remove("active"));
			document
				.querySelectorAll(".tab-content")
				.forEach((c) => c.classList.remove("active"));

			// Add active class to clicked button and corresponding content
			btn.classList.add("active");
			const tabId = btn.getAttribute("data-tab");
			document.getElementById(tabId).classList.add("active");
		});
	});

	// Form event listeners
	document
		.getElementById("circleForm")
		.addEventListener("submit", handleCircleForm);
	document
		.getElementById("friendForm")
		.addEventListener("submit", handleFriendForm);
	document
		.getElementById("interactionForm")
		.addEventListener("submit", handleInteractionForm);

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
		document.getElementById("searchInput").value = ""; // Clear search
		await loadCircles(); // Refresh display
		updateStats();
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
		document.getElementById("searchInput").value = ""; // Clear search
		await loadFriends(); // Refresh display
		updateStats();
	} catch (error) {
		console.error("Error adding friend:", error);
	}
}

async function addInteraction(friendId, date, notes, direction) {
	try {
		const newInteraction = await window.electronAPI.addInteraction({
			friend_id: friendId,
			date,
			notes,
			direction,
		});
		console.log("Added interaction:", newInteraction);

		// Update friend's last contact if interaction is not in the future
		const interactionDate = new Date(date);
		const today = new Date();
		if (interactionDate <= today) {
			await window.electronAPI.updateFriendLastContact(friendId, date);
		}

		await loadInteractions(); // Refresh display
		await loadFriends(); // Refresh friends to update last contact status
		updateStats();
	} catch (error) {
		console.error("Error adding interaction:", error);
	}
}

// Delete functions
function confirmDelete(itemName, callback) {
	const confirmed = confirm(
		`Are you sure you want to delete ${itemName}? This action cannot be undone.`,
	);
	if (confirmed) {
		callback();
	}
}

async function deleteCircle(circleId) {
	try {
		await window.electronAPI.deleteCircle(circleId);
		console.log("Deleted circle:", circleId);
		document.getElementById("searchInput").value = ""; // Clear search
		await loadCircles(); // Refresh display
		await loadFriends(); // Refresh friends since circle is gone
		updateStats();
	} catch (error) {
		console.error("Error deleting circle:", error);
	}
}

async function deleteFriend(friendId) {
	try {
		await window.electronAPI.deleteFriend(friendId);
		console.log("Deleted friend:", friendId);
		document.getElementById("searchInput").value = ""; // Clear search
		await loadFriends(); // Refresh display
		await loadInteractions(); // Refresh interactions since friend is gone
		updateStats();
	} catch (error) {
		console.error("Error deleting friend:", error);
	}
}

async function deleteInteraction(interactionId) {
	try {
		await window.electronAPI.deleteInteraction(interactionId);
		console.log("Deleted interaction:", interactionId);
		await loadInteractions(); // Refresh display
		updateStats();
	} catch (error) {
		console.error("Error deleting interaction:", error);
	}
}

// Form handlers
async function handleCircleForm(event) {
	event.preventDefault();
	const name = document.getElementById("circleName").value;
	const frequency = parseInt(document.getElementById("circleFrequency").value);
	await addCircle(name, frequency);
	document.getElementById("circleForm").reset();
}

async function handleFriendForm(event) {
	event.preventDefault();
	const name = document.getElementById("friendName").value;
	const circleId = parseInt(document.getElementById("friendCircle").value);
	const lastContact =
		document.getElementById("friendLastContact").value || null;
	await addFriend(name, circleId, lastContact);
	document.getElementById("friendForm").reset();
}

async function handleInteractionForm(event) {
	event.preventDefault();
	const friendId = parseInt(
		document.getElementById("interactionFriend").value,
	);
	const date = document.getElementById("interactionDate").value;
	const notes = document.getElementById("interactionNotes").value;
	const direction = document.querySelector(
		'input[name="direction"]:checked',
	).value;
	await addInteraction(friendId, date, notes, direction);
	document.getElementById("interactionForm").reset();
}

// Populate select elements
function populateCircleSelect(circles) {
	const select = document.getElementById("friendCircle");
	select.innerHTML = '<option value="">Select a circle</option>';
	circles.forEach((circle) => {
		const option = document.createElement("option");
		option.value = circle.id;
		option.textContent = circle.name;
		select.appendChild(option);
	});

	// Add listener to show friends in selected circle
	select.addEventListener("change", async (e) => {
		const circleId = e.target.value;
		if (circleId) {
			await displayFriendsInCircle(parseInt(circleId));
		}
	});
}

function populateFriendSelect(friends) {
	const select = document.getElementById("interactionFriend");
	select.innerHTML = '<option value="">Select a friend</option>';
	friends.forEach((friend) => {
		const option = document.createElement("option");
		option.value = friend.id;
		option.textContent = friend.name;
		select.appendChild(option);
	});

	// Add listener to show interactions for selected friend
	select.addEventListener("change", async (e) => {
		const friendId = e.target.value;
		if (friendId) {
			await displayFriendInteractions(parseInt(friendId));
		}
	});
}

// Display friends in a selected circle
async function displayFriendsInCircle(circleId) {
	try {
		const friends = await window.electronAPI.getFriendsByCircle(circleId);
		const friendsList = document.createElement("div");
		friendsList.className = "friends-in-circle";
		friendsList.id = "friendsInCircle";

		if (friends.length === 0) {
			friendsList.innerHTML =
				"<p style='color: #999; font-size: 0.9em;'>No friends yet in this circle</p>";
		} else {
			friendsList.innerHTML = `
				<p style='color: #999; font-size: 0.9em;'><strong>Friends in this circle:</strong></p>
				${friends
					.map(
						(f) =>
							`<div style='padding: 5px; font-size: 0.9em;'>→ ${f.name}</div>`,
					)
					.join("")}
			`;
		}

		// Remove old list if exists
		const oldList = document.getElementById("friendsInCircle");
		if (oldList) oldList.remove();

		// Insert after the circle select
		const select = document.getElementById("friendCircle");
		select.parentNode.insertBefore(friendsList, select.nextSibling);
	} catch (error) {
		console.error("Error displaying friends in circle:", error);
	}
}

// Display interactions for a selected friend
async function displayFriendInteractions(friendId) {
	try {
		const interactions =
			await window.electronAPI.getInteractionsByFriend(friendId);
		const interactionsList = document.createElement("div");
		interactionsList.className = "interactions-for-friend";
		interactionsList.id = "interactionsForFriend";

		if (interactions.length === 0) {
			interactionsList.innerHTML =
				"<p style='color: #999; font-size: 0.9em;'>No interactions yet with this friend</p>";
		} else {
			const friend = allFriends.find((f) => f.id === friendId);
			const recentInteractions = interactions.slice(0, 3); // Show last 3
			interactionsList.innerHTML = `
				<p style='color: #999; font-size: 0.9em;'><strong>Recent interactions with ${friend ? friend.name : "this friend"}:</strong></p>
				${recentInteractions
					.map((i) => {
						const directionIcon =
							i.direction === "incoming" ? "📥" : "📤";
						const dateStr = new Date(i.date).toLocaleDateString();
						return `<div style='padding: 5px; font-size: 0.9em;'>${directionIcon} ${dateStr}</div>`;
					})
					.join("")}
			`;
		}

		// Remove old list if exists
		const oldList = document.getElementById("interactionsForFriend");
		if (oldList) oldList.remove();

		// Insert after the friend select
		const select = document.getElementById("interactionFriend");
		select.parentNode.insertBefore(interactionsList, select.nextSibling);
	} catch (error) {
		console.error("Error displaying friend interactions:", error);
	}
}

// Expose functions to global scope for debugging (remove in production)
window.addCircle = addCircle;
window.addFriend = addFriend;
window.addInteraction = addInteraction;
