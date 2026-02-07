import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/electron-vite.animate.svg";
import "./App.css";

function App() {
	const [count, setCount] = useState(0);
	const [theme, setTheme] = useState<"light" | "dark">("light");

	useEffect(() => {
		// Listen for theme toggle from main process
		const listener = () => {
			setTheme((prev) => (prev === "light" ? "dark" : "light"));
		};
		window.ipcRenderer.on("toggle-theme", listener);

		// Cleanup
		return () => {
			window.ipcRenderer.off("toggle-theme", listener);
		};
	}, []);

	useEffect(() => {
		// Apply theme to document
		console.log("Applying theme:", theme);
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, [theme]);

	return (
		<>
			<div>
				<a href="https://electron-vite.github.io" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<button onClick={() => setCount((count) => count + 1)}>
					count is {count}
				</button>


				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more
			</p>
		</>
	);
}

export default App;
