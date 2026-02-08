import React, { useState } from "react";
import { Group } from "../types";

interface AddGroupFormProps {
	onAdd: (
		group: Omit<Group, "id" | "creationDate" | "lastModifiedDate">,
	) => void;
}

const AddGroupForm: React.FC<AddGroupFormProps> = ({ onAdd }) => {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		meetingFrequency: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onAdd(formData);
		setFormData({
			name: "",
			description: "",
			meetingFrequency: "",
		});
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<form onSubmit={handleSubmit} className="add-group-form">
			<h3>Add New Group</h3>
			<div>
				<label>Name:</label>
				<input
					type="text"
					name="name"
					value={formData.name}
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
				/>
			</div>
			<div>
				<label>Meeting Frequency:</label>
				<input
					type="text"
					name="meetingFrequency"
					value={formData.meetingFrequency}
					onChange={handleChange}
				/>
			</div>
			<button type="submit">Add Group</button>
		</form>
	);
};

export default AddGroupForm;
