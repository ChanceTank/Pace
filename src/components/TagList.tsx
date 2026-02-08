import React from "react";
import { Tag } from "../types";

interface TagListProps {
	tags: Tag[];
	onEdit: (tag: Tag) => void;
	onDelete: (id: string) => void;
}

const TagList: React.FC<TagListProps> = ({ tags, onEdit, onDelete }) => {
	return (
		<div className="tag-list">
			<h2>Tags</h2>
			{tags.length === 0 ? (
				<p>No tags added yet.</p>
			) : (
				<ul>
					{tags.map((tag) => (
						<li key={tag.id} className="tag-item">
							<div>
								<strong>{tag.tag}</strong>
							</div>
							<div>
								<button onClick={() => onEdit(tag)}>Edit</button>
								<button onClick={() => onDelete(tag.id)}>Delete</button>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default TagList;
