// services/lifestyleIntegrator.js
import { detectLifePatterns } from "./lifePatterns";
import { detectLifestyleFromTasks } from "./lifestyleDetector";

export const integrateLifestyleProfile = async (tasks, calendarData) => {
  // Get patterns from both sources
  const calendarPatterns = await detectLifePatterns(calendarData);
  const taskLifestyle = detectLifestyleFromTasks(tasks);

  // Merge and enhance the profile
  const integratedProfile = {
    // Core identity
    profession: taskLifestyle.profession,
    personalityType: determinePersonalityType(taskLifestyle, calendarPatterns),

    // Time patterns (from calendar)
    circadianRhythm: analyzeCircadianRhythm(calendarPatterns),
    peakHours: detectPeakHours(calendarPatterns, taskLifestyle),
    energyCycles: detectEnergyCycles(calendarPatterns),

    // Work habits
    workStyle: {
      ...taskLifestyle.workStyle,
      meetingPreferences: calendarPatterns.meetingPatterns,
      focusStyle: analyzeFocusStyle(calendarPatterns, taskLifestyle),
    },

    // Health & wellness
    healthProfile: {
      ...taskLifestyle.healthHabits,
      exerciseWindows: findBestExerciseWindows(calendarPatterns, taskLifestyle),
      mealPatterns: detectMealPatterns(calendarPatterns),
      sleepQuality: analyzeSleepQuality(taskLifestyle, calendarPatterns),
    },

    // Life balance
    lifeBalance: {
      workLifeBalance: calculateWorkLifeBalance(
        taskLifestyle,
        calendarPatterns,
      ),
      socialIntegration: taskLifestyle.socialPatterns,
      learningRhythm: taskLifestyle.learningHabits,
      financialHealth: taskLifestyle.financialHabits,
    },

    // Adaptive recommendations
    optimalSchedule: generateOptimalSchedule(integratedProfile),
    wellnessTips: generateWellnessTips(integratedProfile),
    productivityHacks: generateProductivityHacks(integratedProfile),
  };

  return integratedProfile;
};

// Enhanced analysis functions
const determinePersonalityType = (taskLifestyle, calendarPatterns) => {
  const traits = [];

  // Early bird vs night owl
  if (taskLifestyle.workStyle.isMorningPerson) traits.push("EarlyBird");
  if (taskLifestyle.workStyle.isNightOwl) traits.push("NightOwl");

  // Social vs solitary
  if (taskLifestyle.socialPatterns.hasSocialLife) traits.push("Social");
  if (taskLifestyle.workStyle.deadlineIntensity === "high")
    traits.push("DeadlineDriven");

  // Health conscious
  if (taskLifestyle.healthHabits.hasRegularExercise)
    traits.push("HealthConscious");

  // Meeting style
  if (calendarPatterns.meetingPatterns.averageDuration > 1)
    traits.push("DeepCollaborator");
  if (Object.keys(calendarPatterns.meetingPatterns.frequentHours).length > 3)
    traits.push("MultiTasker");

  return traits.length > 0 ? traits.join("-") : "Balanced";
};

const analyzeCircadianRhythm = (calendarPatterns) => {
  const energyMap = calendarPatterns.energyPatterns;
  const hours = Object.keys(energyMap).map(Number);

  if (hours.length === 0) return "Standard (9-5)";

  const startHour = Math.min(...hours);
  const endHour = Math.max(...hours);

  if (startHour < 7) return "Early Riser (6 AM start)";
  if (startHour > 10) return "Late Starter (10 AM+)";
  if (endHour > 20) return "Night Worker (late finish)";

  return "Balanced Day";
};

const detectPeakHours = (calendarPatterns, taskLifestyle) => {
  const energyHours = {};
  Object.entries(calendarPatterns.energyPatterns).forEach(([hour, energy]) => {
    if (energy.high > energy.medium && energy.high > energy.low) {
      energyHours[hour] = "peak";
    } else if (energy.medium > energy.low) {
      energyHours[hour] = "moderate";
    } else {
      energyHours[hour] = "low";
    }
  });

  // Override with task patterns if no calendar data
  if (Object.keys(energyHours).length === 0) {
    const startHour = taskLifestyle.workStyle.startHour;
    return {
      [startHour]: "peak",
      [startHour + 2]: "moderate",
      [startHour + 4]: "low",
      [startHour + 6]: "recovery",
    };
  }

  return energyHours;
};

