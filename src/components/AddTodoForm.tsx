import React from "react";
import { Plus } from "lucide-react";

interface AddTodoFormProps {
	newTodoText: string;
	onChange: (value: string) => void;
	onAdd: () => void;
}

const AddTodoForm: React.FC<AddTodoFormProps> = ({
	newTodoText,
	onChange,
	onAdd,
}) => {
	return (
		<div className="add-form">
			<div className="add-form-flex">
				<input
					type="text"
					value={newTodoText}
					onChange={(e) => onChange(e.target.value)}
					onKeyPress={(e) => e.key === "Enter" && onAdd()}
					placeholder="Add a new todo..."
					className="todo-input"
				/>
				<button onClick={onAdd} className="add-button">
					<Plus size={20} />
					Add
				</button>
			</div>
		</div>
	);
};

export default AddTodoForm;
