import React, { useState } from "react";
import { Tag } from "../types";

interface EditTagFormProps {
	tag: Tag;
	onSave: (tag: Tag) => void;
	onCancel: () => void;
}

const EditTagForm: React.FC<EditTagFormProps> = ({ tag, onSave, onCancel }) => {
	const [formData, setFormData] = useState({
		tag: tag.tag,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const updatedTag: Tag = {
			...tag,
			...formData,
			lastModifiedDate: new Date().toISOString(),
		};
		onSave(updatedTag);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<form onSubmit={handleSubmit} className="edit-tag-form">
			<h3>Edit Tag</h3>
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
			<button type="submit">Save</button>
			<button type="button" onClick={onCancel}>
				Cancel
			</button>
		</form>
	);
};

export default EditTagForm;
