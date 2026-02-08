import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import "../Pages.Styles/Tasks.css";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Work",
    priority: 3,
    impact: 5,
    dueDate: new Date().toISOString().split("T")[0],
    complexity: 3,
    estimatedHours: 1.0,
    tags: [],
    status: "pending",
  });

  // Real AI suggestion generation
  const generateAISuggestions = (tasks) => {
    if (!tasks || tasks.length === 0) {
      return {
        focusTasks: ["Add your first task to begin"],
        quickWins: ["Start with something simple"],
        tips: ["Break large tasks into smaller steps"],
        efficiencyScore: 0,
      };
    }

    const highPriority = tasks.filter(
      (t) => t.priority <= 2 && t.status !== "completed",
    );
    const overdue = tasks.filter((t) => {
      const dueDate = new Date(t.due_date);
      const today = new Date();
      return dueDate < today && t.status !== "completed";
    });
    const quickTasks = tasks.filter(
      (t) => t.complexity <= 2 && t.status === "pending",
    );

    return {
      focusTasks: highPriority.slice(0, 3).map((t) => t.title),
      quickWins: quickTasks.slice(0, 2).map((t) => t.title),
      tips: [
        overdue.length > 0
          ? `⚠️ ${overdue.length} tasks are overdue`
          : "All tasks are on schedule",
        highPriority.length > 0
          ? `🎯 Focus on ${highPriority.length} high-priority tasks`
          : "No urgent tasks pending",
        "Try the Pomodoro technique for better focus",
      ],
      efficiencyScore: calculateEfficiencyScore(tasks),
    };
  };

  const calculateEfficiencyScore = (tasks) => {
    if (tasks.length === 0) return 0;

    const completed = tasks.filter((t) => t.status === "completed").length;
    const highImpactCompleted = tasks.filter(
      (t) => t.status === "completed" && t.impact >= 7,
    ).length;
    const onTimeTasks = tasks.filter((t) => {
      if (t.status !== "completed" || !t.completed_at || !t.due_date)
        return false;
      const completed = new Date(t.completed_at);
      const due = new Date(t.due_date);
      return completed <= due;
    }).length;

    return Math.min(
      100,
      Math.round(
        (completed / tasks.length) * 40 +
          (highImpactCompleted / tasks.length) * 30 +
          (onTimeTasks / tasks.length) * 30,
      ),
    );
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      applyFiltersAndSort();
      setAiSuggestions(generateAISuggestions(tasks));
    }
  }, [tasks, filter, sortBy]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.getTasks();
      if (response.success) {
        setTasks(response.data || []);
      } else {
        console.error("Failed to fetch tasks:", response.message);
        setError("Failed to load tasks. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...tasks];

    // Apply filter
    if (filter !== "all") {
      filtered = filtered.filter((task) => {
        if (filter === "priority") return task.priority <= 2;
        if (filter === "overdue") {
          const dueDate = new Date(task.due_date);
          const today = new Date();
          return dueDate < today && task.status !== "completed";
        }
        return task.status === filter;
      });
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          return a.priority - b.priority;
        case "impact":
          return b.impact - a.impact;
        case "dueDate":
          return new Date(a.due_date) - new Date(b.due_date);
        case "complexity":
          return b.complexity - a.complexity;
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["priority", "impact", "complexity", "estimatedHours"].includes(
        name,
      )
        ? parseFloat(value)
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setAiLoading(true);

    try {
      // Generate AI insights for the task
      const aiInsights = await generateTaskAIInsights(formData);

      const taskData = {
        ...formData,
        ai_insights: aiInsights,
        tags: formData.tags.length > 0 ? formData.tags : [formData.category],
      };

      if (editingTask) {
        const response = await api.updateTask(editingTask.id, taskData);
        if (response.success) {
          setTasks(
            tasks.map((task) =>
              task.id === editingTask.id ? response.data : task,
            ),
          );
          resetForm();
          setIsModalOpen(false);
        } else {
          setError(response.message || "Failed to update task");
        }
      } else {
        const response = await api.createTask(taskData);
        if (response.success) {
          setTasks([...tasks, response.data]);
          resetForm();
          setIsModalOpen(false);
        } else {
          setError(response.message || "Failed to create task");
        }
      }
    } catch (error) {
      console.error("Error saving task:", error);
      setError(error.message || "An error occurred while saving the task");
    } finally {
      setAiLoading(false);
    }
  };

  const generateTaskAIInsights = async (taskData) => {
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 500));

    const complexityScore = Math.min(
      5,
      Math.ceil(
        (taskData.complexity + taskData.priority) / 2 +
          (taskData.description?.length > 100 ? 1 : 0),
      ),
    );

    const estimatedTime =
      taskData.estimatedHours *
      (complexityScore >= 4 ? 1.3 : complexityScore >= 3 ? 1.1 : 1);

    const potentialBlockers = [];
    if (taskData.complexity >= 4)
      potentialBlockers.push("High complexity may cause delays");
    if (taskData.priority <= 2 && taskData.impact >= 8)
      potentialBlockers.push("High stakes - needs careful planning");
    if (!taskData.description || taskData.description.length < 20)
      potentialBlockers.push("Vague requirements");

    return {
      complexity_score: complexityScore,
      estimated_completion_time: estimatedTime.toFixed(1),
      potential_blockers: potentialBlockers,
      recommended_approach:
        complexityScore >= 4 ? "Break into subtasks" : "Direct implementation",
      suggested_resources: ["Project documentation", "Related task history"],
      confidence_score: 0.85 + Math.random() * 0.1,
    };
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      category: task.category,
      priority: task.priority,
      impact: task.impact,
      dueDate: task.due_date
        ? task.due_date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      complexity: task.complexity || 3,
      estimatedHours: task.estimated_hours || 1.0,
      tags: task.tags || [],
      status: task.status || "pending",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (taskId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this task? This action cannot be undone.",
      )
    ) {
      try {
        const response = await api.deleteTask(taskId);
        if (response.success) {
          setTasks(tasks.filter((task) => task.id !== taskId));
        }
      } catch (error) {
        console.error("Error deleting task:", error);
        setError("Failed to delete task");
      }
    }
  };

  const handleComplete = async (taskId) => {
    try {
      const response = await api.updateTask(taskId, {
        status: "completed",
        progress: 100,
      });
      if (response.success) {
        setTasks(
          tasks.map((task) => (task.id === taskId ? response.data : task)),
        );
      }
    } catch (error) {
      console.error("Error completing task:", error);
      setError("Failed to complete task");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "Work",
      priority: 3,
      impact: 5,
      dueDate: new Date().toISOString().split("T")[0],
      complexity: 3,
      estimatedHours: 1.0,
      tags: [],
      status: "pending",
    });
    setEditingTask(null);
    setError(null);
  };

  const categories = [
    "Work",
    "Personal",
    "Health",
    "Finance",
    "Learning",
    "Home",
    "Social",
    "Creative",
    "Other",
  ];

  const getPriorityLabel = (priority) => {
    if (priority === 1) return "🔥 Critical";
    if (priority === 2) return "⚡ High";
    if (priority === 3) return "⚠️ Medium";
    if (priority === 4) return "📝 Low";
    return "💤 Minimal";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "status-completed";
      case "in-progress":
        return "status-in-progress";
      case "blocked":
        return "status-blocked";
      default:
        return "status-pending";
    }
  };

  const getPriorityClass = (priority) => {
    if (priority === 1) return "priority-critical";
    if (priority === 2) return "priority-high";
    if (priority === 3) return "priority-medium";
    return "priority-low";
  };

  if (loading) {
    return (
      <div className="loading-tasks">
        <div className="loading-spinner-neural"></div>
        <p style={{ color: "#00f3ff" }}>Loading Neural Tasks...</p>
      </div>
    );
  }

  return (
    <div className="neural-tasks-container">
      {/* Header */}
      <div className="tasks-header-neural">
        <div>
          <h1 className="tasks-title">Neural Task Management</h1>
          <p className="tasks-subtitle">
            AI-powered task optimization • Real-time productivity analysis
          </p>
        </div>
        <button
          className="add-task-btn-neon"
          onClick={() => setIsModalOpen(true)}
        >
          Create Neural Task
        </button>
      </div>

      {/* Stats */}
      <div className="neural-stats-container">
        <div className="stat-card-neon">
          <div className="stat-title-neon">TOTAL NEURAL TASKS</div>
          <div className="stat-value-neon">{tasks.length}</div>
          <div
            style={{
              marginTop: "10px",
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {tasks.filter((t) => t.status === "in-progress").length} in progress
          </div>
        </div>

        <div className="stat-card-neon">
          <div className="stat-title-neon">AI EFFICIENCY SCORE</div>
          <div className="stat-value-neon">
            {aiSuggestions?.efficiencyScore || 0}
          </div>
          <div
            style={{
              marginTop: "10px",
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {aiSuggestions?.efficiencyScore > 70
              ? "📈 Excellent"
              : aiSuggestions?.efficiencyScore > 50
                ? "↔️ Good"
                : "📉 Needs improvement"}
          </div>
        </div>

        <div className="stat-card-neon">
          <div className="stat-title-neon">HIGH PRIORITY</div>
          <div className="stat-value-neon">
            {
              tasks.filter((t) => t.priority <= 2 && t.status !== "completed")
                .length
            }
          </div>
          <div
            style={{ marginTop: "10px", fontSize: "0.9rem", color: "#ff5555" }}
          >
            {
              tasks.filter((t) => {
                const due = new Date(t.due_date);
                const today = new Date();
                return due < today && t.status !== "completed";
              }).length
            }{" "}
            overdue
          </div>
        </div>

        <div className="stat-card-neon">
          <div className="stat-title-neon">COMPLETION RATE</div>
          <div className="stat-value-neon">
            {tasks.length > 0
              ? `${Math.round((tasks.filter((t) => t.status === "completed").length / tasks.length) * 100)}%`
              : "0%"}
          </div>
          <div
            style={{
              marginTop: "10px",
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {tasks.filter((t) => t.status === "completed").length} completed
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="task-grid-neural">
        {/* Task List */}
        <div className="task-list-neural">
          <div className="task-list-header">
            <h2 style={{ margin: 0, fontSize: "1.3rem" }}>
              Neural Tasks ({filteredTasks.length})
            </h2>
            <div className="filter-controls">
              <select
                className="filter-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
                <option value="priority">High Priority</option>
                <option value="overdue">Overdue</option>
              </select>
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="priority">Sort by Priority</option>
                <option value="impact">Sort by Impact</option>
                <option value="dueDate">Sort by Due Date</option>
                <option value="complexity">Sort by Complexity</option>
              </select>
            </div>
          </div>

          {error && <div className="error-state">⚠️ {error}</div>}

          <div style={{ marginTop: "20px" }}>
            {filteredTasks.map((task) => (
              <div key={task.id} className="task-item-neural">
                <div className="task-header">
                  <div>
                    <h3 className="task-title">{task.title}</h3>
                    {task.description && (
                      <p className="task-description">
                        {task.description.length > 120
                          ? `${task.description.substring(0, 120)}...`
                          : task.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`status-badge ${getStatusColor(task.status)}`}
                  >
                    {task.status.replace("-", " ")}
                  </span>
                </div>

                <div className="task-meta">
                  <div className="task-tags">
                    <span className="task-tag">{task.category}</span>
                    {task.tags?.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="task-tag">
                        {tag}
                      </span>
                    ))}
                    {task.tags?.length > 2 && (
                      <span className="task-tag">+{task.tags.length - 2}</span>
                    )}
                  </div>

                  <div className="task-info">
                    <span
                      className={`priority-indicator ${getPriorityClass(task.priority)}`}
                    >
                      {getPriorityLabel(task.priority)}
                    </span>
                    <span
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Impact:{" "}
                      <strong style={{ color: "#00ff88" }}>
                        {task.impact}/10
                      </strong>
                    </span>
                    <span
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="task-actions">
                  {task.status !== "completed" && (
                    <button
                      className="action-btn complete-btn"
                      onClick={() => handleComplete(task.id)}
                    >
                      Mark Complete
                    </button>
                  )}
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(task)}
                  >
                    Edit
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="empty-state-neural">
              <div className="empty-icon">🧠</div>
              <h3>No Neural Tasks Found</h3>
              <p>
                {filter === "all"
                  ? "Create your first AI-optimized task to begin"
                  : `No tasks match the "${filter}" filter`}
              </p>
              {filter !== "all" && (
                <button
                  className="add-task-btn-neon"
                  onClick={() => setFilter("all")}
                  style={{ marginTop: "20px" }}
                >
                  Show All Tasks
                </button>
              )}
            </div>
          )}
        </div>

        {/* AI Suggestions Sidebar */}
        <div className="ai-sidebar">
          <div className="ai-header">
            <div className="ai-avatar-neural">AI</div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem" }}>
                Neural Assistant
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Real-time suggestions
              </p>
            </div>
          </div>

          {aiSuggestions && (
            <>
              {aiSuggestions.focusTasks.length > 0 && (
                <div className="ai-suggestion suggestion-focus">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>🎯</span>
                    <strong>Focus On</strong>
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "20px",
                      fontSize: "0.9rem",
                    }}
                  >
                    {aiSuggestions.focusTasks.map((task, idx) => (
                      <li
                        key={idx}
                        style={{
                          marginBottom: "5px",
                          color: "rgba(255,255,255,0.8)",
                        }}
                      >
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiSuggestions.quickWins.length > 0 && (
                <div className="ai-suggestion suggestion-win">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>⚡</span>
                    <strong>Quick Wins</strong>
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "20px",
                      fontSize: "0.9rem",
                    }}
                  >
                    {aiSuggestions.quickWins.map((task, idx) => (
                      <li
                        key={idx}
                        style={{
                          marginBottom: "5px",
                          color: "rgba(255,255,255,0.8)",
                        }}
                      >
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiSuggestions.tips.map((tip, idx) => (
                <div key={idx} className="ai-suggestion suggestion-tip">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "5px",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>💡</span>
                    <strong>AI Tip</strong>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.9rem",
                      color: "rgba(255,255,255,0.8)",
                    }}
                  >
                    {tip}
                  </p>
                </div>
              ))}

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "10px",
                  padding: "15px",
                  marginTop: "20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: "5px",
                  }}
                >
                  Neural Efficiency
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                    background: "linear-gradient(45deg, #00f3ff, #b967ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {aiSuggestions.efficiencyScore}/100
                </div>
              </div>
            </>
          )}

          <button
            className="add-task-btn-neon"
            onClick={() => setIsModalOpen(true)}
            style={{ width: "100%", marginTop: "25px" }}
          >
            + Ask AI to Create Task
          </button>
        </div>
      </div>

      {/* Create/Edit Task Modal */}
      {isModalOpen && (
        <div className="modal-overlay-neural">
          <div className="modal-content-neural">
            <div className="modal-header-neural">
              <h2 className="modal-title">
                {editingTask ? "Edit Neural Task" : "Create Neural Task"}
              </h2>
              <button
                className="modal-close-neon"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            {error && (
              <div
                style={{
                  margin: "0 30px",
                  padding: "12px",
                  background: "rgba(255, 85, 85, 0.1)",
                  border: "1px solid rgba(255, 85, 85, 0.3)",
                  borderRadius: "8px",
                  color: "#ff5555",
                  fontSize: "0.9rem",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <form className="modal-form-neural" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="What needs to be done?"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-input form-textarea"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the task in detail for better AI analysis..."
                  rows="4"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    name="category"
                    className="form-input"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-input"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Priority:{" "}
                    <span style={{ color: "#00f3ff" }}>
                      {getPriorityLabel(formData.priority)}
                    </span>
                  </label>
                  <div className="range-container">
                    <input
                      type="range"
                      name="priority"
                      min="1"
                      max="5"
                      className="form-input"
                      style={{ flex: 1 }}
                      value={formData.priority}
                      onChange={handleInputChange}
                    />
                    <span className="range-value">{formData.priority}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Impact:{" "}
                    <span style={{ color: "#00ff88" }}>
                      {formData.impact}/10
                    </span>
                  </label>
                  <div className="range-container">
                    <input
                      type="range"
                      name="impact"
                      min="1"
                      max="10"
                      className="form-input"
                      style={{ flex: 1 }}
                      value={formData.impact}
                      onChange={handleInputChange}
                    />
                    <span className="range-value">{formData.impact}</span>
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Complexity:{" "}
                    <span style={{ color: "#b967ff" }}>
                      {formData.complexity}/5
                    </span>
                  </label>
                  <div className="range-container">
                    <input
                      type="range"
                      name="complexity"
                      min="1"
                      max="5"
                      className="form-input"
                      style={{ flex: 1 }}
                      value={formData.complexity}
                      onChange={handleInputChange}
                    />
                    <span className="range-value">{formData.complexity}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Hours</label>
                  <input
                    type="number"
                    name="estimatedHours"
                    min="0.5"
                    step="0.5"
                    className="form-input"
                    value={formData.estimatedHours}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input
                  type="date"
                  name="dueDate"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="modal-buttons-neural">
                <button
                  type="button"
                  className="cancel-btn-neon"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  disabled={aiLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn-neon"
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <>
                      <span
                        style={{
                          display: "inline-block",
                          width: "12px",
                          height: "12px",
                          border: "2px solid transparent",
                          borderTop: "2px solid white",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                          marginRight: "8px",
                        }}
                      ></span>
                      {editingTask ? "AI Updating..." : "AI Analyzing..."}
                    </>
                  ) : editingTask ? (
                    "Update Neural Task"
                  ) : (
                    "Create Neural Task"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
