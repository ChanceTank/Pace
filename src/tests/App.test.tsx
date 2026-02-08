import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import App from "../App";

describe("App", () => {
	test("renders the app with title and input", () => {
		render(<App />);
		expect(screen.getByText("Pace TODO")).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText("Add a new todo..."),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
	});

	test("adds a new todo", () => {
		render(<App />);
		const input = screen.getByPlaceholderText("Add a new todo...");
		const addButton = screen.getByRole("button", { name: /add/i });

		fireEvent.change(input, { target: { value: "Test todo" } });
		fireEvent.click(addButton);

		expect(screen.getByText("Test todo")).toBeInTheDocument();
		expect(input).toHaveValue("");
	});

	test("toggles todo completion", () => {
		render(<App />);
		const input = screen.getByPlaceholderText("Add a new todo...");
		const addButton = screen.getByRole("button", { name: /add/i });

		fireEvent.change(input, { target: { value: "Test todo" } });
		fireEvent.click(addButton);

		const toggleButton = screen
			.getAllByRole("button")
			.find((button) => button.classList.contains("toggle-button"));
		if (toggleButton) fireEvent.click(toggleButton);

		expect(screen.getByText("Test todo")).toHaveClass("completed");
	});

	test("edits a todo", () => {
		render(<App />);
		const input = screen.getByPlaceholderText("Add a new todo...");
		const addButton = screen.getByRole("button", { name: /add/i });

		fireEvent.change(input, { target: { value: "Test todo" } });
		fireEvent.click(addButton);

		const editButton = screen
			.getAllByRole("button")
			.find((btn) => btn.classList.contains("edit-button"));
		if (editButton) fireEvent.click(editButton);

		const editInput = screen.getByDisplayValue("Test todo");
		fireEvent.change(editInput, { target: { value: "Updated todo" } });
		const saveButton = screen
			.getAllByRole("button")
			.find((btn) => btn.classList.contains("save-button"));
		if (saveButton) fireEvent.click(saveButton);

		expect(screen.getByText("Updated todo")).toBeInTheDocument();
	});

	test("deletes a todo", () => {
		render(<App />);
		const input = screen.getByPlaceholderText("Add a new todo...");
		const addButton = screen.getByRole("button", { name: /add/i });

		fireEvent.change(input, { target: { value: "Test todo" } });
		fireEvent.click(addButton);

		const deleteButton = screen.getAllByRole("button")[4]; // Assuming delete is the 5th button
		fireEvent.click(deleteButton);

		expect(screen.queryByText("Test todo")).not.toBeInTheDocument();
	});
});
