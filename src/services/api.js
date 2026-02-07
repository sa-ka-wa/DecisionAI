// Enhanced dummy data matching screenshots
const initialTasks = [
  {
    id: 1,
    title: "Redesign landing page",
    description: "Complete overhaul of the main landing page with new branding",
    category: "Design",
    priority: 2,
    impact: 9,
    dueDate: "2024-02-15",
    status: "in-progress",
    progress: 60,
  },
  {
    id: 2,
    title: "Optimize database queries",
    description: "Reduce query response time by 40%",
    category: "Engineering",
    priority: 1,
    impact: 8,
    dueDate: "2024-02-10",
    status: "pending",
    progress: 0,
  },
  {
    id: 3,
    title: "Launch email campaign",
    description: "Q1 product launch email sequence",
    category: "Marketing",
    priority: 3,
    impact: 7,
    dueDate: "2024-02-20",
    status: "pending",
    progress: 0,
  },
  {
    id: 4,
    title: "Set up CI/CD pipeline",
    description: "Automate testing and deployment workflow",
    category: "Engineering",
    priority: 2,
    impact: 8,
    dueDate: "2024-02-12",
    status: "in-progress",
    progress: 45,
  },
  {
    id: 5,
    title: "Budget review Q1",
    description: "Review and approve Q1 department budgets",
    category: "Finance",
    priority: 4,
    impact: 5,
    dueDate: "2024-02-28",
    status: "pending",
    progress: 0,
  },
  {
    id: 6,
    title: "User research interviews",
    description: "Conduct 10 user interviews for feature validation",
    category: "Research",
    priority: 3,
    impact: 6,
    dueDate: "2024-02-18",
    status: "completed",
    progress: 100,
  },
  {
    id: 7,
    title: "Inventory system upgrade",
    description: "Migrate to new inventory management platform",
    category: "Operations",
    priority: 1,
    impact: 10,
    dueDate: "2024-02-08",
    status: "pending",
    progress: 0,
  },
  {
    id: 8,
    title: "Design system documentation",
    description: "Document all design tokens and component specs",
    category: "Design",
    priority: 4,
    impact: 4,
    dueDate: "2024-03-01",
    status: "in-progress",
    progress: 30,
  },
];

// Simulate API calls
let tasks = [...initialTasks];

export const getTasks = () => {
  return [...tasks];
};

export const getTaskById = (id) => {
  return tasks.find((task) => task.id === id);
};

export const addTask = (task) => {
  const newTask = {
    ...task,
    id: Date.now(),
    status: task.status || "pending",
    progress: task.progress || 0,
  };
  tasks = [...tasks, newTask];
  return [...tasks];
};

export const updateTask = (updatedTask) => {
  tasks = tasks.map((task) =>
    task.id === updatedTask.id ? { ...task, ...updatedTask } : task,
  );
  return [...tasks];
};

export const deleteTask = (id) => {
  tasks = tasks.filter((task) => task.id !== id);
  return [...tasks];
};

// Get stats for dashboard
export const getDashboardStats = () => {
  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const criticalPriority = tasks.filter((t) => t.priority <= 2).length;
  const avgImpact = tasks.reduce((sum, t) => sum + t.impact, 0) / tasks.length;
  const completionRate = Math.round((completed / totalTasks) * 100);
  const categories = [...new Set(tasks.map((t) => t.category))];

  return {
    totalTasks,
    completed,
    criticalPriority,
    avgImpact: avgImpact.toFixed(1),
    completionRate,
    categories: categories.length,
  };
};

// Get tasks by category
export const getTasksByCategory = () => {
  const categories = {};
  tasks.forEach((task) => {
    if (!categories[task.category]) {
      categories[task.category] = [];
    }
    categories[task.category].push(task);
  });
  return categories;
};

// Get priority ranking
export const getPriorityRanking = () => {
  return [...tasks].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return b.impact - a.impact;
  });
};

// Simulate AI recommendation API
export const getAIRecommendations = () => {
  const highImpactTasks = tasks
    .filter((t) => t.impact >= 8 && t.status !== "completed")
    .slice(0, 3);

  const quickWins = tasks
    .filter((t) => t.progress > 70 && t.status !== "completed")
    .slice(0, 2);

  return {
    focusArea: highImpactTasks.map((t) => t.title),
    quickWins: quickWins.map((t) => t.title),
    riskAlert:
      tasks.filter((t) => t.priority === 1 && t.status !== "completed").length >
      2,
    suggestion:
      "Consider delegating low-impact tasks to focus on strategic items",
    efficiencyScore: Math.round(
      (tasks.filter((t) => t.status === "completed").length / tasks.length) *
        100,
    ),
  };
};
