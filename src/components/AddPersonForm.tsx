import React, { useState } from "react";
import { Person } from "../types";

interface AddPersonFormProps {
	onAdd: (
		person: Omit<Person, "id" | "creationDate" | "lastModifiedDate">,
	) => void;
}

const AddPersonForm: React.FC<AddPersonFormProps> = ({ onAdd }) => {
	const [formData, setFormData] = useState({
		name: "",
		contactInfo: "",
		lastCheckInDate: "",
		notes: "",
		birthday: "",
		anniversary: "",
		preferredCommunicationMethod: "",
		profilePicture: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onAdd(formData);
		setFormData({
			name: "",
			contactInfo: "",
			lastCheckInDate: "",
			notes: "",
			birthday: "",
			anniversary: "",
			preferredCommunicationMethod: "",
			profilePicture: "",
		});
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<form onSubmit={handleSubmit} className="add-person-form">
			<h3>Add New Person</h3>
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
				<label>Contact Info:</label>
				<input
					type="text"
					name="contactInfo"
					value={formData.contactInfo}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label>Last Check-in Date:</label>
				<input
					type="date"
					name="lastCheckInDate"
					value={formData.lastCheckInDate}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label>Notes:</label>
				<textarea
					name="notes"
					value={formData.notes}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label>Birthday:</label>
				<input
					type="date"
					name="birthday"
					value={formData.birthday}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label>Anniversary:</label>
				<input
					type="date"
					name="anniversary"
					value={formData.anniversary}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label>Preferred Communication:</label>
				<input
					type="text"
					name="preferredCommunicationMethod"
					value={formData.preferredCommunicationMethod}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label>Profile Picture URL:</label>
				<input
					type="text"
					name="profilePicture"
					value={formData.profilePicture}
					onChange={handleChange}
				/>
			</div>
			<button type="submit">Add Person</button>
		</form>
	);
};

export default AddPersonForm;
