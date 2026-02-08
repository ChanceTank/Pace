import React, { useState } from "react";
import { ActionItem } from "../types";

interface EditActionItemFormProps {
	actionItem: ActionItem;
	onSave: (actionItem: ActionItem) => void;
	onCancel: () => void;
}

const EditActionItemForm: React.FC<EditActionItemFormProps> = ({
	actionItem,
	onSave,
	onCancel,
}) => {
	const [formData, setFormData] = useState({
		checkinId: actionItem.checkinId || "",
		personId: actionItem.personId,
		description: actionItem.description,
		dueDate: actionItem.dueDate,
		status: actionItem.status,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const updatedActionItem: ActionItem = {
			...actionItem,
			...formData,
			checkinId: formData.checkinId || undefined,
			lastModifiedDate: new Date().toISOString(),
		};
		onSave(updatedActionItem);
	};

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<form onSubmit={handleSubmit} className="edit-action-item-form">
			<h3>Edit Action Item</h3>
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
			<button type="submit">Save</button>
			<button type="button" onClick={onCancel}>
				Cancel
			</button>
		</form>
	);
};

export default EditActionItemForm;
