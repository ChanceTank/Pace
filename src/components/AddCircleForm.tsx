import React, { useState } from "react";
import { Circle } from "../types";

interface AddCircleFormProps {
	onAdd: (
		circle: Omit<Circle, "id" | "creationDate" | "lastModifiedDate">,
	) => void;
}

const AddCircleForm: React.FC<AddCircleFormProps> = ({ onAdd }) => {
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
		<form onSubmit={handleSubmit} className="add-circle-form">
			<h3>Add New Circle</h3>
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
			<button type="submit">Add Circle</button>
		</form>
	);
};

export default AddCircleForm;
