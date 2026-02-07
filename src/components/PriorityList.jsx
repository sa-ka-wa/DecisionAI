import React from "react";
import "../Components.Styles/PriorityList.css";

const PriorityList = ({ tasks }) => {
  const sortedTasks = [...tasks].sort((a, b) => a.priority - b.priority);

  const getPriorityIcon = (priority) => {
    const icons = {
      1: "🔥",
      2: "⚡",
      3: "⚠️",
      4: "📝",
      5: "💤",
    };
    return icons[priority] || icons[5];
  };

  const getPriorityText = (priority) => {
    const texts = {
      1: "Critical",
      2: "High",
      3: "Medium",
      4: "Low",
      5: "Minimal",
    };
    return texts[priority] || texts[5];
  };

  return (
    <div className="dashboard-card">
      <h2>Priority Ranking</h2>
      {tasks.map((task) => (
        <div key={task.id} className="task-item">
          <div className="priority-icon">{getPriorityIcon(task.priority)}</div>
          <div className="task-details">
            <h4>{task.title}</h4>
            <span
              className={`priority-badge ${task.priority <= 2 ? "priority-high" : "priority-low"}`}
            >
              {getPriorityText(task.priority)}
            </span>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${(task.priority / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PriorityList;
