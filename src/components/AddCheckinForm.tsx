import React, { useState } from "react";
import { Checkin } from "../types";

interface AddCheckinFormProps {
	onAdd: (
		checkin: Omit<Checkin, "id" | "creationDate" | "lastModifiedDate">,
	) => void;
}

const AddCheckinForm: React.FC<AddCheckinFormProps> = ({ onAdd }) => {
	const [formData, setFormData] = useState({
		personId: "",
		date: "",
		duration: "",
		type: "",
		notes: "",
		summaryFeeling: "",
		topicsDiscussed: "",
		nextFollowUpDate: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onAdd(formData);
		setFormData({
			personId: "",
			date: "",
			duration: "",
			type: "",
			notes: "",
			summaryFeeling: "",
			topicsDiscussed: "",
			nextFollowUpDate: "",
		});
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<form onSubmit={handleSubmit} className="add-checkin-form">
			<h3>Add New Check-in</h3>
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
				<label>Date:</label>
				<input
					type="date"
					name="date"
					value={formData.date}
					onChange={handleChange}
					required
				/>
			</div>
			<div>
				<label>Duration:</label>
				<input
					type="text"
					name="duration"
					value={formData.duration}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label>Type:</label>
				<input
					type="text"
					name="type"
					value={formData.type}
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
				<label>Summary Feeling:</label>
				<input
					type="text"
					name="summaryFeeling"
					value={formData.summaryFeeling}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label>Topics Discussed:</label>
				<textarea
					name="topicsDiscussed"
					value={formData.topicsDiscussed}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label>Next Follow-up Date:</label>
				<input
					type="date"
					name="nextFollowUpDate"
					value={formData.nextFollowUpDate}
					onChange={handleChange}
				/>
			</div>
			<button type="submit">Add Check-in</button>
		</form>
	);
};

export default AddCheckinForm;
