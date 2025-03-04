import { useLocation } from "react-router-dom";

const TaskDetail = () => {
  const location = useLocation();
  const task = location.state?.task;

  if (!task) {
    return <p>Task not found</p>;
  }

  return (
    <div>
      <h2>Task Detail</h2>
      <h3>{task.title}</h3>
      <p>Tag: {task.tag}</p>
    </div>
  );
};

export default TaskDetail;
