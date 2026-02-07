import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../Components.Styles/DashboardChart.css";

const DashboardChart = ({ tasks }) => {
  const impactData = tasks
    .filter((t) => t.status !== "completed")
    .map((task) => ({
      name:
        task.title.length > 12
          ? task.title.substring(0, 10) + "..."
          : task.title,
      impact: task.impact,
      priority: task.priority,
      category: task.category,
    }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 8);

  const categoryCount = {};
  tasks.forEach((task) => {
    categoryCount[task.category] = (categoryCount[task.category] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="tooltip-card">
          <p className="tooltip-title">{label}</p>
          <div>
            <p className="tooltip-impact">
              Impact:{" "}
              <span className="tooltip-label">{payload[0].value}/10</span>
            </p>
            <p className="tooltip-priority">
              Priority:{" "}
              <span className="tooltip-label">{6 - payload[1].value}</span>
            </p>
            <p className="tooltip-category">{payload[0].payload.category}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CategoryTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="tooltip-card">
          <p className="tooltip-title">{payload[0].name}</p>
          <p className="tooltip-impact">
            Tasks: <span className="tooltip-label">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-chart">
      {/* Task Impact Analysis */}
      <div className="chart-container">
        <h2>Task Impact Analysis</h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={impactData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="impact"
                name="Impact Score"
                fill="url(#impactGradient)"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="priority"
                name="Priority (1-5)"
                fill="url(#priorityGradient)"
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient
                  id="priorityGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="chart-container">
        <h2>Tasks by Category</h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CategoryTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="category-grid">
          {categoryData.map((category) => (
            <div key={category.name} className="category-item">
              <div className="category-count">{category.value}</div>
              <div className="category-name">{category.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardChart;
