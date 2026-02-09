// services/adaptiveScheduler.js
export const generateAdaptiveSchedule = (
  tasks,
  calendarEvents,
  lifePatterns,
) => {
  const schedule = [];
  const availableSlots = findAvailableSlots(calendarEvents);

  // Sort tasks by priority and energy requirement
  const sortedTasks = tasks.sort((a, b) => {
    const priorityScore =
      b.priority * 2 + b.impact * 1.5 - a.priority * 2 - a.impact * 1.5;
    return priorityScore;
  });

  // Match tasks to optimal time slots
  sortedTasks.forEach((task) => {
    const optimalSlot = findOptimalSlot(task, availableSlots, lifePatterns);

    if (optimalSlot) {
      schedule.push({
        task: task.title,
        slot: optimalSlot,
        energyMatch: calculateEnergyMatch(task, optimalSlot, lifePatterns),
        confidence: calculateSchedulingConfidence(task, optimalSlot),
      });

      // Remove used slot
      availableSlots.splice(availableSlots.indexOf(optimalSlot), 1);
    }
  });

  return schedule;
};

const findOptimalSlot = (task, slots, patterns) => {
  let bestSlot = null;
  let bestScore = -1;

  slots.forEach((slot) => {
    const score = calculateSlotScore(task, slot, patterns);

    if (score > bestScore) {
      bestScore = score;
      bestSlot = slot;
    }
  });

  return bestSlot;
};

const calculateSlotScore = (task, slot, patterns) => {
  let score = 0;

  // Time of day preferences
  const hour = slot.start.getHours();

  // High-impact, complex tasks in peak hours
  if (task.impact >= 8 && task.complexity >= 4) {
    if (hour >= patterns.peakHours[0] && hour <= patterns.peakHours[1]) {
      score += 30;
    }
  }

  // Creative tasks in creative hours
  if (task.category === "Creative" || task.tags?.includes("creative")) {
    if (
      hour >= patterns.creativeHours[0] &&
      hour <= patterns.creativeHours[1]
    ) {
      score += 25;
    }
  }

  // Administrative tasks in low-energy hours
  if (task.category === "Admin" || task.complexity <= 2) {
    if (
      hour >= patterns.lowEnergyHours[0] &&
      hour <= patterns.lowEnergyHours[1]
    ) {
      score += 20;
    }
  }

  // Avoid scheduling after long meetings
  if (isAfterLongMeeting(slot, patterns)) {
    score -= 15;
  }

  // Prefer slots that match task duration
  const slotDuration = (slot.end - slot.start) / (1000 * 60 * 60);
  const taskDuration = task.estimated_hours;

  if (Math.abs(slotDuration - taskDuration) <= 1) {
    score += 20;
  }

  return score;
};
