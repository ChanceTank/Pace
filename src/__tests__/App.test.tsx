import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import App from "../App";

describe("App", () => {
	test("renders the form with all fields", () => {
		render(<App />);
		expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /submit/i }),
		).toBeInTheDocument();
	});

	test("updates form data on input change", () => {
		render(<App />);
		const nameInput = screen.getByLabelText(/name/i);
		const emailInput = screen.getByLabelText(/email/i);
		const messageInput = screen.getByLabelText(/message/i);

		fireEvent.change(nameInput, { target: { value: "John Doe" } });
		fireEvent.change(emailInput, { target: { value: "john@example.com" } });
		fireEvent.change(messageInput, { target: { value: "Hello world" } });

		expect(nameInput).toHaveValue("John Doe");
		expect(emailInput).toHaveValue("john@example.com");
		expect(messageInput).toHaveValue("Hello world");
	});

	test("submits form and resets fields", () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		render(<App />);

		const nameInput = screen.getByLabelText(/name/i);
		const emailInput = screen.getByLabelText(/email/i);
		const messageInput = screen.getByLabelText(/message/i);
		const submitButton = screen.getByRole("button", { name: /submit/i });

		fireEvent.change(nameInput, { target: { value: "John Doe" } });
		fireEvent.change(emailInput, { target: { value: "john@example.com" } });
		fireEvent.change(messageInput, { target: { value: "Hello world" } });
		fireEvent.click(submitButton);

		expect(consoleSpy).toHaveBeenCalledWith("Form submitted:", {
			name: "John Doe",
			email: "john@example.com",
			message: "Hello world",
		});

		expect(nameInput).toHaveValue("");
		expect(emailInput).toHaveValue("");
		expect(messageInput).toHaveValue("");

		consoleSpy.mockRestore();
	});
});
