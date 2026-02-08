import React from "react";
import { Group } from "../types";

interface GroupListProps {
	groups: Group[];
	onEdit: (group: Group) => void;
	onDelete: (id: string) => void;
}

const GroupList: React.FC<GroupListProps> = ({ groups, onEdit, onDelete }) => {
	return (
		<div className="group-list">
			<h2>Groups</h2>
			{groups.length === 0 ? (
				<p>No groups added yet.</p>
			) : (
				<ul>
					{groups.map((group) => (
						<li key={group.id} className="group-item">
							<div>
								<strong>{group.name}</strong>
								<p>Description: {group.description}</p>
								<p>Meeting Frequency: {group.meetingFrequency}</p>
							</div>
							<div>
								<button onClick={() => onEdit(group)}>Edit</button>
								<button onClick={() => onDelete(group.id)}>
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

export default GroupList;
