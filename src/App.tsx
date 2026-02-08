import { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import AddTodoForm from "./components/AddTodoForm";
import TodoList from "./components/TodoList";
import { TodoItem } from "./types";

function App() {
	const [theme, setTheme] = useState<"light" | "dark">(() => {
		const saved = localStorage.getItem("theme");
		return (saved as "light" | "dark") || "light";
	});
	const [todos, setTodos] = useState<TodoItem[]>([]);
	const [newTodoText, setNewTodoText] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingText, setEditingText] = useState("");

	// Log IPC availability for debugging
	console.log(
		"isElectron:",
		window.isElectron,
		"ipcRenderer available:",
		!!window.ipcRenderer,
	);

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

	useEffect(() => {
		// Load saved todos on component mount
		const loadTodos = () => {
			try {
				const data = localStorage.getItem("todos");
				if (data) {
					setTodos(JSON.parse(data));
				}
			} catch (error) {
				console.error("Error loading todos:", error);
			}
		};
		loadTodos();
	}, []);

	// CRUD Operations
	const addTodo = async () => {
		if (newTodoText.trim() === "") return;
		const newTodo: TodoItem = {
			id: Date.now().toString(),
			text: newTodoText.trim(),
			completed: false,
			timestamp: new Date().toISOString(),
		};
		const updatedTodos = [...todos, newTodo];
		setTodos(updatedTodos);
		setNewTodoText("");
		await saveTodos(updatedTodos);
	};

	const toggleTodo = async (id: string) => {
		const updatedTodos = todos.map((todo) =>
			todo.id === id ? { ...todo, completed: !todo.completed } : todo,
		);
		setTodos(updatedTodos);
		await saveTodos(updatedTodos);
	};

	const startEditing = (id: string, text: string) => {
		setEditingId(id);
		setEditingText(text);
	};

	const saveEdit = async () => {
		if (editingId && editingText.trim() !== "") {
			const updatedTodos = todos.map((todo) =>
				todo.id === editingId
					? { ...todo, text: editingText.trim() }
					: todo,
			);
			setTodos(updatedTodos);
			setEditingId(null);
			setEditingText("");
			await saveTodos(updatedTodos);
		}
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditingText("");
	};

	const deleteTodo = async (id: string) => {
		const updatedTodos = todos.filter((todo) => todo.id !== id);
		setTodos(updatedTodos);
		await saveTodos(updatedTodos);
	};

	const saveTodos = async (todosToSave: TodoItem[]) => {
		try {
			localStorage.setItem("todos", JSON.stringify(todosToSave));
			if (window.electronAPI) {
				const result = await window.electronAPI.saveData(todosToSave);
				if (!result.success) {
					console.error("Error saving todos:", result.error);
				}
			}
		} catch (error) {
			console.error("Error saving todos:", error);
		}
	};

	return (
		<div className="app-container">
			<div className="app-inner">
				<Header
					theme={theme}
					onToggleTheme={() =>
						setTheme((prev) => (prev === "light" ? "dark" : "light"))
					}
				/>
				<AddTodoForm
					newTodoText={newTodoText}
					onChange={setNewTodoText}
					onAdd={addTodo}
				/>
				<TodoList
					todos={todos}
					onToggle={toggleTodo}
					onStartEdit={startEditing}
					onSaveEdit={saveEdit}
					onCancelEdit={cancelEdit}
					onDelete={deleteTodo}
					editingId={editingId}
					editingText={editingText}
					setEditingText={setEditingText}
				/>
			</div>
		</div>
	);
}

export default App;
