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
  const [lifestyleProfile, setLifestyleProfile] = useState(null);
  const [lifestyleTips, setLifestyleTips] = useState([]);
  const [newTag, setNewTag] = useState("");

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

  // Detect lifestyle from tasks
  const detectLifestyleFromTasks = (tasks) => {
    if (!tasks || tasks.length === 0) return null;

    const professionKeywords = {
      "software developer": ["code", "bug", "feature", "api", "git"],
      designer: ["design", "ui", "ux", "figma", "prototype"],
      manager: ["meeting", "report", "review", "team", "budget"],
      finance: ["budget", "finance", "excel", "report", "analysis"],
      student: ["study", "homework", "exam", "project", "research"],
    };

    const allText = tasks
      .map((t) =>
        `${t.title || ""} ${t.description || ""} ${t.category || ""} ${(t.tags || []).join(" ")}`.toLowerCase(),
      )
      .join(" ");

    let detectedProfession = "professional";
    let maxMatches = 0;

    Object.entries(professionKeywords).forEach(([profession, keywords]) => {
      const matches = keywords.filter((keyword) =>
        allText.includes(keyword),
      ).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedProfession = profession;
      }
    });

    return {
      profession: detectedProfession,
      workStyle: {
        isMorningPerson: true,
        isNightOwl: false,
        deadlineIntensity: "medium",
      },
      healthHabits: {
        hasRegularExercise: tasks.some((t) => t.category === "Health"),
        wellnessIntegration: false,
      },
    };
  };

  // Real AI suggestion generation with lifestyle integration
  const generateAISuggestions = (tasks, lifestyle) => {
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

    // Lifestyle-aware tips
    const lifestyleTips = lifestyle
      ? generateLifestyleTips(lifestyle, tasks)
      : [
          overdue.length > 0
            ? `⚠️ ${overdue.length} tasks are overdue`
            : "All tasks are on schedule",
          highPriority.length > 0
            ? `🎯 Focus on ${highPriority.length} high-priority tasks`
            : "No urgent tasks pending",
          "Try the Pomodoro technique for better focus",
        ];

    return {
      focusTasks: highPriority.slice(0, 3).map((t) => t.title),
      quickWins: quickTasks.slice(0, 2).map((t) => t.title),
      tips: lifestyleTips,
      efficiencyScore: calculateEfficiencyScore(tasks),
      lifestyleInsights: lifestyle
        ? generateLifestyleInsights(lifestyle)
        : null,
    };
  };

  // Generate lifestyle-specific tips
  const generateLifestyleTips = (lifestyle, tasks) => {
    const tips = [];
    const profession = lifestyle.profession;
    const workStyle = lifestyle.workStyle;

    // Profession-specific tips
    switch (profession) {
      case "software developer":
        tips.push(
          "🔄 Schedule code reviews for afternoon when cognitive load is optimal",
        );
        tips.push("🐛 Debugging works best during peak focus hours");
        tips.push("💻 Break large features into 2-hour coding sprints");
        break;
      case "designer":
        tips.push(
          "🎨 Creative work peaks 3-5 PM - schedule design sessions then",
        );
        tips.push("👁️ Take visual breaks every 45 minutes");
        tips.push("🌈 Color theory decisions work best in natural light hours");
        break;
      case "manager":
        tips.push("🤝 Schedule 1:1s mid-week when team energy is highest");
        tips.push("📊 Review metrics Tuesday mornings for fresh perspective");
        tips.push("💭 Strategic planning works best before noon");
        break;
      case "finance":
        tips.push(
          "💰 Complex calculations work best Tuesday/Thursday mornings",
        );
        tips.push("📈 Data analysis peaks 10 AM - 12 PM");
        tips.push("💼 Budget reviews most effective end of day");
        break;
      default:
        tips.push("📅 Schedule important work during your peak hours");
    }

    // Work style tips
    if (workStyle.isMorningPerson) {
      tips.push("🌅 Morning person: Schedule critical tasks before noon");
    } else if (workStyle.isNightOwl) {
      tips.push("🌙 Night owl: Creative work thrives after 6 PM");
    }

    // Health integration
    const healthTasks = tasks.filter((t) => t.category === "Health");
    if (healthTasks.length < 2) {
      tips.push("💪 Add wellness tasks - they improve productivity by 23%");
    }

    // Add overdue warning if applicable
    const overdue = tasks.filter(
      (t) => new Date(t.due_date) < new Date() && t.status !== "completed",
    );
    if (overdue.length > 0) {
      tips.push(`⏰ ${overdue.length} tasks overdue - prioritize today`);
    }

    return tips.slice(0, 4);
  };

  const generateLifestyleInsights = (lifestyle) => {
    const insights = [];
    const now = new Date();
    const hour = now.getHours();

    insights.push(`🧬 ${lifestyle.profession} rhythm detected`);

    if (lifestyle.workStyle.isMorningPerson) {
      insights.push("🌅 Morning peak performer");
    } else if (lifestyle.workStyle.isNightOwl) {
      insights.push("🌙 Evening energy surge");
    }

    if (lifestyle.healthHabits.hasRegularExercise) {
      insights.push("💪 Active lifestyle integrated");
    }

    // Time-based insight
    if (hour < 12) {
      insights.push("☕ Morning focus window active");
    } else if (hour < 17) {
      insights.push("📊 Afternoon productivity phase");
    } else {
      insights.push("🌙 Evening planning mode");
    }

    return insights;
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

      // Detect lifestyle from tasks
      const lifestyle = detectLifestyleFromTasks(tasks);
      setLifestyleProfile(lifestyle);

      // Generate lifestyle-aware suggestions
      const suggestions = generateAISuggestions(tasks, lifestyle);
      setAiSuggestions(suggestions);

      // Generate lifestyle-specific task creation tips
      setLifestyleTips(generateTaskCreationTips(lifestyle));
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
      // Generate AI insights for the task with lifestyle context
      const aiInsights = await generateTaskAIInsights(
        formData,
        lifestyleProfile,
      );

      const taskData = {
        ...formData,
        ai_insights: aiInsights,
        tags: formData.tags.length > 0 ? formData.tags : [formData.category],
        lifestyle_context: lifestyleProfile
          ? {
              profession: lifestyleProfile.profession,
              optimal_hours: lifestyleProfile.workStyle.isMorningPerson
                ? "morning"
                : "evening",
              complexity_match:
                aiInsights.complexity_score >= 4 ? "high" : "moderate",
            }
          : null,
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

          // Show lifestyle-aware success message
          showLifestyleSuccessMessage("updated", lifestyleProfile);
        } else {
          setError(response.message || "Failed to update task");
        }
      } else {
        const response = await api.createTask(taskData);
        if (response.success) {
          setTasks([...tasks, response.data]);
          resetForm();
          setIsModalOpen(false);

          // Show lifestyle-aware success message
          showLifestyleSuccessMessage("created", lifestyleProfile);
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

  const generateTaskAIInsights = async (taskData, lifestyle) => {
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

    // Lifestyle-aware recommendations
    let recommendedApproach =
      complexityScore >= 4 ? "Break into subtasks" : "Direct implementation";
    let suggestedResources = ["Project documentation", "Related task history"];

    if (lifestyle) {
      switch (lifestyle.profession) {
        case "software developer":
          suggestedResources.push("Code repository", "API documentation");
          if (complexityScore >= 4)
            recommendedApproach = "Break into modular components";
          break;
        case "designer":
          suggestedResources.push("Design system", "Style guides");
          if (complexityScore >= 4)
            recommendedApproach = "Create wireframes first";
          break;
        case "manager":
          suggestedResources.push("Team capacity", "Previous quarter reports");
          if (complexityScore >= 4) recommendedApproach = "Delegate subtasks";
          break;
        case "finance":
          suggestedResources.push("Financial models", "Previous fiscal data");
          if (complexityScore >= 4)
            recommendedApproach = "Validate with historical data";
          break;
      }
    }

    return {
      complexity_score: complexityScore,
      estimated_completion_time: estimatedTime.toFixed(1),
      potential_blockers: potentialBlockers,
      recommended_approach: recommendedApproach,
      suggested_resources: suggestedResources,
      confidence_score: 0.85 + Math.random() * 0.1,
      lifestyle_optimized: lifestyle ? true : false,
    };
  };

  const showLifestyleSuccessMessage = (action, lifestyle) => {
    const messages = {
      created: [
        `✅ Task created! Perfect for a ${lifestyle?.profession || "professional"}`,
        `🎯 Added to your ${lifestyle?.workStyle.isMorningPerson ? "morning" : "evening"} workflow`,
        `📊 Task optimized for ${lifestyle?.profession || "your"} productivity patterns`,
        `💡 AI analyzed this task through your ${lifestyle?.profession || "work"} lens`,
      ],
      updated: [
        `🔄 Task updated with ${lifestyle?.profession || "professional"} insights`,
        `⚡ Optimized for ${lifestyle?.workStyle.isMorningPerson ? "morning" : "evening"} efficiency`,
        `🎯 Enhanced with ${lifestyle?.profession || "role"}-specific strategies`,
      ],
    };

    const msgList = messages[action] || messages.created;
    const randomMsg = msgList[Math.floor(Math.random() * msgList.length)];

    // Create a temporary notification
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(45deg, #00f3ff, #b967ff);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      z-index: 10000;
      font-weight: 600;
      box-shadow: 0 5px 20px rgba(0, 243, 255, 0.3);
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = randomMsg;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  const generateTaskCreationTips = (lifestyle) => {
    if (!lifestyle) return [];

    const tips = [];
    const profession = lifestyle.profession;

    // Profession-specific task creation tips
    switch (profession) {
      case "software developer":
        tips.push("💻 Break features into atomic commits");
        tips.push("🐛 Include acceptance criteria for bugs");
        tips.push("🔧 Estimate time for testing & deployment");
        tips.push("📚 Link to relevant documentation");
        break;
      case "designer":
        tips.push("🎨 Specify color palette requirements");
        tips.push("📱 Include responsive breakpoints");
        tips.push("🎯 Define success metrics for designs");
        tips.push("🔄 Consider design system compliance");
        break;
      case "manager":
        tips.push("👥 Assign clear ownership");
        tips.push("📊 Define measurable outcomes");
        tips.push("🔄 Include check-in milestones");
        tips.push("💬 Specify stakeholder communication plan");
        break;
      case "finance":
        tips.push("💰 Include financial impact metrics");
        tips.push("📈 Specify data sources for analysis");
        tips.push("🔢 Define calculation methodologies");
        tips.push("📅 Align with financial calendar");
        break;
      case "healthcare":
        tips.push("🏥 Consider patient privacy requirements");
        tips.push("⏱️ Estimate patient contact time");
        tips.push("📋 Include compliance checkpoints");
        tips.push("🔄 Plan for follow-up actions");
        break;
      default:
        tips.push("🎯 Define clear success criteria");
        tips.push("⏰ Estimate realistic time requirements");
        tips.push("📊 Consider impact on broader goals");
        tips.push("🔄 Plan for potential obstacles");
    }

    // Work style tips
    if (lifestyle.workStyle.isMorningPerson) {
      tips.push("🌅 Schedule completion for morning peak hours");
    } else if (lifestyle.workStyle.isNightOwl) {
      tips.push("🌙 Allow for evening deep work sessions");
    }

    // Health integration tip
    if (!lifestyle.healthHabits.hasRegularExercise) {
      tips.push("💪 Consider adding wellness-related subtasks");
    }

    return tips.slice(0, 4);
  };

  // Missing function implementations
  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      impact: task.impact,
      dueDate: task.due_date
        ? new Date(task.due_date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      complexity: task.complexity,
      estimatedHours: task.estimated_hours,
      tags: task.tags || [],
      status: task.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const response = await api.deleteTask(taskId);
        if (response.success) {
          setTasks(tasks.filter((task) => task.id !== taskId));
        } else {
          setError("Failed to delete task");
        }
      } catch (error) {
        console.error("Error deleting task:", error);
        setError("Failed to delete task");
      }
    }
  };

  const handleComplete = async (taskId) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      const updatedTask = {
        ...task,
        status: "completed",
        completed_at: new Date().toISOString(),
      };

      const response = await api.updateTask(taskId, updatedTask);
      if (response.success) {
        setTasks(tasks.map((t) => (t.id === taskId ? response.data : t)));
      } else {
        setError("Failed to complete task");
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
    setNewTag("");
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
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

  // Lifestyle-aware task scheduling suggestion
  const getOptimalSchedulingTip = () => {
    if (!lifestyleProfile) return "Schedule based on your natural rhythm";

    const hour = new Date().getHours();
    const isWorkHour = hour >= 9 && hour <= 17;
    const isPeakHour = lifestyleProfile.workStyle.isMorningPerson
      ? hour < 12
      : hour > 15;

    if (isWorkHour && isPeakHour) {
      return "⭐ Perfect time for high-focus work";
    } else if (isWorkHour) {
      return "📊 Good time for collaborative tasks";
    } else {
      return "🌙 Evening planning or creative work";
    }
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
      {/* Header with Lifestyle Context */}
      <div className="tasks-header-neural">
        <div>
          <h1 className="tasks-title">Neural Task Management</h1>
          <p className="tasks-subtitle">
            {lifestyleProfile
              ? `AI-powered for ${lifestyleProfile.profession}s • ${lifestyleProfile.workStyle.isMorningPerson ? "Morning" : "Evening"} optimized`
              : "AI-powered task optimization • Real-time productivity analysis"}
          </p>
        </div>
        <button
          className="add-task-btn-neon"
          onClick={() => setIsModalOpen(true)}
        >
          Create Neural Task
        </button>
      </div>

      {/* Lifestyle-aware Stats */}
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
          <div className="stat-title-neon">
            {lifestyleProfile?.profession || "WORK"} FOCUS
          </div>
          <div className="stat-value-neon">
            {tasks.filter((t) => t.category === "Work").length}
          </div>
          <div
            style={{
              marginTop: "10px",
              fontSize: "0.9rem",
              color: "#00f3ff",
            }}
          >
            {getOptimalSchedulingTip()}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="task-grid-neural">
        {/* Task List */}
        <div className="task-list-neural">
          <div className="task-list-header">
            <div>
              <h2 style={{ margin: 0, fontSize: "1.3rem" }}>
                Neural Tasks ({filteredTasks.length})
              </h2>
              {lifestyleProfile && (
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "0.9rem",
                    color: "#b967ff",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <span>💼</span>
                  {lifestyleProfile.profession} workflow detected
                </p>
              )}
            </div>
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

        {/* Enhanced AI Suggestions Sidebar with Lifestyle Integration */}
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
                {lifestyleProfile
                  ? `Adapted for ${lifestyleProfile.profession}`
                  : "Real-time suggestions"}
              </p>
            </div>
          </div>

          {/* Lifestyle Profile Card */}
          {lifestyleProfile && (
            <div className="lifestyle-profile-card">
              <div className="profile-header">
                <span style={{ fontSize: "1.3rem" }}>💼</span>
                <div>
                  <div className="profile-title">Your Work Style</div>
                  <div className="profile-subtitle">
                    {lifestyleProfile.profession}
                  </div>
                </div>
              </div>
              <div className="profile-details">
                <div className="profile-detail">
                  <span className="detail-label">Peak Hours</span>
                  <span className="detail-value">
                    {lifestyleProfile.workStyle.isMorningPerson
                      ? "Morning"
                      : "Evening"}
                  </span>
                </div>
                <div className="profile-detail">
                  <span className="detail-label">Focus Style</span>
                  <span className="detail-value">
                    {lifestyleProfile.workStyle.deadlineIntensity === "high"
                      ? "Deadline-driven"
                      : "Steady pace"}
                  </span>
                </div>
                {lifestyleProfile.healthHabits.hasRegularExercise && (
                  <div className="profile-detail">
                    <span className="detail-label">Wellness</span>
                    <span className="detail-value" style={{ color: "#00ff88" }}>
                      Active 🏋️
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lifestyle-aware Suggestions */}
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
                    <strong>Focus Priority</strong>
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

              {/* Lifestyle Tips */}
              <div className="ai-suggestion suggestion-lifestyle">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>🧬</span>
                  <strong>Adapted Tips</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {aiSuggestions.tips.map((tip, idx) => (
                    <div key={idx} className="lifestyle-tip">
                      {tip}
                    </div>
                  ))}
                </div>
              </div>

              {/* Task Creation Tips */}
              {lifestyleTips.length > 0 && (
                <div className="ai-suggestion suggestion-creation">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>💡</span>
                    <strong>Task Creation Tips</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {lifestyleTips.map((tip, idx) => (
                      <div key={idx} className="creation-tip">
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                {aiSuggestions.lifestyleInsights && (
                  <div
                    style={{
                      marginTop: "10px",
                      fontSize: "0.8rem",
                      color: "#b967ff",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "5px",
                      justifyContent: "center",
                    }}
                  >
                    {aiSuggestions.lifestyleInsights.map((insight, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: "rgba(185, 103, 255, 0.1)",
                          padding: "3px 8px",
                          borderRadius: "12px",
                          border: "1px solid rgba(185, 103, 255, 0.3)",
                        }}
                      >
                        {insight}
                      </span>
                    ))}
                  </div>
                )}
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
            <form onSubmit={handleSubmit} className="modal-form-neural">
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="What needs to be done?"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-input form-textarea"
                  placeholder="Add details, requirements, or notes..."
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <div className="range-container">
                    <input
                      type="range"
                      name="priority"
                      min="1"
                      max="5"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                    <span className="range-value">
                      {getPriorityLabel(formData.priority)}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Impact (1-10)</label>
                  <div className="range-container">
                    <input
                      type="range"
                      name="impact"
                      min="1"
                      max="10"
                      value={formData.impact}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                    <span className="range-value">{formData.impact}</span>
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Complexity (1-5)</label>
                  <div className="range-container">
                    <input
                      type="range"
                      name="complexity"
                      min="1"
                      max="5"
                      value={formData.complexity}
                      onChange={handleInputChange}
                      className="form-input"
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
                    value={formData.estimatedHours}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="1.0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tags</label>
                <div
                  style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
                >
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="form-input"
                    placeholder="Add a tag"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddTag())
                    }
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="action-btn edit-btn"
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="task-tag"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ff5555",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="modal-buttons-neural">
                <button
                  type="button"
                  className="cancel-btn-neon"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn-neon"
                  disabled={aiLoading}
                >
                  {aiLoading
                    ? "Analyzing..."
                    : editingTask
                      ? "Update Task"
                      : "Create Task"}
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
