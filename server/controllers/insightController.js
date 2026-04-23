const Task = require('../models/Task');

// GET /api/insights
const getInsights = async (req, res) => {
  try {
    const now = new Date();
    const allTasks = await Task.find().populate('assignedTo', 'name');

    const total = allTasks.length;
    const completed = allTasks.filter(t => t.status === 'done').length;
    const pending = allTasks.filter(t => t.status === 'pending').length;
    const inProgress = allTasks.filter(t => t.status === 'in-progress').length;
    const overdue = allTasks.filter(
      t => t.deadline && new Date(t.deadline) < now && t.status !== 'done'
    ).length;
    const highPriorityPending = allTasks.filter(
      t => t.priority === 'high' && t.status !== 'done'
    ).length;

    // Workload per user
    const workloadMap = {};
    allTasks.forEach(task => {
      if (task.assignedTo) {
        const name = task.assignedTo.name;
        workloadMap[name] = (workloadMap[name] || 0) + 1;
      }
    });
    const workloadEntries = Object.entries(workloadMap);
    const maxLoad = workloadEntries.length > 0 ? Math.max(...workloadEntries.map(e => e[1])) : 0;
    const minLoad = workloadEntries.length > 0 ? Math.min(...workloadEntries.map(e => e[1])) : 0;
    const imbalanced = maxLoad - minLoad >= 3;

    // Build insights
    const insights = [];

    if (total === 0) {
      insights.push({
        type: 'info',
        icon: '📋',
        title: 'No Tasks Yet',
        message: 'Start by creating your first task to track progress.',
      });
    } else {
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      insights.push({
        type: completionRate >= 60 ? 'success' : 'warning',
        icon: completionRate >= 60 ? '✅' : '⚠️',
        title: 'Task Completion Rate',
        message: `${completionRate}% of tasks are completed (${completed}/${total}). ${
          completionRate < 60 ? 'Consider accelerating efforts to hit targets.' : 'Great progress!'
        }`,
      });

      if (pending > completed) {
        insights.push({
          type: 'danger',
          icon: '🔴',
          title: 'Project is Falling Behind',
          message: `You have ${pending} pending tasks vs ${completed} completed. The project is at risk of delay.`,
        });
      }

      if (overdue > 2) {
        insights.push({
          type: 'danger',
          icon: '⏰',
          title: 'Multiple Deadlines Missed',
          message: `${overdue} tasks have passed their deadline and are not yet completed. Immediate action needed.`,
        });
      } else if (overdue === 1 || overdue === 2) {
        insights.push({
          type: 'warning',
          icon: '⏳',
          title: 'Deadline Alert',
          message: `${overdue} task${overdue > 1 ? 's are' : ' is'} overdue. Review and reprioritize quickly.`,
        });
      }

      if (highPriorityPending > 0) {
        insights.push({
          type: 'warning',
          icon: '🔥',
          title: 'High-Priority Tasks Pending',
          message: `${highPriorityPending} high-priority task${highPriorityPending > 1 ? 's need' : ' needs'} immediate attention.`,
        });
      }

      if (imbalanced) {
        const heaviest = workloadEntries.sort((a, b) => b[1] - a[1])[0];
        insights.push({
          type: 'warning',
          icon: '⚖️',
          title: 'Workload Imbalance Detected',
          message: `${heaviest[0]} has ${heaviest[0] ? heaviest[1] : ''} tasks assigned. Consider redistributing workload across the team.`,
        });
      }

      if (inProgress > 0 && completed === 0) {
        insights.push({
          type: 'info',
          icon: '🔄',
          title: 'Tasks In Progress',
          message: `${inProgress} tasks are in progress. Make sure team members move them to 'Done' once completed.`,
        });
      }

      if (completionRate === 100 && total > 0) {
        insights.push({
          type: 'success',
          icon: '🎉',
          title: 'All Tasks Completed!',
          message: 'Outstanding! Every task has been completed. The team is performing excellently.',
        });
      }
    }

    res.json({
      summary: { total, completed, pending, inProgress, overdue, highPriorityPending },
      workload: workloadMap,
      insights,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getInsights };
