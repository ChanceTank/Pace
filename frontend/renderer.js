// Renderer process script for Pace app

// API base URL - Change this to your remote server URL when deploying
const API_URL = "http://localhost:3000/api"; // For remote server, use: "https://your-server-domain.com/api"

// Store data for filtering/search
let allCircles = [];
let allPeople = [];
let allCheckins = [];
let allGroups = [];
let allActionItems = [];
let allCovenantTypes = [];
let allTags = [];

// Theme toggle function
function toggleTheme() {
	document.body.classList.toggle("dark-theme");
	const isDark = document.body.classList.contains("dark-theme");
	localStorage.setItem("theme", isDark ? "dark" : "light");
}

// Utility function for API calls
async function apiCall(endpoint, options = {}) {
	try {
		const response = await fetch(`${API_URL}${endpoint}`, {
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			...options,
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "API request failed");
		}

		return await response.json();
	} catch (error) {
		console.error(`API Error [${endpoint}]:`, error);
		throw error;
	}
}

// Listen for theme toggle from menu
window.electronAPI.onToggleTheme(() => {
	toggleTheme();
});

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
		await loadPeople();
		await loadCheckins();
		await loadGroups();
		await loadActionItems();
		await loadCovenantTypes();
		await loadTags();

		// Apply saved theme
		const savedTheme = localStorage.getItem("theme");
		if (savedTheme === "dark") {
			document.body.classList.add("dark-theme");
		} else {
			document.body.classList.remove("dark-theme");
		}

		// Render initial dashboard
		renderDashboard();

		// Update stats
		updateStats();

		console.log("App initialized successfully");
	} catch (error) {
		console.error("Error initializing app:", error);
	}
}

async function loadCircles() {
	try {
		allCircles = await apiCall("/circles");
		displayCircles(allCircles);
		populateCircleSelect(allCircles);
	} catch (error) {
		console.error("Error loading circles:", error);
	}
}

async function loadPeople() {
	try {
		allPeople = await apiCall("/people");
		displayPeople(allPeople);
		populatePersonSelect(allPeople);
	} catch (error) {
		console.error("Error loading people:", error);
	}
}

async function loadCheckins() {
	try {
		allCheckins = await apiCall("/checkins");
		displayCheckins(allCheckins);
	} catch (error) {
		console.error("Error loading checkins:", error);
	}
}

async function loadGroups() {
	try {
		allGroups = await apiCall("/groups");
		displayGroups(allGroups);
	} catch (error) {
		console.error("Error loading groups:", error);
	}
}

async function loadActionItems() {
	try {
		allActionItems = await apiCall("/action_items");
		displayActionItems(allActionItems);
	} catch (error) {
		console.error("Error loading action items:", error);
	}
}

async function loadCovenantTypes() {
	try {
		allCovenantTypes = await apiCall("/covenant_types");
		displayCovenantTypes(allCovenantTypes);
	} catch (error) {
		console.error("Error loading covenant types:", error);
	}
}

