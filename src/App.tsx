import { useState, useEffect } from "react";
import { Check, X, Edit2, Trash2, Plus } from "lucide-react";
import "./App.css";

interface TodoItem {
	id: string;
	text: string;
	completed: boolean;
	timestamp: string;
}

function App() {
	const [theme, setTheme] = useState<"light" | "dark">(() => {
		const saved = localStorage.getItem("theme");
		return (saved as "light" | "dark") || "light";
	});
	const [todos, setTodos] = useState<TodoItem[]>([]);
	const [newTodoText, setNewTodoText] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingText, setEditingText] = useState("");
	const [isExporting, setIsExporting] = useState(false);

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

	// Handle export request from main process
	useEffect(() => {
		const exportListener = () => {
			if (!isExporting) {
				setIsExporting(true);
				window.ipcRenderer.send("export-todos", todos);
			}
		};
		if (window.ipcRenderer) {
			window.ipcRenderer.on("get-todos", exportListener);
			return () => {
				window.ipcRenderer.off("get-todos", exportListener);
			};
		}
	}, [todos, isExporting]);

	// Listen for export completion
	useEffect(() => {
		const exportDoneListener = () => {
			setIsExporting(false);
		};
		if (window.ipcRenderer) {
			window.ipcRenderer.on("export-done", exportDoneListener);
			return () => {
				window.ipcRenderer.off("export-done", exportDoneListener);
			};
		}
	}, []);

	// Listen for imported todos
	useEffect(() => {
		const setTodosListener = async (_event: unknown, ...args: unknown[]) => {
			const importedTodos = args[0] as TodoItem[];
			setTodos(importedTodos);
			await saveTodos(importedTodos);
		};
		if (window.ipcRenderer) {
			window.ipcRenderer.on("set-todos", setTodosListener);
			return () => {
				window.ipcRenderer.off("set-todos", setTodosListener);
			};
		}
	}, []);

	return (
		<div className="app-container">
			<div className="app-inner">
				<div className="header">
					<h1 className="app-title">Pace TODO</h1>
					<button
						onClick={() =>
							setTheme((prev) => (prev === "light" ? "dark" : "light"))
						}
						className="theme-button">
						{theme === "light" ? "🌙" : "☀️"}
					</button>
				</div>

				{/* Add Todo Form */}
				<div className="add-form">
					<div className="add-form-flex">
						<input
							type="text"
							value={newTodoText}
							onChange={(e) => setNewTodoText(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && addTodo()}
							placeholder="Add a new todo..."
							className="todo-input"
						/>
						<button onClick={addTodo} className="add-button">
							<Plus size={20} />
							Add
						</button>
					</div>
				</div>

				{/* Todo List */}
				<div className="todo-list">
					{todos.length === 0 ? (
						<div className="empty-state">
							<p className="text-lg">No todos yet. Add one above!</p>
						</div>
					) : (
						todos.map((todo) => (
							<div
								key={todo.id}
								className={`todo-item ${todo.completed ? "completed" : ""}`}>
								<div className="todo-item-flex">
									<button
										onClick={() => toggleTodo(todo.id)}
										className={`toggle-button ${todo.completed ? "completed" : ""}`}>
										{todo.completed && <Check size={16} />}
									</button>

									{editingId === todo.id ? (
										<div className="edit-container">
											<input
												type="text"
												value={editingText}
												onChange={(e) =>
													setEditingText(e.target.value)
												}
												onKeyPress={(e) => {
													if (e.key === "Enter") saveEdit();
													if (e.key === "Escape") cancelEdit();
												}}
												className="edit-input"
												autoFocus
											/>
											<button
												onClick={saveEdit}
												className="save-button">
												<Check size={16} />
											</button>
											<button
												onClick={cancelEdit}
												className="cancel-button">
												<X size={16} />
											</button>
										</div>
									) : (
										<>
											<span
												className={`todo-text ${todo.completed ? "completed" : ""}`}>
												{todo.text}
											</span>
											<div className="buttons-container">
												<button
													onClick={() =>
														startEditing(todo.id, todo.text)
													}
													className="edit-button">
													<Edit2 size={16} />
												</button>
												<button
													onClick={() => deleteTodo(todo.id)}
													className="delete-button">
													<Trash2 size={16} />
												</button>
											</div>
										</>
									)}
								</div>
								<div className="timestamp">
									{new Date(todo.timestamp).toLocaleString()}
								</div>
							</div>
						))
					)}
				</div>

				{todos.length > 0 && (
					<div className="completed-count">
						<p>
							{todos.filter((t) => t.completed).length} of {todos.length}{" "}
							completed
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default App;
