import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/electron-vite.animate.svg";
import "./App.css";
import PeopleList from "./components/PeopleList";
import AddPersonForm from "./components/AddPersonForm";
import CircleList from "./components/CircleList";
import AddCircleForm from "./components/AddCircleForm";
import GroupList from "./components/GroupList";
import AddGroupForm from "./components/AddGroupForm";
import EditGroupForm from "./components/EditGroupForm";
import CheckinList from "./components/CheckinList";
import AddCheckinForm from "./components/AddCheckinForm";
import EditCheckinForm from "./components/EditCheckinForm";
import ActionItemList from "./components/ActionItemList";
import AddActionItemForm from "./components/AddActionItemForm";
import EditActionItemForm from "./components/EditActionItemForm";
import TagList from "./components/TagList";
import AddTagForm from "./components/AddTagForm";
import EditTagForm from "./components/EditTagForm";
import { Person, Circle, Group, Checkin, ActionItem, Tag } from "./types";

function App() {
	const [activeTab, setActiveTab] = useState("people");
	const [editingPerson, setEditingPerson] = useState<Person | null>(null);
	const [editingGroup, setEditingGroup] = useState<Group | null>(null);
	const [editingCheckin, setEditingCheckin] = useState<Checkin | null>(null);
	const [editingActionItem, setEditingActionItem] =
		useState<ActionItem | null>(null);
	const [editingTag, setEditingTag] = useState<Tag | null>(null);
	const [theme, setTheme] = useState<"light" | "dark">(() => {
		const saved = localStorage.getItem("theme");
		return (saved as "light" | "dark") || "light";
	});
	const [data, setData] = useState<AppData>({
		people: [],
		circles: [],
		groups: [],
		checkins: [],
		actionItems: [],
		tags: [],
		covenantTypes: [],
		personTags: [],
		personGroups: [],
		personCircles: [],
		personCovenantTypes: [],
		checkinTags: [],
		actionItemTags: [],
		checkinCovenantTypes: [],
	});

	// Load data on mount
	useEffect(() => {
		const loadData = async () => {
			if (window.ipcRenderer) {
				try {
					const loadedData = await window.ipcRenderer.loadData();
					setData(loadedData);
				} catch (error) {
					console.error("Error loading data:", error);
				}
			}
		};
		loadData();
	}, []);

	// Save data whenever it changes
	useEffect(() => {
		const saveData = async () => {
			if (window.ipcRenderer) {
				try {
					await window.ipcRenderer.saveData(data);
				} catch (error) {
					console.error("Error saving data:", error);
				}
			}
		};
		saveData();
	}, [data]);

	useEffect(() => {
		// Listen for theme toggle from main process
		const listener = () => {
			console.log("Theme toggle received");
			setTheme((prev) => (prev === "light" ? "dark" : "light"));
		};
		if (window.ipcRenderer) {
			window.ipcRenderer.on("toggle-theme", listener);

			// Cleanup
			return () => {
				window.ipcRenderer.off("toggle-theme", listener);
			};
		}
	}, []);

	useEffect(() => {
		// Apply theme to document
		console.log("Applying theme:", theme);
		document.documentElement.classList.toggle("dark", theme === "dark");
		localStorage.setItem("theme", theme);
	}, [theme]);

	const addPerson = (
		personData: Omit<Person, "id" | "creationDate" | "lastModifiedDate">,
	) => {
		const newPerson: Person = {
			...personData,
			id: Date.now().toString(),
			creationDate: new Date().toISOString(),
			lastModifiedDate: new Date().toISOString(),
		};
		setData((prev) => ({ ...prev, people: [...prev.people, newPerson] }));
	};

	const startEditPerson = (person: Person) => {
		setEditingPerson(person);
	};

	const saveEditPerson = (updatedPerson: Person) => {
		setData((prev) => ({
			...prev,
			people: prev.people.map((p) =>
				p.id === updatedPerson.id
					? {
							...updatedPerson,
							lastModifiedDate: new Date().toISOString(),
						}
					: p,
			),
		}));
		setEditingPerson(null);
	};

	const cancelEditPerson = () => {
		setEditingPerson(null);
	};

	const deletePerson = (id: string) => {
		setData((prev) => ({
			...prev,
			people: prev.people.filter((p) => p.id !== id),
		}));
	};

	const addCircle = (
		circleData: Omit<Circle, "id" | "creationDate" | "lastModifiedDate">,
	) => {
		const newCircle: Circle = {
			...circleData,
			id: Date.now().toString(),
			creationDate: new Date().toISOString(),
			lastModifiedDate: new Date().toISOString(),
		};
		setData((prev) => ({ ...prev, circles: [...prev.circles, newCircle] }));
	};

	const editCircle = (updatedCircle: Circle) => {
		setData((prev) => ({
			...prev,
			circles: prev.circles.map((c) =>
				c.id === updatedCircle.id
					? {
							...updatedCircle,
							lastModifiedDate: new Date().toISOString(),
						}
					: c,
			),
		}));
	};

	const deleteCircle = (id: string) => {
		setData((prev) => ({
			...prev,
			circles: prev.circles.filter((c) => c.id !== id),
		}));
	};

	const addGroup = (
		groupData: Omit<Group, "id" | "creationDate" | "lastModifiedDate">,
	) => {
		const newGroup: Group = {
			...groupData,
			id: Date.now().toString(),
			creationDate: new Date().toISOString(),
			lastModifiedDate: new Date().toISOString(),
		};
		setData((prev) => ({ ...prev, groups: [...prev.groups, newGroup] }));
	};

	const startEditGroup = (group: Group) => {
		setEditingGroup(group);
	};

	const saveEditGroup = (updatedGroup: Group) => {
		setData((prev) => ({
			...prev,
			groups: prev.groups.map((g) =>
				g.id === updatedGroup.id
					? {
							...updatedGroup,
							lastModifiedDate: new Date().toISOString(),
						}
					: g,
			),
		}));
		setEditingGroup(null);
	};

	const cancelEditGroup = () => {
		setEditingGroup(null);
	};

	const deleteGroup = (id: string) => {
		setData((prev) => ({
			...prev,
			groups: prev.groups.filter((g) => g.id !== id),
		}));
	};

	const addCheckin = (
		checkinData: Omit<Checkin, "id" | "creationDate" | "lastModifiedDate">,
	) => {
		const newCheckin: Checkin = {
			...checkinData,
			id: Date.now().toString(),
			creationDate: new Date().toISOString(),
			lastModifiedDate: new Date().toISOString(),
		};
		setData((prev) => ({
			...prev,
			checkins: [...prev.checkins, newCheckin],
		}));
	};

	const startEditCheckin = (checkin: Checkin) => {
		setEditingCheckin(checkin);
	};

	const saveEditCheckin = (updatedCheckin: Checkin) => {
		setData((prev) => ({
			...prev,
			checkins: prev.checkins.map((c) =>
				c.id === updatedCheckin.id
					? {
							...updatedCheckin,
							lastModifiedDate: new Date().toISOString(),
						}
					: c,
			),
		}));
		setEditingCheckin(null);
	};

	const cancelEditCheckin = () => {
		setEditingCheckin(null);
	};

	const deleteCheckin = (id: string) => {
		setData((prev) => ({
			...prev,
			checkins: prev.checkins.filter((c) => c.id !== id),
		}));
	};

	const addActionItem = (
		actionItemData: Omit<
			ActionItem,
			"id" | "creationDate" | "lastModifiedDate"
		>,
	) => {
		const newActionItem: ActionItem = {
			...actionItemData,
			id: Date.now().toString(),
			creationDate: new Date().toISOString(),
			lastModifiedDate: new Date().toISOString(),
		};
		setData((prev) => ({
			...prev,
			actionItems: [...prev.actionItems, newActionItem],
		}));
	};

	const startEditActionItem = (actionItem: ActionItem) => {
		setEditingActionItem(actionItem);
	};

	const saveEditActionItem = (updatedActionItem: ActionItem) => {
		setData((prev) => ({
			...prev,
			actionItems: prev.actionItems.map((a) =>
				a.id === updatedActionItem.id
					? {
							...updatedActionItem,
							lastModifiedDate: new Date().toISOString(),
						}
					: a,
			),
		}));
		setEditingActionItem(null);
	};

	const cancelEditActionItem = () => {
		setEditingActionItem(null);
	};

	const deleteActionItem = (id: string) => {
		setData((prev) => ({
			...prev,
			actionItems: prev.actionItems.filter((a) => a.id !== id),
		}));
	};

	const addTag = (
		tagData: Omit<Tag, "id" | "creationDate" | "lastModifiedDate">,
	) => {
		const newTag: Tag = {
			...tagData,
			id: Date.now().toString(),
			creationDate: new Date().toISOString(),
			lastModifiedDate: new Date().toISOString(),
		};
		setData((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
	};

	const startEditTag = (tag: Tag) => {
		setEditingTag(tag);
	};

	const saveEditTag = (updatedTag: Tag) => {
		setData((prev) => ({
			...prev,
			tags: prev.tags.map((t) =>
				t.id === updatedTag.id
					? {
							...updatedTag,
							lastModifiedDate: new Date().toISOString(),
						}
					: t,
			),
		}));
		setEditingTag(null);
	};

	const cancelEditTag = () => {
		setEditingTag(null);
	};

	const deleteTag = (id: string) => {
		setData((prev) => ({
			...prev,
			tags: prev.tags.filter((t) => t.id !== id),
		}));
	};

	return (
		<div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-colors">
			<div>
				<a href="https://electron-vite.github.io" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1 className="text-4xl font-bold">Pace - Relationship Management</h1>
			<div className="tabs">
				<button
					onClick={() => setActiveTab("people")}
					className={activeTab === "people" ? "active" : ""}>
					People
				</button>
				<button
					onClick={() => setActiveTab("circles")}
					className={activeTab === "circles" ? "active" : ""}>
					Circles
				</button>
				<button
					onClick={() => setActiveTab("groups")}
					className={activeTab === "groups" ? "active" : ""}>
					Groups
				</button>
				<button
					onClick={() => setActiveTab("checkins")}
					className={activeTab === "checkins" ? "active" : ""}>
					Check-ins
				</button>
				<button
					onClick={() => setActiveTab("actionItems")}
					className={activeTab === "actionItems" ? "active" : ""}>
					Action Items
				</button>
				<button
					onClick={() => setActiveTab("tags")}
					className={activeTab === "tags" ? "active" : ""}>
					Tags
				</button>
			</div>
			<div className="tab-content">
				{activeTab === "people" && (
					<div>
						<AddPersonForm onAdd={addPerson} />
						<PeopleList
							people={data.people}
							onEdit={startEditPerson}
							onDelete={deletePerson}
							editingPerson={editingPerson}
							onSaveEdit={saveEditPerson}
							onCancelEdit={cancelEditPerson}
						/>
					</div>
				)}
				{activeTab === "circles" && (
					<div>
						<AddCircleForm onAdd={addCircle} />
						<CircleList
							circles={data.circles}
							onEdit={editCircle}
							onDelete={deleteCircle}
						/>
					</div>
				)}
				{activeTab === "groups" && (
					<div>
						<AddGroupForm onAdd={addGroup} />
						<GroupList
							groups={data.groups}
							onEdit={startEditGroup}
							onDelete={deleteGroup}
						/>
						{editingGroup && (
							<EditGroupForm
								group={editingGroup}
								onSave={saveEditGroup}
								onCancel={cancelEditGroup}
							/>
						)}
					</div>
				)}
				{activeTab === "checkins" && (
					<div>
						<AddCheckinForm onAdd={addCheckin} />
						<CheckinList
							checkins={data.checkins}
							onEdit={startEditCheckin}
							onDelete={deleteCheckin}
						/>
						{editingCheckin && (
							<EditCheckinForm
								checkin={editingCheckin}
								onSave={saveEditCheckin}
								onCancel={cancelEditCheckin}
							/>
						)}
					</div>
				)}
				{activeTab === "actionItems" && (
					<div>
						<AddActionItemForm onAdd={addActionItem} />
						<ActionItemList
							actionItems={data.actionItems}
							onEdit={startEditActionItem}
							onDelete={deleteActionItem}
						/>
						{editingActionItem && (
							<EditActionItemForm
								actionItem={editingActionItem}
								onSave={saveEditActionItem}
								onCancel={cancelEditActionItem}
							/>
						)}
					</div>
				)}
				{activeTab === "tags" && (
					<div>
						<AddTagForm onAdd={addTag} />
						<TagList
							tags={data.tags}
							onEdit={startEditTag}
							onDelete={deleteTag}
						/>
						{editingTag && (
							<EditTagForm
								tag={editingTag}
								onSave={saveEditTag}
								onCancel={cancelEditTag}
							/>
						)}
					</div>
				)}
			</div>
			<button
				onClick={() =>
					setTheme((prev) => (prev === "light" ? "dark" : "light"))
				}
				className="ml-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded dark:bg-gray-600 dark:hover:bg-gray-800">
				Toggle Theme
			</button>
		</div>
	);
}

export default App;
