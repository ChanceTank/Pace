import React from "react";
import TodoItem from "./TodoItem";
import { TodoItem as TodoItemType } from "../types";

interface TodoListProps {
	todos: TodoItemType[];
	onToggle: (id: string) => void;
	onStartEdit: (id: string, text: string) => void;
	onSaveEdit: () => void;
	onCancelEdit: () => void;
	onDelete: (id: string) => void;
	editingId: string | null;
	editingText: string;
	setEditingText: (text: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({
	todos,
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
		<div className="todo-list">
			{todos.length === 0 ? (
				<div className="empty-state">
					<p className="text-lg">No todos yet. Add one above!</p>
				</div>
			) : (
				<>
					{todos.map((todo) => (
						<TodoItem
							key={todo.id}
							todo={todo}
							onToggle={onToggle}
							onStartEdit={onStartEdit}
							onSaveEdit={onSaveEdit}
							onCancelEdit={onCancelEdit}
							onDelete={onDelete}
							editingId={editingId}
							editingText={editingText}
							setEditingText={setEditingText}
						/>
					))}
					<div className="completed-count">
						<p>
							{todos.filter((t) => t.completed).length} of {todos.length}{" "}
							completed
						</p>
					</div>
				</>
			)}
		</div>
	);
};

export default TodoList;
