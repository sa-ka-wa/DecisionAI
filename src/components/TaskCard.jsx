import React from "react";
import { format } from "date-fns";
import "../Components.Styles/TaskCard.css";

const TaskCard = ({ task, onEdit, onDelete }) => {
  const getPriorityClass = (priority) => {
    const classes = {
      1: "task-card-critical",
      2: "task-card-urgent",
      3: "task-card-high",
      4: "task-card-medium",
      5: "task-card-low",
    };
    return classes[priority] || classes[5];
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      1: { class: "priority-critical", label: "Critical", icon: "🔴" },
      2: { class: "priority-urgent", label: "Urgent", icon: "🟠" },
      3: { class: "priority-high", label: "High", icon: "🟡" },
      4: { class: "priority-medium", label: "Medium", icon: "🔵" },
      5: { class: "priority-low", label: "Low", icon: "🟢" },
    };
    return badges[priority] || badges[5];
  };

  const getStatusClass = (status) => {
    const classes = {
      completed: "status-completed",
      "in-progress": "status-in-progress",
      pending: "status-pending",
    };
    return classes[status] || classes.pending;
  };

  const getCategoryClass = (category) => {
    const classes = {
      Design: "category-design",
      Engineering: "category-engineering",
      Marketing: "category-marketing",
      Finance: "category-finance",
      Research: "category-research",
      Operations: "category-operations",
      Work: "category-design",
      Personal: "category-research",
      Health: "category-operations",
      Learning: "category-engineering",
    };
    return classes[category] || "category-design";
  };

  const getImpactColor = (impact) => {
    if (impact >= 8) return "text-red-600";
    if (impact >= 5) return "text-yellow-600";
    return "text-green-600";
  };

  const priorityInfo = getPriorityBadge(task.priority);

  return (
    <div className={`task-card ${getPriorityClass(task.priority)}`}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                {task.title}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#4b5563",
                  marginTop: "4px",
                }}
              >
                {task.description || "No description"}
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <span className={`status-badge ${getStatusClass(task.status)}`}>
                {task.status === "in-progress"
                  ? "In-progress"
                  : task.status === "completed"
                    ? "Completed"
                    : "Pending"}
              </span>
              <span
                className={`category-tag ${getCategoryClass(task.category)}`}
              >
                {task.category}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "16px",
            }}
          >
            <div style={{ display: "flex", gap: "24px" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <span>📅</span>
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#374151",
                  }}
                >
                  {format(new Date(task.dueDate), "MMM dd")}
                </span>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <span>{priorityInfo.icon}</span>
                <span className={`priority-badge ${priorityInfo.class}`}>
                  {priorityInfo.label}
                </span>
                <span>→</span>
                <span className={`${getImpactColor(task.impact)}`}>
                  Impact: {task.impact}/10
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => onEdit(task)} className="edit-btn">
                ✏️ Edit
              </button>
              <button onClick={() => onDelete(task.id)} className="delete-btn">
                🗑️ Delete
              </button>
            </div>
          </div>

          {task.progress !== undefined && (
            <div style={{ marginTop: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                <span>Progress</span>
                <span>{task.progress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
