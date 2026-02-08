import React from "react";
import { ActionItem } from "../types";

interface ActionItemListProps {
	actionItems: ActionItem[];
	onEdit: (actionItem: ActionItem) => void;
	onDelete: (id: string) => void;
}

const ActionItemList: React.FC<ActionItemListProps> = ({
	actionItems,
	onEdit,
	onDelete,
}) => {
	return (
		<div className="action-item-list">
			<h2>Action Items</h2>
			{actionItems.length === 0 ? (
				<p>No action items added yet.</p>
			) : (
				<ul>
					{actionItems.map((actionItem) => (
						<li key={actionItem.id} className="action-item-item">
							<div>
								<strong>{actionItem.description}</strong>
								<p>Person ID: {actionItem.personId}</p>
								<p>Due Date: {actionItem.dueDate}</p>
								<p>Status: {actionItem.status}</p>
								{actionItem.completedDate && (
									<p>Completed Date: {actionItem.completedDate}</p>
								)}
							</div>
							<div>
								<button onClick={() => onEdit(actionItem)}>Edit</button>
								<button onClick={() => onDelete(actionItem.id)}>
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

export default ActionItemList;
