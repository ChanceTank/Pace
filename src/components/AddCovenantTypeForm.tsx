import React, { useState } from "react";
import { CovenantType } from "../types";

interface AddCovenantTypeFormProps {
	onAdd: (
		covenantType: Omit<
			CovenantType,
			"id" | "creationDate" | "lastModifiedDate"
		>,
	) => void;
}

const AddCovenantTypeForm: React.FC<AddCovenantTypeFormProps> = ({ onAdd }) => {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onAdd(formData);
		setFormData({
			name: "",
			description: "",
		});
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<form onSubmit={handleSubmit} className="add-covenant-type-form">
			<h3>Add New Covenant Type</h3>
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
			<button type="submit">Add Covenant Type</button>
		</form>
	);
};

export default AddCovenantTypeForm;
