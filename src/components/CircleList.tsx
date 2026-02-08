import React from "react";
import { Circle } from "../types";

interface CircleListProps {
	circles: Circle[];
	onEdit: (circle: Circle) => void;
	onDelete: (id: string) => void;
}

const CircleList: React.FC<CircleListProps> = ({
	circles,
	onEdit,
	onDelete,
}) => {
	return (
		<div className="circle-list">
			<h2>Circles</h2>
			{circles.length === 0 ? (
				<p>No circles added yet.</p>
			) : (
				<ul>
					{circles.map((circle) => (
						<li key={circle.id} className="circle-item">
							<div>
								<strong>{circle.name}</strong>
								<p>Description: {circle.description}</p>
								<p>Meeting Frequency: {circle.meetingFrequency}</p>
							</div>
							<div>
								<button onClick={() => onEdit(circle)}>Edit</button>
								<button onClick={() => onDelete(circle.id)}>
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

export default CircleList;
