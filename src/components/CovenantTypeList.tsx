import React from "react";
import { CovenantType } from "../types";

interface CovenantTypeListProps {
	covenantTypes: CovenantType[];
	onEdit: (covenantType: CovenantType) => void;
	onDelete: (id: string) => void;
}

const CovenantTypeList: React.FC<CovenantTypeListProps> = ({
	covenantTypes,
	onEdit,
	onDelete,
}) => {
	return (
		<div className="covenant-type-list">
			<h2>Covenant Types</h2>
			{covenantTypes.length === 0 ? (
				<p>No covenant types added yet.</p>
			) : (
				<ul>
					{covenantTypes.map((covenantType) => (
						<li key={covenantType.id} className="covenant-type-item">
							<div>
								<strong>{covenantType.name}</strong>
								<p>Description: {covenantType.description}</p>
							</div>
							<div>
								<button onClick={() => onEdit(covenantType)}>
									Edit
								</button>
								<button onClick={() => onDelete(covenantType.id)}>
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

export default CovenantTypeList;
