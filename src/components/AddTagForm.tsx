import React, { useState } from "react";
import { Tag } from "../types";

interface AddTagFormProps {
	onAdd: (tag: Omit<Tag, "id" | "creationDate" | "lastModifiedDate">) => void;
}

const AddTagForm: React.FC<AddTagFormProps> = ({ onAdd }) => {
	const [formData, setFormData] = useState({
		tag: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onAdd(formData);
		setFormData({
			tag: "",
		});
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<form onSubmit={handleSubmit} className="add-tag-form">
			<h3>Add New Tag</h3>
			<div>
				<label>Tag:</label>
				<input
					type="text"
					name="tag"
					value={formData.tag}
					onChange={handleChange}
					required
				/>
			</div>
			<button type="submit">Add Tag</button>
		</form>
	);
};

export default AddTagForm;
