/**
 * Detects lifestyle patterns from task data
 */
export const detectLifestyleFromTasks = (tasks) => {
  if (!tasks || tasks.length === 0) {
    return null;
  }

  // Analyze task patterns to determine profession
  const professions = {
    "software developer": [
      "code",
      "debug",
      "feature",
      "api",
      "backend",
      "frontend",
      "git",
      "pull request",
    ],
    designer: [
      "design",
      "ui",
      "ux",
      "wireframe",
      "prototype",
      "figma",
      "sketch",
      "mockup",
    ],
    manager: [
      "meeting",
      "report",
      "review",
      "team",
      "budget",
      "strategy",
      "planning",
      "presentation",
    ],
    finance: [
      "budget",
      "finance",
      "report",
      "analysis",
      "excel",
      "spreadsheet",
      "forecast",
      "revenue",
    ],
    healthcare: [
      "patient",
      "clinical",
      "medical",
      "health",
      "care",
      "treatment",
      "appointment",
      "record",
    ],
    student: [
      "study",
      "homework",
      "assignment",
      "exam",
      "research",
      "project",
      "paper",
      "thesis",
    ],
    entrepreneur: [
      "business",
      "startup",
      "funding",
      "pitch",
      "market",
      "customer",
      "product",
      "growth",
    ],
  };

  // Analyze task titles and descriptions
  const taskText = tasks
    .map(
      (t) =>
        `${t.title || ""} ${t.description || ""} ${t.category || ""} ${(t.tags || []).join(" ")}`,
    )
    .join(" ")
    .toLowerCase();

  let detectedProfession = "professional";
  let highestMatch = 0;

  Object.entries(professions).forEach(([profession, keywords]) => {
    const matches = keywords.filter((keyword) =>
      taskText.includes(keyword.toLowerCase()),
    ).length;

    if (matches > highestMatch) {
      highestMatch = matches;
      detectedProfession = profession;
    }
  });

  // Analyze work style patterns
  const morningTasks = tasks.filter((t) => {
    if (!t.created_at) return false;
    const hour = new Date(t.created_at).getHours();
    return hour >= 5 && hour < 12;
  }).length;

  const eveningTasks = tasks.filter((t) => {
    if (!t.created_at) return false;
    const hour = new Date(t.created_at).getHours();
    return hour >= 18 && hour < 24;
  }).length;

  const totalTasksWithTime = tasks.filter((t) => t.created_at).length;
  const morningRatio =
    totalTasksWithTime > 0 ? morningTasks / totalTasksWithTime : 0.5;

  // Analyze task completion patterns
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const onTimeCompletion = completedTasks.filter((t) => {
    if (!t.completed_at || !t.due_date) return false;
    const completed = new Date(t.completed_at);
    const due = new Date(t.due_date);
    return completed <= due;
  }).length;

  const completionRatio =
    completedTasks.length > 0 ? onTimeCompletion / completedTasks.length : 0.5;

  // Analyze health and wellness tasks
  const healthTasks = tasks.filter(
    (t) =>
      t.category === "Health" ||
      (t.tags || []).some((tag) =>
        [
          "exercise",
          "fitness",
          "wellness",
          "meditation",
          "yoga",
          "health",
        ].includes(tag.toLowerCase()),
      ),
  ).length;

  // Build lifestyle profile
  return {
    profession: detectedProfession,
    workStyle: {
      isMorningPerson: morningRatio > 0.6,
      isNightOwl: eveningTasks > morningTasks,
      prefersDeadlines: completionRatio > 0.7,
      deadlineIntensity:
        completionRatio > 0.8
          ? "high"
          : completionRatio > 0.6
            ? "medium"
            : "low",
      productivityPattern:
        morningRatio > 0.6
          ? "morning"
          : eveningTasks > morningTasks
            ? "evening"
            : "balanced",
    },
    healthHabits: {
      hasRegularExercise: healthTasks >= 2,
      wellnessIntegration: healthTasks > 0,
      healthConsciousness:
        healthTasks / tasks.length > 0.1
          ? "high"
          : healthTasks > 0
            ? "medium"
            : "low",
    },
    taskPreferences: {
      prefersHighImpact:
        tasks.filter((t) => t.impact >= 7).length >
        tasks.filter((t) => t.impact <= 3).length,
      handlesComplexity: tasks.filter((t) => t.complexity >= 4).length > 0,
      varietySeeker: new Set(tasks.map((t) => t.category)).size > 3,
      planner:
        tasks.filter((t) => t.due_date && new Date(t.due_date) > new Date())
          .length > 0,
    },
    confidence: {
      professionConfidence:
        highestMatch / professions[detectedProfession].length,
      workStyleConfidence: Math.max(morningRatio, 1 - morningRatio),
      overall: Math.min(
        0.9,
        (highestMatch / 5) * 0.4 +
          completionRatio * 0.3 +
          (healthTasks > 0 ? 0.2 : 0),
      ),
    },
    lastUpdated: new Date().toISOString(),
    analyzedTasksCount: tasks.length,
  };
};

/**
 * Generates lifestyle-based recommendations
 */
export const getLifestyleRecommendations = (lifestyle, tasks) => {
  if (!lifestyle) return [];

  const recommendations = [];
  const now = new Date();
  const currentHour = now.getHours();

  // Time-based recommendations
  if (currentHour < 12 && lifestyle.workStyle.isMorningPerson) {
    recommendations.push({
      type: "time_optimization",
      message: "🌅 Peak morning hours - tackle complex tasks now",
      priority: "high",
      category: "productivity",
    });
  }

  // Profession-based recommendations
  switch (lifestyle.profession) {
    case "software developer":
      recommendations.push({
        type: "profession_optimization",
        message:
          "💻 Consider breaking large features into smaller PRs for better review cycles",
        priority: "medium",
        category: "workflow",
      });
      break;
    case "designer":
      recommendations.push({
        type: "profession_optimization",
        message:
          "🎨 Schedule creative work during your most productive design hours",
        priority: "medium",
        category: "creativity",
      });
      break;
    case "manager":
      recommendations.push({
        type: "profession_optimization",
        message:
          "👥 Front-load meetings to leave focused work time for your team",
        priority: "medium",
        category: "leadership",
      });
      break;
  }

  // Health recommendations
  if (!lifestyle.healthHabits.hasRegularExercise) {
    recommendations.push({
      type: "health_optimization",
      message:
        "💪 Consider adding 15-minute wellness breaks between focused work sessions",
      priority: "medium",
      category: "wellness",
    });
  }

  // Task-specific recommendations
  const overdueTasks = tasks.filter(
    (t) => new Date(t.due_date) < now && t.status !== "completed",
  );

  if (overdueTasks.length > 0) {
    recommendations.push({
      type: "task_management",
      message: `⏰ You have ${overdueTasks.length} overdue tasks - consider re-prioritizing`,
      priority: "high",
      category: "urgency",
    });
  }

  return recommendations.slice(0, 5); // Return top 5 recommendations
};