const findBestExerciseWindows = (calendarPatterns, taskLifestyle) => {
  const windows = [];
  const workHours = calendarPatterns.workSchedule;

  // Morning exercise (before work)
  if (workHours.start > 7) windows.push(`6:30-7:30 AM (Pre-work energy boost)`);

  // Lunch break exercise
  windows.push(`12:00-1:00 PM (Lunch recharge)`);

  // Evening exercise (after work)
  if (workHours.end < 19) windows.push(`6:00-7:00 PM (Evening stress relief)`);

  // Based on existing habits
  if (taskLifestyle.healthHabits.lastHealthTask) {
    const lastTime = new Date(
      taskLifestyle.healthHabits.lastHealthTask,
    ).getHours();
    windows.push(`${lastTime}:00-${lastTime + 1}:00 (Your usual time)`);
  }

  return windows;
};

const detectMealPatterns = (calendarPatterns) => {
  const patterns = {
    breakfast: "8:00-9:00 AM",
    lunch: "12:00-1:00 PM",
    dinner: "7:00-8:00 PM",
  };

  // Look for meal-related events
  const mealEvents = Object.entries(calendarPatterns.energyPatterns).filter(
    ([hour, energy]) => energy.low > 0 && parseInt(hour) % 4 === 0,
  );

  if (mealEvents.length > 0) {
    patterns.naturalBreaks = mealEvents
      .map(([hour]) => `${hour}:00`)
      .join(", ");
  }

  return patterns;
};

const analyzeFocusStyle = (calendarPatterns, taskLifestyle) => {
  const meetingCount = Object.keys(
    calendarPatterns.meetingPatterns.frequentHours,
  ).length;
  const avgMeetingDuration = calendarPatterns.meetingPatterns.averageDuration;

  if (meetingCount > 5 && avgMeetingDuration < 0.5) {
    return "Context-Switching (frequent short meetings)";
  } else if (meetingCount < 2 && avgMeetingDuration > 1) {
    return "Deep Work (long focused sessions)";
  } else if (taskLifestyle.workStyle.deadlineIntensity === "high") {
    return "Deadline-Driven (bursts of focus)";
  }

  return "Balanced Focus";
};

const calculateWorkLifeBalance = (taskLifestyle, calendarPatterns) => {
  let score = 50; // neutral

  // Positive factors
  if (taskLifestyle.healthHabits.hasRegularExercise) score += 15;
  if (taskLifestyle.socialPatterns.hasSocialLife) score += 15;
  if (!taskLifestyle.workStyle.worksWeekends) score += 10;

  // Negative factors
  if (taskLifestyle.workStyle.deadlineIntensity === "high") score -= 10;
  if (
    Object.keys(calendarPatterns.meetingPatterns.preferredDays).includes(0) ||
    Object.keys(calendarPatterns.meetingPatterns.preferredDays).includes(6)
  ) {
    score -= 10;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    level: score > 70 ? "Excellent" : score > 50 ? "Good" : "Needs Attention",
    areas: generateBalanceAreas(taskLifestyle, calendarPatterns),
  };
};

const generateBalanceAreas = (taskLifestyle, calendarPatterns) => {
  const areas = [];

  if (!taskLifestyle.healthHabits.hasRegularExercise) {
    areas.push("Add regular exercise");
  }

  if (!taskLifestyle.socialPatterns.hasSocialLife) {
    areas.push("Schedule social activities");
  }

  if (taskLifestyle.workStyle.worksWeekends) {
    areas.push("Protect weekend time");
  }

  return areas;
};

const generateOptimalSchedule = (profile) => {
  const schedule = [];
  const profession = profile.profession;
  const peakHours = profile.peakHours;

  // Morning routine based on personality
  if (profile.personalityType.includes("EarlyBird")) {
    schedule.push({
      time: "6:00-7:00",
      activity: "Morning Ritual",
      recommendation: "Meditation + Planning",
      energy: "building",
    });
  }

  // Work blocks based on peak hours
  Object.entries(peakHours).forEach(([hour, energy]) => {
    if (energy === "peak") {
      schedule.push({
        time: `${hour}:00-${parseInt(hour) + 2}:00`,
        activity: "Deep Work",
        recommendation: "Most important task of the day",
        energy: "peak",
      });
    }
  });

  // Profession-specific blocks
  if (profession === "software developer") {
    schedule.push({
      time: "14:00-16:00",
      activity: "Coding Session",
      recommendation: "Complex algorithms & debugging",
      energy: "creative",
    });
  } else if (profession === "designer") {
    schedule.push({
      time: "15:00-17:00",
      activity: "Creative Work",
      recommendation: "Visual design & prototyping",
      energy: "creative",
    });
  }

  // Exercise window
  if (profile.healthProfile.exerciseWindows.length > 0) {
    schedule.push({
      time: profile.healthProfile.exerciseWindows[0].split(" ")[0],
      activity: "Physical Activity",
      recommendation: profile.healthProfile.hasRegularExercise
        ? "Maintain your routine"
        : "Start with 20-min walk",
      energy: "recharge",
    });
  }

  return schedule;
};

