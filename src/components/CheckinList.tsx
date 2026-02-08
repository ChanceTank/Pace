import React from "react";
import { Checkin } from "../types";

interface CheckinListProps {
	checkins: Checkin[];
	onEdit: (checkin: Checkin) => void;
	onDelete: (id: string) => void;
}

const CheckinList: React.FC<CheckinListProps> = ({
	checkins,
	onEdit,
	onDelete,
}) => {
	return (
		<div className="checkin-list">
			<h2>Check-ins</h2>
			{checkins.length === 0 ? (
				<p>No check-ins added yet.</p>
			) : (
				<ul>
					{checkins.map((checkin) => (
						<li key={checkin.id} className="checkin-item">
							<div>
								<strong>Person ID: {checkin.personId}</strong>
								<p>Date: {checkin.date}</p>
								<p>Duration: {checkin.duration}</p>
								<p>Type: {checkin.type}</p>
								<p>Notes: {checkin.notes}</p>
								<p>Summary Feeling: {checkin.summaryFeeling}</p>
								<p>Topics Discussed: {checkin.topicsDiscussed}</p>
								<p>Next Follow-up: {checkin.nextFollowUpDate}</p>
							</div>
							<div>
								<button onClick={() => onEdit(checkin)}>Edit</button>
								<button onClick={() => onDelete(checkin.id)}>
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

export default CheckinList;
