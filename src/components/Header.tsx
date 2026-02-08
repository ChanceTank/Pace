import React from "react";

interface HeaderProps {
	theme: "light" | "dark";
	onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
	return (
		<div className="header">
			<h1 className="app-title">Pace TODO</h1>
			<button onClick={onToggleTheme} className="theme-button">
				{theme === "light" ? "🌙" : "☀️"}
			</button>
		</div>
	);
};

export default Header;
