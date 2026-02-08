import React from "react";
import { Person } from "../types";

interface PeopleListProps {
	people: Person[];
	onEdit: (person: Person) => void;
	onDelete: (id: string) => void;
	editingPerson: Person | null;
	onSaveEdit: (person: Person) => void;
	onCancelEdit: () => void;
}

const PeopleList: React.FC<PeopleListProps> = ({
	people,
	onEdit,
	onDelete,
}) => {
	return (
		<div className="people-list">
			<h2>People</h2>
			{people.length === 0 ? (
				<p>No people added yet.</p>
			) : (
				<ul>
					{people.map((person) => (
						<li key={person.id} className="person-item">
							<div>
								<strong>{person.name}</strong>
								<p>Contact: {person.contactInfo}</p>
								<p>Last Check-in: {person.lastCheckInDate}</p>
							</div>
							<div>
								<button onClick={() => onEdit(person)}>Edit</button>
								<button onClick={() => onDelete(person.id)}>
									Delete
								</button>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default PeopleList;