async function loadTags() {
	try {
		allTags = await apiCall("/tags");
		displayTags(allTags);
	} catch (error) {
		console.error("Error loading tags:", error);
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
				<div class="card-actions">
					<button class="btn-edit" data-circle-id="${circle.id}" title="Edit circle">✏️</button>
					<button class="btn-delete" data-circle-id="${circle.id}" title="Delete circle">🗑️</button>
				</div>
			</div>
			<div class="card-meta">
				<strong>Frequency:</strong> Every ${circle.frequency_days} days
			</div>
		</div>
	`,
		)
		.join("");

	display.innerHTML = circlesHtml;

	// Add event listeners to edit buttons
	display.querySelectorAll(".btn-edit[data-circle-id]").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			const circleId = parseInt(btn.dataset.circleId);
			editCircle(circleId);
		});
	});

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

function displayPeople(people) {
	const display = document.getElementById("peopleDisplay");
	if (people.length === 0) {
		display.innerHTML =
			"<p style='grid-column: 1 / -1; text-align: center; color: #999;'>No people yet. Add your first person!</p>";
		return;
	}

	const peopleHtml = people
		.map((person) => {
			return `
		<div class="card">
			<div class="card-header">
				<h3 class="card-title">${person.name}</h3>
				<div class="card-actions">
					<button class="btn-edit" data-person-id="${person.id}" title="Edit person">✏️</button>
					<button class="btn-delete" data-person-id="${person.id}" title="Delete person">🗑️</button>
				</div>
			</div>
			<div class="card-meta">
				<strong>Birthday:</strong> ${person.birthday || "N/A"}<br>
				<strong>Anniversary:</strong> ${person.anniversary || "N/A"}<br>
				<strong>Preferred Communication:</strong> ${person.preferred_communication || "N/A"}
			</div>
		</div>
	`;
		})
		.join("");

	display.innerHTML = peopleHtml;

	// Add event listeners to edit buttons
	display.querySelectorAll(".btn-edit[data-person-id]").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			const personId = parseInt(btn.dataset.personId);
			editPerson(personId);
		});
	});

	// Add event listeners to delete buttons
	display.querySelectorAll(".btn-delete[data-person-id]").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			const personId = parseInt(btn.dataset.personId);
			const personName = btn
				.closest(".card")
				.querySelector(".card-title").textContent;
			confirmDelete(`person "${personName}"`, () => deletePerson(personId));
		});
	});
}

function displayCheckins(checkins) {
	const display = document.getElementById("checkinsDisplay");
	if (checkins.length === 0) {
		display.innerHTML =
			"<p style='grid-column: 1 / -1; text-align: center; color: #999;'>No checkins yet. Log your first checkin!</p>";
		return;
	}

	const checkinsHtml = checkins
		.slice(0, 12) // Show last 12 checkins
		.map((checkin) => {
			const person = allPeople.find((p) => p.id === checkin.person_id);
			const dateStr = new Date(checkin.creation_date).toLocaleDateString();

			return `
		<div class="card">
			<div class="card-header">
				<h3 class="card-title">${person ? person.name : "Unknown"}</h3>
				<button class="btn-delete" data-checkin-id="${checkin.id}" title="Delete checkin">🗑️</button>
			</div>
			<div class="card-meta">
				<strong>Date:</strong> ${dateStr}<br>
				<strong>Duration:</strong> ${checkin.duration || "N/A"}<br>
				<strong>Feeling:</strong> ${checkin.summary_feeling || "N/A"}
			</div>
			${checkin.notes ? `<div class="card-notes">"${checkin.notes}"</div>` : ""}
		</div>
	`;
		})
		.join("");

	display.innerHTML = checkinsHtml;

	// Add event listeners to delete buttons
	display.querySelectorAll(".btn-delete[data-checkin-id]").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			const checkinId = parseInt(btn.dataset.checkinId);
			const personName = btn
				.closest(".card")
				.querySelector(".card-title")
				.textContent.trim();
			confirmDelete(`checkin with ${personName}`, () =>
				deleteCheckin(checkinId),
			);
		});
	});
}

function displayGroups(groups) {
	const display = document.getElementById("groupsDisplay");
	if (groups.length === 0) {
		display.innerHTML =
			"<p style='grid-column: 1 / -1; text-align: center; color: #999;'>No groups yet. Add your first group!</p>";
		return;
	}

	const groupsHtml = groups
		.map((group) => {
			return `
		<div class="card">
			<div class="card-header">
				<h3 class="card-title">${group.name}</h3>
				<div class="card-actions">
					<button class="btn-edit" data-group-id="${group.id}" title="Edit group">✏️</button>
					<button class="btn-delete" data-group-id="${group.id}" title="Delete group">🗑️</button>
				</div>
			</div>
			<div class="card-meta">
				<strong>Description:</strong> ${group.description || "N/A"}<br>
				<strong>Meeting Frequency:</strong> ${group.meeting_frequency}
			</div>
		</div>
	`;
		})
		.join("");

	display.innerHTML = groupsHtml;

	// Add event listeners to edit buttons
	display.querySelectorAll(".btn-edit[data-group-id]").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			const groupId = parseInt(btn.dataset.groupId);
			editGroup(groupId);
		});
	});

	// Add event listeners to delete buttons
	display.querySelectorAll(".btn-delete[data-group-id]").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			const groupId = parseInt(btn.dataset.groupId);
			const groupName = btn
				.closest(".card")
				.querySelector(".card-title").textContent;
			confirmDelete(`group "${groupName}"`, () => deleteGroup(groupId));
		});
	});
}

function displayActionItems(actionItems) {
	const display = document.getElementById("actionItemsDisplay");
	if (actionItems.length === 0) {
		display.innerHTML =
			"<p style='grid-column: 1 / -1; text-align: center; color: #999;'>No action items yet.</p>";
		return;
	}

	const actionItemsHtml = actionItems
		.map((item) => {
			const person = allPeople.find((p) => p.id === item.person_id);
			return `
		<div class="card">
			<div class="card-header">
				<h3 class="card-title">${item.description}</h3>
				<div class="card-actions">
					<button class="btn-edit" data-action-item-id="${item.id}" title="Edit action item">✏️</button>
					<button class="btn-delete" data-action-item-id="${item.id}" title="Delete action item">🗑️</button>
				</div>
			</div>
			<div class="card-meta">
				<strong>Person:</strong> ${person ? person.name : "N/A"}<br>
				<strong>Due Date:</strong> ${item.due_date || "N/A"}<br>
				<strong>Status:</strong> ${item.status}
			</div>
		</div>
	`;
		})
		.join("");

	display.innerHTML = actionItemsHtml;

	// Add event listeners
	display.querySelectorAll(".btn-edit[data-action-item-id]").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			const actionItemId = parseInt(btn.dataset.actionItemId);
			editActionItem(actionItemId);
		});
	});

	display
		.querySelectorAll(".btn-delete[data-action-item-id]")
		.forEach((btn) => {
			btn.addEventListener("click", (e) => {
				e.stopPropagation();
				const actionItemId = parseInt(btn.dataset.actionItemId);
				const description = btn
					.closest(".card")
					.querySelector(".card-title").textContent;
				confirmDelete(`action item "${description}"`, () =>
					deleteActionItem(actionItemId),
				);
			});
		});
}

function displayCovenantTypes(covenantTypes) {
	const display = document.getElementById("covenantTypesDisplay");
	if (covenantTypes.length === 0) {
		display.innerHTML =
			"<p style='grid-column: 1 / -1; text-align: center; color: #999;'>No covenant types yet. Add your first covenant type!</p>";
		return;
	}

	const covenantTypesHtml = covenantTypes
		.map((type) => {
			return `
		<div class="card">
			<div class="card-header">
				<h3 class="card-title">${type.name}</h3>
				<div class="card-actions">
					<button class="btn-edit" data-covenant-type-id="${type.id}" title="Edit covenant type">✏️</button>
					<button class="btn-delete" data-covenant-type-id="${type.id}" title="Delete covenant type">🗑️</button>
				</div>
			</div>
			<div class="card-meta">
				<strong>Description:</strong> ${type.description || "N/A"}
			</div>
		</div>
	`;
		})
		.join("");

	display.innerHTML = covenantTypesHtml;

	// Add event listeners
	display
		.querySelectorAll(".btn-edit[data-covenant-type-id]")
		.forEach((btn) => {
			btn.addEventListener("click", (e) => {
				e.stopPropagation();
				const covenantTypeId = parseInt(btn.dataset.covenantTypeId);
				editCovenantType(covenantTypeId);
			});
		});

	display
		.querySelectorAll(".btn-delete[data-covenant-type-id]")
		.forEach((btn) => {
			btn.addEventListener("click", (e) => {
				e.stopPropagation();
				const covenantTypeId = parseInt(btn.dataset.covenantTypeId);
				const name = btn
					.closest(".card")
					.querySelector(".card-title").textContent;
				confirmDelete(`covenant type "${name}"`, () =>
					deleteCovenantType(covenantTypeId),
				);
			});
		});
}

function displayTags(tags) {
	const display = document.getElementById("tagsDisplay");
	if (tags.length === 0) {
		display.innerHTML =
			"<p style='grid-column: 1 / -1; text-align: center; color: #999;'>No tags yet. Add your first tag!</p>";
		return;
	}

	const tagsHtml = tags
		.map((tag) => {
			return `
		<div class="card">
			<div class="card-header">
				<h3 class="card-title">${tag.tag}</h3>
				<div class="card-actions">
					<button class="btn-edit" data-tag-id="${tag.id}" title="Edit tag">✏️</button>
					<button class="btn-delete" data-tag-id="${tag.id}" title="Delete tag">🗑️</button>
				</div>
			</div>
		</div>
	`;
		})
		.join("");

	display.innerHTML = tagsHtml;

	// Add event listeners
	display.querySelectorAll(".btn-edit[data-tag-id]").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			const tagId = parseInt(btn.dataset.tagId);
			editTag(tagId);
		});
	});

	display.querySelectorAll(".btn-delete[data-tag-id]").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			const tagId = parseInt(btn.dataset.tagId);
			const tagName = btn
				.closest(".card")
				.querySelector(".card-title").textContent;
			confirmDelete(`tag "${tagName}"`, () => deleteTag(tagId));
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
	document.getElementById("statFriends").textContent = allFriends.length;
	document.getElementById("statCircles").textContent = allCircles.length;

	let overdueCount = 0;
	let dueSoonCount = 0;

	allFriends.forEach((friend) => {
		const status = calculateFriendStatus(friend);
		if (status.statusClass === "overdue") overdueCount++;
		else if (status.statusClass === "due-soon") dueSoonCount++;
	});

	document.getElementById("statOverdue").textContent = overdueCount;
	document.getElementById("statDueSoon").textContent = dueSoonCount;

	displayPriority();
}

function displayPriority() {
	const display = document.getElementById("priorityDisplay");

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
			return b.status.daysSince - a.status.daysSince;
		})
		.slice(0, 5);

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
	const themeToggle = document.getElementById("themeToggle");

	const savedTheme = localStorage.getItem("theme");
	if (savedTheme === "dark") {
		document.body.classList.add("dark-theme");
		if (themeToggle) themeToggle.textContent = "☀️ Light Theme";
	} else {
		document.body.classList.remove("dark-theme");
		if (themeToggle) themeToggle.textContent = "🌙 Dark Theme";
	}

	if (themeToggle) {
		themeToggle.addEventListener("click", (e) => {
			e.preventDefault();
			document.body.classList.toggle("dark-theme");
			const isDark = document.body.classList.contains("dark-theme");
			localStorage.setItem("theme", isDark ? "dark" : "light");
			themeToggle.textContent = isDark ? "☀️ Light Theme" : "🌙 Dark Theme";
		});
	}

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

	const tabBtns = document.querySelectorAll(".tab-btn");
	tabBtns.forEach((btn) => {
		btn.addEventListener("click", () => {
			tabBtns.forEach((b) => b.classList.remove("active"));
			document
				.querySelectorAll(".tab-content")
				.forEach((c) => c.classList.remove("active"));

			btn.classList.add("active");
			const tabId = btn.getAttribute("data-tab");
			document.getElementById(tabId).classList.add("active");
		});
	});

	document
		.getElementById("circleForm")
		.addEventListener("submit", handleCircleForm);
	document
		.getElementById("friendForm")
		.addEventListener("submit", handleFriendForm);
	document
		.getElementById("interactionForm")
		.addEventListener("submit", handleInteractionForm);

	// Stat card navigation
	document
		.getElementById("friendsCard")
		.addEventListener("click", showFriendsPage);
	document
		.getElementById("circlesCard")
		.addEventListener("click", showCirclesPage);
	document
		.getElementById("overdueCard")
		.addEventListener("click", showOverduePage);
	document
		.getElementById("dueSoonCard")
		.addEventListener("click", showDueSoonPage);

	// Back button handlers
	document
		.getElementById("backFromFriends")
		.addEventListener("click", showDashboard);
	document
		.getElementById("backFromCircles")
		.addEventListener("click", showDashboard);
	document
		.getElementById("backFromOverdue")
		.addEventListener("click", showDashboard);
	document
		.getElementById("backFromDueSoon")
		.addEventListener("click", showDashboard);

	console.log("Event listeners set up");
}

// Navigation functions
function showDashboard() {
	renderDashboard();
}

function showFriendsPage() {
	renderFriendsPage();
}

function showCirclesPage() {
	renderCirclesPage();
}

function showOverduePage() {
	renderOverduePage();
}

function showDueSoonPage() {
	renderDueSoonPage();
}

// Page display functions
function displayAllFriendsPage() {
	const display = document.getElementById("friendsPageDisplay");

	if (allFriends.length === 0) {
		display.innerHTML =
			"<p style='grid-column: 1 / -1; text-align: center; color: #999; padding: 40px;'>No friends yet. Add your first friend from the dashboard!</p>";
		return;
	}

	// Group friends by circle
	const friendsByCircle = {};
	allFriends.forEach((friend) => {
		const circle = allCircles.find((c) => c.id === friend.circle_id);
		const circleName = circle ? circle.name : "Unknown Circle";
		if (!friendsByCircle[circleName]) {
			friendsByCircle[circleName] = [];
		}
		friendsByCircle[circleName].push(friend);
	});

	let html = "";
	Object.entries(friendsByCircle).forEach(([circleName, friends]) => {
		html += `<h3 style="grid-column: 1 / -1; margin-top: 30px; margin-bottom: 15px; color: var(--text-color);">${circleName}</h3>`;

		friends.forEach((friend) => {
			const status = calculateFriendStatus(friend);
			const lastContactDate = friend.last_contact
				? new Date(friend.last_contact).toLocaleDateString()
				: "Never";

			html += `
				<div class="card">
					<div class="card-header">
						<h3 class="card-title">${friend.name}</h3>
						<button class="btn-delete" data-friend-id="${friend.id}" title="Delete friend">🗑️</button>
					</div>
					<div class="card-header">
						<span class="badge badge-${status.statusClass}">${status.statusText}</span>
					</div>
					<div class="card-meta">
						<strong>Last Contact:</strong> ${lastContactDate}<br>
						<strong>Days Since:</strong> ${status.daysSince}
					</div>
				</div>
			`;
		});
	});

	display.innerHTML = html;

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

function displayAllCirclesPage() {
	const display = document.getElementById("circlesPageDisplay");

	if (allCircles.length === 0) {
		display.innerHTML =
			"<p style='grid-column: 1 / -1; text-align: center; color: #999; padding: 40px;'>No circles yet. Add your first circle from the dashboard!</p>";
		return;
	}

	const circlesHtml = allCircles
		.map((circle) => {
			const friendsInCircle = allFriends.filter(
				(f) => f.circle_id === circle.id,
			);
			return `
				<div class="card">
					<div class="card-header">
						<h3 class="card-title">${circle.name}</h3>
						<button class="btn-delete" data-circle-id="${circle.id}" title="Delete circle">🗑️</button>
					</div>
					<div class="card-meta">
						<strong>Frequency:</strong> Every ${circle.frequency_days} days<br>
						<strong>Members:</strong> ${friendsInCircle.length} friend${friendsInCircle.length !== 1 ? "s" : ""}
					</div>
				</div>
			`;
		})
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

function displayOverdueContactsPage() {
	const display = document.getElementById("overduePageDisplay");

	const overdueContacts = allFriends
		.filter((friend) => {
			const status = calculateFriendStatus(friend);
			return status.statusClass === "overdue";
		})
		.sort((a, b) => {
			const statusA = calculateFriendStatus(a);
			const statusB = calculateFriendStatus(b);
			return statusB.daysSince - statusA.daysSince;
		});

	if (overdueContacts.length === 0) {
		display.innerHTML =
			"<p style='text-align: center; color: #7f8c8d; padding: 40px;'>✅ No overdue contacts! All friends are up to date.</p>";
		return;
	}

	const html = overdueContacts
		.map((friend) => {
			const status = calculateFriendStatus(friend);
			const circle = allCircles.find((c) => c.id === friend.circle_id);
			const lastContactDate = friend.last_contact
				? new Date(friend.last_contact).toLocaleDateString()
				: "Never";

			return `
				<div class="card">
					<div class="card-header">
						<h3 class="card-title">${friend.name}</h3>
						<button class="btn-delete" data-friend-id="${friend.id}" title="Delete friend">🗑️</button>
					</div>
					<div class="card-meta">
						<strong>Circle:</strong> ${circle ? circle.name : "Unknown"}<br>
						<strong>Last Contact:</strong> ${lastContactDate}<br>
						<strong>Overdue By:</strong> ${status.daysSince - (circle?.frequency_days || 0)} days
					</div>
				</div>
			`;
		})
		.join("");

	display.innerHTML = html;

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

function displayDueSoonContactsPage() {
	const display = document.getElementById("dueSoonPageDisplay");

	const dueSoonContacts = allFriends
		.filter((friend) => {
			const status = calculateFriendStatus(friend);
			return status.statusClass === "due-soon";
		})
		.sort((a, b) => {
			const statusA = calculateFriendStatus(a);
			const statusB = calculateFriendStatus(b);
			return statusB.daysSince - statusA.daysSince;
		});

	if (dueSoonContacts.length === 0) {
		display.innerHTML =
			"<p style='text-align: center; color: #7f8c8d; padding: 40px;'>✅ No contacts due soon!</p>";
		return;
	}

	const html = dueSoonContacts
		.map((friend) => {
			const status = calculateFriendStatus(friend);
			const circle = allCircles.find((c) => c.id === friend.circle_id);
			const lastContactDate = friend.last_contact
				? new Date(friend.last_contact).toLocaleDateString()
				: "Never";
			const daysUntilDue = circle
				? circle.frequency_days - status.daysSince
				: "N/A";

			return `
				<div class="card">
					<div class="card-header">
						<h3 class="card-title">${friend.name}</h3>
						<button class="btn-delete" data-friend-id="${friend.id}" title="Delete friend">🗑️</button>
					</div>
					<div class="card-meta">
						<strong>Circle:</strong> ${circle ? circle.name : "Unknown"}<br>
						<strong>Last Contact:</strong> ${lastContactDate}<br>
						<strong>Due In:</strong> ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}
					</div>
				</div>
			`;
		})
		.join("");

	display.innerHTML = html;

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

async function addCircle(name, frequencyDays) {
	try {
		await apiCall("/circles", {
			method: "POST",
			body: JSON.stringify({
				name,
				frequency_days: frequencyDays,
			}),
		});
		document.getElementById("searchInput").value = "";
		await loadCircles();
		updateStats();
	} catch (error) {
		console.error("Error adding circle:", error);
	}
}

async function editCircle(circleId) {
	const circle = allCircles.find((c) => c.id === circleId);
	if (!circle) return;

	// Switch to circles tab
	document
		.querySelectorAll(".tab-btn")
		.forEach((btn) => btn.classList.remove("active"));
	document
		.querySelectorAll(".tab-content")
		.forEach((content) => content.classList.remove("active"));
	document
		.querySelector('[data-tab="circles-section"]')
		.classList.add("active");
	document.getElementById("circles-section").classList.add("active");

	// Populate form
	document.getElementById("circleName").value = circle.name;
	document.getElementById("circleFrequency").value = circle.frequency_days;
	document.getElementById("circleForm").dataset.editId = circleId;
	document.querySelector("#circleForm button").textContent = "Update Circle";
}

async function editFriend(friendId) {
	const friend = allFriends.find((f) => f.id === friendId);
	if (!friend) return;

	// Switch to friends tab
	document
		.querySelectorAll(".tab-btn")
		.forEach((btn) => btn.classList.remove("active"));
	document
		.querySelectorAll(".tab-content")
		.forEach((content) => content.classList.remove("active"));
	document
		.querySelector('[data-tab="friends-section"]')
		.classList.add("active");
	document.getElementById("friends-section").classList.add("active");

	// Populate form
	document.getElementById("friendName").value = friend.name;
	document.getElementById("friendCircle").value = friend.circle_id;
	document.getElementById("friendLastContact").value = friend.last_contact
		? friend.last_contact.split("T")[0]
		: "";
	document.getElementById("friendForm").dataset.editId = friendId;
	document.querySelector("#friendForm button").textContent = "Update Friend";
}

async function updateCircle(circleId, name, frequencyDays) {
	try {
		await apiCall(`/circles/${circleId}`, {
			method: "PUT",
			body: JSON.stringify({
				name,
				frequency_days: frequencyDays,
			}),
		});
		document.getElementById("searchInput").value = "";
		await loadCircles();
		await loadFriends(); // In case circle changes affect friend status
		updateStats();
	} catch (error) {
		console.error("Error updating circle:", error);
	}
}

async function updateFriend(friendId, name, circleId, lastContact) {
	try {
		await apiCall(`/friends/${friendId}`, {
			method: "PUT",
			body: JSON.stringify({
				name,
				circle_id: circleId,
				last_contact: lastContact,
			}),
		});
		document.getElementById("searchInput").value = "";
		await loadFriends();
		await loadInteractions();
		updateStats();
	} catch (error) {
		console.error("Error updating friend:", error);
	}
}

async function addFriend(name, circleId, lastContact) {
	try {
		await apiCall("/friends", {
			method: "POST",
			body: JSON.stringify({
				name,
				circle_id: circleId,
				last_contact: lastContact,
			}),
		});
		document.getElementById("searchInput").value = "";
		await loadFriends();
		updateStats();
	} catch (error) {
		console.error("Error adding friend:", error);
	}
}

async function addInteraction(friendId, date, notes, direction) {
	try {
		await apiCall("/interactions", {
			method: "POST",
			body: JSON.stringify({
				friend_id: friendId,
				date,
				notes,
				direction,
			}),
		});
		await loadInteractions();
		await loadFriends();
		updateStats();
	} catch (error) {
		console.error("Error adding interaction:", error);
	}
}

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
		await apiCall(`/circles/${circleId}`, { method: "DELETE" });
		document.getElementById("searchInput").value = "";
		await loadCircles();
		await loadFriends();
		updateStats();
		// Refresh current page if on circles page
		if (document.getElementById("circlesPage").style.display === "flex") {
			displayAllCirclesPage();
		}
	} catch (error) {
		console.error("Error deleting circle:", error);
	}
}

async function deleteFriend(friendId) {
	try {
		await apiCall(`/friends/${friendId}`, { method: "DELETE" });
		document.getElementById("searchInput").value = "";
		await loadFriends();
		await loadInteractions();
		updateStats();
		// Refresh current page if on one of the pages
		if (document.getElementById("friendsPage").style.display === "flex") {
			displayAllFriendsPage();
		} else if (
			document.getElementById("overduePage").style.display === "flex"
		) {
			displayOverdueContactsPage();
		} else if (
			document.getElementById("dueSoonPage").style.display === "flex"
		) {
			displayDueSoonContactsPage();
		}
	} catch (error) {
		console.error("Error deleting friend:", error);
	}
}

async function deleteInteraction(interactionId) {
	try {
		await apiCall(`/interactions/${interactionId}`, { method: "DELETE" });
		await loadInteractions();
		updateStats();
	} catch (error) {
		console.error("Error deleting interaction:", error);
	}
}

async function handleCircleForm(event) {
	event.preventDefault();
	const name = document.getElementById("circleName").value;
	const frequency = parseInt(document.getElementById("circleFrequency").value);
	const editId = document.getElementById("circleForm").dataset.editId;

	if (editId) {
		await updateCircle(parseInt(editId), name, frequency);
		delete document.getElementById("circleForm").dataset.editId;
		document.querySelector("#circleForm button").textContent = "Add Circle";
	} else {
		await addCircle(name, frequency);
	}
	document.getElementById("circleForm").reset();
}

async function handleFriendForm(event) {
	event.preventDefault();
	const name = document.getElementById("friendName").value;
	const circleId = parseInt(document.getElementById("friendCircle").value);
	const lastContact =
		document.getElementById("friendLastContact").value || null;
	const editId = document.getElementById("friendForm").dataset.editId;

	if (editId) {
		await updateFriend(parseInt(editId), name, circleId, lastContact);
		delete document.getElementById("friendForm").dataset.editId;
		document.querySelector("#friendForm button").textContent = "Add Friend";
	} else {
		await addFriend(name, circleId, lastContact);
	}
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

function populateCircleSelect(circles) {
	const select = document.getElementById("friendCircle");
	select.innerHTML = '<option value="">Select a circle</option>';
	circles.forEach((circle) => {
		const option = document.createElement("option");
		option.value = circle.id;
		option.textContent = circle.name;
		select.appendChild(option);
	});

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

	select.addEventListener("change", async (e) => {
		const friendId = e.target.value;
		if (friendId) {
			await displayFriendInteractions(parseInt(friendId));
		}
	});
}

async function displayFriendsInCircle(circleId) {
	try {
		const friends = await apiCall(`/friends/circle/${circleId}`);
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

		const oldList = document.getElementById("friendsInCircle");
		if (oldList) oldList.remove();

		const select = document.getElementById("friendCircle");
		select.parentNode.insertBefore(friendsList, select.nextSibling);
	} catch (error) {
		console.error("Error displaying friends in circle:", error);
	}
}

async function displayFriendInteractions(friendId) {
	try {
		const interactions = await apiCall(`/interactions/friend/${friendId}`);
		const interactionsList = document.createElement("div");
		interactionsList.className = "interactions-for-friend";
		interactionsList.id = "interactionsForFriend";

		if (interactions.length === 0) {
			interactionsList.innerHTML =
				"<p style='color: #999; font-size: 0.9em;'>No interactions yet with this friend</p>";
		} else {
			const friend = allFriends.find((f) => f.id === friendId);
			const recentInteractions = interactions.slice(0, 3);
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

		const oldList = document.getElementById("interactionsForFriend");
		if (oldList) oldList.remove();

		const select = document.getElementById("interactionFriend");
		select.parentNode.insertBefore(interactionsList, select.nextSibling);
	} catch (error) {
		console.error("Error displaying friend interactions:", error);
	}
}

// Render functions for node-based page loading
function renderFriendsPage() {
	const pageContainer = document.getElementById("pageContainer");
	pageContainer.innerHTML = "";

	const statPageDiv = document.createElement("div");
	statPageDiv.className = "stat-page";

	// Header
	const header = document.createElement("header");
	header.className = "stat-page-header";
	header.innerHTML = `
		<h1>All Friends</h1>
		<button id="backFromFriends" class="back-btn">← Back</button>
	`;
	statPageDiv.appendChild(header);

	// Main
	const main = document.createElement("main");
	main.className = "stat-main";
	const contentDiv = document.createElement("div");
	contentDiv.className = "stat-page-content";
	contentDiv.innerHTML = `
		<h2>Friends by Circle</h2>
		<div id="friendsPageDisplay" class="friends-page-grid"></div>
	`;
	main.appendChild(contentDiv);
	statPageDiv.appendChild(main);

	pageContainer.appendChild(statPageDiv);

	// Set up event listeners
	document
		.getElementById("backFromFriends")
		.addEventListener("click", showDashboard);
	displayAllFriendsPage();
	window.scrollTo(0, 0);
}

function renderCirclesPage() {
	const pageContainer = document.getElementById("pageContainer");
	pageContainer.innerHTML = "";

	const statPageDiv = document.createElement("div");
	statPageDiv.className = "stat-page";

	// Header
	const header = document.createElement("header");
	header.className = "stat-page-header";
	header.innerHTML = `
		<h1>All Circles</h1>
		<button id="backFromCircles" class="back-btn">← Back</button>
	`;
	statPageDiv.appendChild(header);

	// Main
	const main = document.createElement("main");
	main.className = "stat-main";
	const contentDiv = document.createElement("div");
	contentDiv.className = "stat-page-content";
	contentDiv.innerHTML = `
		<div id="circlesPageDisplay" class="circles-page-grid"></div>
	`;
	main.appendChild(contentDiv);
	statPageDiv.appendChild(main);

	pageContainer.appendChild(statPageDiv);

	// Set up event listeners
	document
		.getElementById("backFromCircles")
		.addEventListener("click", showDashboard);
	displayAllCirclesPage();
	window.scrollTo(0, 0);
}

function renderOverduePage() {
	const pageContainer = document.getElementById("pageContainer");
	pageContainer.innerHTML = "";

	const statPageDiv = document.createElement("div");
	statPageDiv.className = "stat-page";

	// Header
	const header = document.createElement("header");
	header.className = "stat-page-header";
	header.innerHTML = `
		<h1>⚠️ Overdue Contacts</h1>
		<button id="backFromOverdue" class="back-btn">← Back</button>
	`;
	statPageDiv.appendChild(header);

	// Main
	const main = document.createElement("main");
	main.className = "stat-main";
	const contentDiv = document.createElement("div");
	contentDiv.className = "stat-page-content";
	contentDiv.innerHTML = `
		<p class="stat-page-description">Friends who are overdue for contact based on their circle's frequency</p>
		<div id="overduePageDisplay" class="overdue-grid"></div>
	`;
	main.appendChild(contentDiv);
	statPageDiv.appendChild(main);

	pageContainer.appendChild(statPageDiv);

	// Set up event listeners
	document
		.getElementById("backFromOverdue")
		.addEventListener("click", showDashboard);
	displayOverdueContactsPage();
	window.scrollTo(0, 0);
}

function renderDueSoonPage() {
	const pageContainer = document.getElementById("pageContainer");
	pageContainer.innerHTML = "";

	const statPageDiv = document.createElement("div");
	statPageDiv.className = "stat-page";

	// Header
	const header = document.createElement("header");
	header.className = "stat-page-header";
	header.innerHTML = `
		<h1>📅 Due Soon Contacts</h1>
		<button id="backFromDueSoon" class="back-btn">← Back</button>
	`;
	statPageDiv.appendChild(header);

	// Main
	const main = document.createElement("main");
	main.className = "stat-main";
	const contentDiv = document.createElement("div");
	contentDiv.className = "stat-page-content";
	contentDiv.innerHTML = `
		<p class="stat-page-description">Friends who are coming due for contact in the next few days</p>
		<div id="dueSoonPageDisplay" class="due-soon-grid"></div>
	`;
	main.appendChild(contentDiv);
	statPageDiv.appendChild(main);

	pageContainer.appendChild(statPageDiv);

	// Set up event listeners
	document
		.getElementById("backFromDueSoon")
		.addEventListener("click", showDashboard);
	displayDueSoonContactsPage();
	window.scrollTo(0, 0);
}

function renderDashboard() {
	const pageContainer = document.getElementById("pageContainer");
	pageContainer.innerHTML = "";

	const dashboardDiv = document.createElement("div");
	dashboardDiv.className = "dashboard";

	// Header
	const header = document.createElement("header");
	header.className = "dashboard-header";
	header.innerHTML = `
		<h1>🔄 Pace</h1>
		<p>Social Frequency Tracker</p>
		<button id="backBtn" class="back-btn" style="display: none;">← Back to Dashboard</button>
	`;
	dashboardDiv.appendChild(header);

	// Main Content
	const main = document.createElement("main");
	main.className = "dashboard-main";
	main.id = "mainContent";
	main.innerHTML = `
		<!-- Stats Overview -->
		<div class="stats-overview">
			<div class="stat-card" id="friendsCard" style="cursor: pointer;">
				<div class="stat-value" id="statFriends">0</div>
				<div class="stat-label">Friends</div>
			</div>
			<div class="stat-card" id="circlesCard" style="cursor: pointer;">
				<div class="stat-value" id="statCircles">0</div>
				<div class="stat-label">Circles</div>
			</div>
			<div class="stat-card overdue" id="overdueCard" style="cursor: pointer;">
				<div class="stat-value" id="statOverdue">0</div>
				<div class="stat-label">Overdue</div>
			</div>
			<div class="stat-card due-soon" id="dueSoonCard" style="cursor: pointer;">
				<div class="stat-value" id="statDueSoon">0</div>
				<div class="stat-label">Due Soon</div>
			</div>
		</div>

		<!-- Priority Section -->
		<section class="dashboard-section">
			<h2>⚠️ Priority Contacts</h2>
			<div id="priorityDisplay" class="priority-list"></div>
		</section>

		<!-- Search -->
		<div class="search-box">
			<input type="text" id="searchInput" placeholder="Search circles or friends..." class="search-input">
		</div>

		<!-- Tabs/Sections -->
		<div class="tabs-section">
			<div class="tab-buttons">
				<button class="tab-btn active" data-tab="friends-section">Friends</button>
				<button class="tab-btn" data-tab="circles-section">Circles</button>
				<button class="tab-btn" data-tab="interactions-section">Interactions</button>
			</div>

			<!-- Friends Tab -->
			<div id="friends-section" class="tab-content active">
				<h2>Friends</h2>
				<form id="friendForm" class="data-form">
					<input type="text" id="friendName" placeholder="Friend name" required>
					<select id="friendCircle" required>
						<option value="">Select a circle</option>
					</select>
					<input type="date" id="friendLastContact">
					<button type="submit" class="btn-primary">Add Friend</button>
				</form>
				<div id="friendsDisplay" class="cards-grid"></div>
			</div>

			<!-- Circles Tab -->
			<div id="circles-section" class="tab-content">
				<h2>Circles</h2>
				<form id="circleForm" class="data-form">
					<input type="text" id="circleName" placeholder="Circle name" required>
					<input type="number" id="circleFrequency" placeholder="Frequency (days)" required>
					<button type="submit" class="btn-primary">Add Circle</button>
				</form>
				<div id="circlesDisplay" class="cards-grid"></div>
			</div>

			<!-- Interactions Tab -->
			<div id="interactions-section" class="tab-content">
				<h2>Interactions</h2>
				<form id="interactionForm" class="data-form">
					<select id="interactionFriend" required>
						<option value="">Select a friend</option>
					</select>
					<input type="date" id="interactionDate" required>
					<textarea id="interactionNotes" placeholder="Notes (optional)" rows="3"></textarea>
					<div class="radio-group">
						<label><input type="radio" name="direction" value="incoming" required> 📥 Incoming</label>
						<label><input type="radio" name="direction" value="outgoing"> 📤 Outgoing</label>
					</div>
					<button type="submit" class="btn-primary">Add Interaction</button>
				</form>
				<div id="interactionsDisplay" class="cards-grid"></div>
			</div>
		</div>
	`;
	dashboardDiv.appendChild(main);
	pageContainer.appendChild(dashboardDiv);

	// Set up event listeners for dashboard
	setupDashboardEventListeners();
}

function setupDashboardEventListeners() {
	// Stat card navigation
	document
		.getElementById("friendsCard")
		.addEventListener("click", showFriendsPage);
	document
		.getElementById("circlesCard")
		.addEventListener("click", showCirclesPage);
	document
		.getElementById("overdueCard")
		.addEventListener("click", showOverduePage);
	document
		.getElementById("dueSoonCard")
		.addEventListener("click", showDueSoonPage);

	// Search
	document.getElementById("searchInput").addEventListener("input", (e) => {
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

	// Tabs
	const tabBtns = document.querySelectorAll(".tab-btn");
	tabBtns.forEach((btn) => {
		btn.addEventListener("click", () => {
			tabBtns.forEach((b) => b.classList.remove("active"));
			document
				.querySelectorAll(".tab-content")
				.forEach((c) => c.classList.remove("active"));
			btn.classList.add("active");
			const tabId = btn.getAttribute("data-tab");
			document.getElementById(tabId).classList.add("active");
		});
	});

	// Forms
	document
		.getElementById("circleForm")
		.addEventListener("submit", handleCircleForm);
	document
		.getElementById("friendForm")
		.addEventListener("submit", handleFriendForm);
	document
		.getElementById("interactionForm")
		.addEventListener("submit", handleInteractionForm);

	// Populate selects
	populateCircleSelect(allCircles);
	populateFriendSelect(allFriends);
}

window.addCircle = addCircle;
window.addFriend = addFriend;
window.addInteraction = addInteraction;
