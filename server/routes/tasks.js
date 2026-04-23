const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask, getUsers } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');

// All routes require authentication
router.use(protect);

// All roles can view tasks and the user list
router.get('/users', getUsers);
router.get('/', getTasks);

// Lead, Manager, Super Manager can create tasks
router.post('/', checkRole('lead', 'manager', 'super_manager'), createTask);

// All can call PUT — role enforcement (dev = status only, others = full edit) is in the controller
router.put('/:id', updateTask);

// Manager and Super Manager can delete tasks
router.delete('/:id', checkRole('manager', 'super_manager'), deleteTask);

module.exports = router;
