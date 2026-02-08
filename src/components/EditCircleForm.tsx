import React, { useState } from "react";
import { Circle } from "../types";

interface EditCircleFormProps {
	circle: Circle;
	onSave: (circle: Circle) => void;
	onCancel: () => void;
}

const EditCircleForm: React.FC<EditCircleFormProps> = ({
	circle,
	onSave,
	onCancel,
}) => {
	const [formData, setFormData] = useState({
		name: circle.name,
		description: circle.description,
		meetingFrequency: circle.meetingFrequency,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const updatedCircle: Circle = {
			...circle,
			...formData,
			lastModifiedDate: new Date().toISOString(),
		};
		onSave(updatedCircle);
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<form onSubmit={handleSubmit} className="edit-circle-form">
			<h3>Edit Circle</h3>
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
			<button type="submit">Save</button>
			<button type="button" onClick={onCancel}>
				Cancel
			</button>
		</form>
	);
};

export default EditCircleForm;
