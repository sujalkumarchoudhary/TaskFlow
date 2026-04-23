const Task = require('../models/Task');
const User = require('../models/User');

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, deadline, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      deadline: deadline ? new Date(deadline) : null,
      assignedTo: assignedTo || null,
      createdBy: req.user.id,
    });

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email role' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, deadline, assignedTo } = req.body;
    const { role, id: userId } = req.user;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Developers: status-only on their own assigned tasks
    if (role === 'developer') {
      const assignedId = task.assignedTo ? task.assignedTo.toString() : null;
      if (assignedId !== userId) {
        return res.status(403).json({
          message: 'Access denied. Developers can only update status of tasks assigned to them.',
        });
      }
      if (status !== undefined) task.status = status;
    } else {
      // Lead, Manager, Super Manager — full edit on any task
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (deadline !== undefined) task.deadline = deadline ? new Date(deadline) : null;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    }

    await task.save();

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email role' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/tasks/users  — list all users for assignment dropdown
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getUsers };