const generateWellnessTips = (profile) => {
  const tips = [];
  const profession = profile.profession;

  // Profession-specific wellness
  if (profession === "software developer") {
    tips.push(
      "20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds",
    );
    tips.push("Standing desk intervals: 45 min sitting, 15 min standing");
    tips.push("Weekly digital detox: 2 hours without screens before bed");
  } else if (profession === "manager") {
    tips.push("Walking meetings: Convert 30% of meetings to walking meetings");
    tips.push("Decision-making window: Make important decisions before 11 AM");
    tips.push("Email batching: Check email only 3x daily (9 AM, 1 PM, 4 PM)");
  }

  // Health-specific tips
  if (!profile.healthProfile.hasRegularExercise) {
    tips.push("Micro-workouts: 5-min exercises every 90 minutes");
    tips.push("Desk stretches: Neck rolls and shoulder stretches hourly");
  }

  // Sleep tips
  if (profile.personalityType.includes("NightOwl")) {
    tips.push("Blue light blocking glasses after 8 PM");
    tips.push("Progressive relaxation: 10-min routine before bed");
  }

  return tips.slice(0, 3);
};

const generateProductivityHacks = (profile) => {
  const hacks = [];
  const focusStyle = profile.workStyle.focusStyle;

  if (focusStyle.includes("Context-Switching")) {
    hacks.push("Time blocking: Schedule 90-min uninterrupted blocks");
    hacks.push("Meeting consolidation: Group meetings on specific days");
    hacks.push("Notification management: Turn off non-essential notifications");
  } else if (focusStyle.includes("Deep Work")) {
    hacks.push("Theme days: Dedicate days to specific types of work");
    hacks.push("Energy matching: Schedule complex tasks during peak hours");
    hacks.push("Recovery breaks: 10-min break after 90-min focus sessions");
  }

  return hacks;
};

// Add missing functions
const detectEnergyCycles = (calendarPatterns) => {
  const cycles = [];
  const energyMap = calendarPatterns.energyPatterns;

  // Detect morning, afternoon, evening energy patterns
  let morningEnergy = 0;
  let afternoonEnergy = 0;
  let eveningEnergy = 0;

  Object.entries(energyMap).forEach(([hourStr, energy]) => {
    const hour = parseInt(hourStr);
    const total = energy.high + energy.medium + energy.low;

    if (hour >= 6 && hour < 12) morningEnergy += total;
    else if (hour >= 12 && hour < 18) afternoonEnergy += total;
    else if (hour >= 18 && hour < 22) eveningEnergy += total;
  });

  if (morningEnergy > afternoonEnergy && morningEnergy > eveningEnergy) {
    cycles.push("Morning Peak");
  }
  if (afternoonEnergy > morningEnergy && afternoonEnergy > eveningEnergy) {
    cycles.push("Afternoon Peak");
  }
  if (eveningEnergy > morningEnergy && eveningEnergy > afternoonEnergy) {
    cycles.push("Evening Peak");
  }

  return cycles.length > 0 ? cycles : ["Steady Throughout Day"];
};

const analyzeSleepQuality = (taskLifestyle, calendarPatterns) => {
  let quality = "Good";

  if (
    taskLifestyle.sleepPatterns.nightOwl &&
    taskLifestyle.workStyle.isMorningPerson
  ) {
    quality = "Needs Adjustment (night owl with morning schedule)";
  } else if (
    taskLifestyle.sleepPatterns.earlyRiser &&
    taskLifestyle.workStyle.isNightOwl
  ) {
    quality = "Misaligned (early riser with evening schedule)";
  }

  return {
    quality,
    recommendation: generateSleepRecommendation(taskLifestyle),
  };
};

const generateSleepRecommendation = (taskLifestyle) => {
  if (
    taskLifestyle.sleepPatterns.nightOwl &&
    taskLifestyle.workStyle.isMorningPerson
  ) {
    return "Gradually shift bedtime 15 min earlier each night";
  }
  return "Maintain consistent sleep schedule ±30 min";
};
