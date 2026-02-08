import React, { useState } from "react";
import { Group } from "../types";

interface EditGroupFormProps {
	group: Group;
	onSave: (group: Group) => void;
	onCancel: () => void;
}

const EditGroupForm: React.FC<EditGroupFormProps> = ({
	group,
	onSave,
	onCancel,
}) => {
	const [formData, setFormData] = useState({
		name: group.name,
		description: group.description,
		meetingFrequency: group.meetingFrequency,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const updatedGroup: Group = {
			...group,
			...formData,
			lastModifiedDate: new Date().toISOString(),
		};
		onSave(updatedGroup);
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<form onSubmit={handleSubmit} className="edit-group-form">
			<h3>Edit Group</h3>
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

export default EditGroupForm;
