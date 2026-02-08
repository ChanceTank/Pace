import React from "react";
import { Check, X, Edit2, Trash2 } from "lucide-react";
import { TodoItem as TodoItemType } from "../types";

interface TodoItemProps {
	todo: TodoItemType;
	onToggle: (id: string) => void;
	onStartEdit: (id: string, text: string) => void;
	onSaveEdit: () => void;
	onCancelEdit: () => void;
	onDelete: (id: string) => void;
	editingId: string | null;
	editingText: string;
	setEditingText: (text: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
	todo,
	onToggle,
	onStartEdit,
	onSaveEdit,
	onCancelEdit,
	onDelete,
	editingId,
	editingText,
	setEditingText,
}) => {
	return (
		<div className={`todo-item ${todo.completed ? "completed" : ""}`}>
			<div className="todo-item-flex">
				<button
					onClick={() => onToggle(todo.id)}
					className={`toggle-button ${todo.completed ? "completed" : ""}`}>
					{todo.completed && <Check size={16} />}
				</button>

				{editingId === todo.id ? (
					<div className="edit-container">
						<input
							type="text"
							value={editingText}
							onChange={(e) => setEditingText(e.target.value)}
							onKeyPress={(e) => {
								if (e.key === "Enter") onSaveEdit();
								if (e.key === "Escape") onCancelEdit();
							}}
							className="edit-input"
							autoFocus
						/>
						<button onClick={onSaveEdit} className="save-button">
							<Check size={16} />
						</button>
						<button onClick={onCancelEdit} className="cancel-button">
							<X size={16} />
						</button>
					</div>
				) : (
					<>
						<span
							className={`todo-text ${todo.completed ? "completed" : ""}`}>
							{todo.text}
						</span>
						<div className="buttons-container">
							<button
								onClick={() => onStartEdit(todo.id, todo.text)}
								className="edit-button">
								<Edit2 size={16} />
							</button>
							<button
								onClick={() => onDelete(todo.id)}
								className="delete-button">
								<Trash2 size={16} />
							</button>
						</div>
					</>
				)}
			</div>
			<div className="timestamp">
				{new Date(todo.timestamp).toLocaleString()}
			</div>
		</div>
	);
};

export default TodoItem;
