import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/electron-vite.animate.svg";
import "./App.css";

function App() {
	const [count, setCount] = useState(0);
	const [theme, setTheme] = useState<"light" | "dark">(() => {
		const saved = localStorage.getItem("theme");
		return (saved as "light" | "dark") || "light";
	});

	// Log IPC availability for debugging
	console.log('isElectron:', window.isElectron, 'ipcRenderer available:', !!window.ipcRenderer);

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
			<h1 className="text-4xl font-bold">Welcome to Pace</h1>
			<div className="card bg-gray-100 dark:bg-gray-800 p-4 rounded">
				<button
					onClick={() => setCount((count) => count + 1)}
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded dark:bg-blue-600 dark:hover:bg-blue-800">
					count is {count}
				</button>
				<button
					onClick={() =>
						setTheme((prev) => (prev === "light" ? "dark" : "light"))
					}
					className="ml-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded dark:bg-gray-600 dark:hover:bg-gray-800">
					Toggle Theme
				</button>
				<p className="mt-2">Current theme: {theme}</p>
				<p>
					Edit{" "}
					<code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
						src/App.tsx
					</code>{" "}
					and save to test HMR
				</p>
			</div>
			<p className="read-the-docs text-gray-600 dark:text-gray-400">
				Click on the Vite and React logos to learn more
			</p>
		</div>
	);
}

export default App;
