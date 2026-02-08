import React, { useState } from "react";
import { ActionItem } from "../types";

interface AddActionItemFormProps {
	onAdd: (
		actionItem: Omit<ActionItem, "id" | "creationDate" | "lastModifiedDate">,
	) => void;
}

const AddActionItemForm: React.FC<AddActionItemFormProps> = ({ onAdd }) => {
	const [formData, setFormData] = useState({
		checkinId: "",
		personId: "",
		description: "",
		dueDate: "",
		status: "pending",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onAdd({
			...formData,
			checkinId: formData.checkinId || undefined,
		});
		setFormData({
			checkinId: "",
			personId: "",
			description: "",
			dueDate: "",
			status: "pending",
		});
	};

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<form onSubmit={handleSubmit} className="add-action-item-form">
			<h3>Add New Action Item</h3>
			<div>
				<label>Check-in ID (optional):</label>
				<input
					type="text"
					name="checkinId"
					value={formData.checkinId}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label>Person ID:</label>
				<input
					type="text"
					name="personId"
					value={formData.personId}
					onChange={handleChange}
					required
				/>
			</div>
			<div>
				<label>Description:</label>
				<textarea
					name="description"
					value={formData.description}
					onChange={handleChange}
					required
				/>
			</div>
			<div>
				<label>Due Date:</label>
				<input
					type="date"
					name="dueDate"
					value={formData.dueDate}
					onChange={handleChange}
					required
				/>
			</div>
			<div>
				<label>Status:</label>
				<select
					name="status"
					value={formData.status}
					onChange={handleChange}>
					<option value="pending">Pending</option>
					<option value="in-progress">In Progress</option>
					<option value="completed">Completed</option>
				</select>
			</div>
			<button type="submit">Add Action Item</button>
		</form>
	);
};

export default AddActionItemForm;
