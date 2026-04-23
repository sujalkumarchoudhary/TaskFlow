const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Role hierarchy (index = power level)
const ROLE_HIERARCHY = ['developer', 'lead', 'manager', 'super_manager'];
const roleLevel = (role) => ROLE_HIERARCHY.indexOf(role);

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/login  — public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Please provide email and password' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/auth/me  — protected
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/auth/create-user  — manager & super_manager
// Rules:
//   super_manager → can create account with ANY role
//   manager       → can only create 'developer' accounts (role is forced)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const callerRole = req.user.role;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please provide name, email, and password' });

    // Determine the role to assign
    let assignedRole = 'developer'; // default
    if (callerRole === 'super_manager') {
      // super_manager can assign any role
      const allowed = ['developer', 'lead', 'manager', 'super_manager'];
      assignedRole = allowed.includes(role) ? role : 'developer';
    }
    // manager always creates developers — role from body is ignored

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword, role: assignedRole });

    res.status(201).json({
      message: `User "${name}" created as ${assignedRole}`,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/auth/promote/:id
// Rules:
//   super_manager → can promote to any role (developer, lead, manager, super_manager)
//   manager       → can promote to roles BELOW manager (developer, lead only)
const promoteUser = async (req, res) => {
  try {
    const { role: newRole } = req.body;
    const callerRole = req.user.role;

    if (!ROLE_HIERARCHY.includes(newRole))
      return res.status(400).json({ message: `Invalid role. Valid roles: ${ROLE_HIERARCHY.join(', ')}` });

    // manager cannot assign manager or super_manager
    if (callerRole === 'manager' && roleLevel(newRole) >= roleLevel('manager'))
      return res.status(403).json({ message: 'Managers can only promote up to Lead level. Contact a Super Manager to promote to Manager.' });

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    // Prevent self-demotion
    if (req.user.id === req.params.id && newRole !== callerRole)
      return res.status(400).json({ message: 'You cannot change your own role.' });

    target.role = newRole;
    await target.save();

    res.json({
      message: `${target.name}'s role updated to ${newRole}`,
      user: { id: target._id, name: target.name, email: target.email, role: target.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/auth/users/:id  — super_manager only
const deleteUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id)
      return res.status(400).json({ message: 'You cannot delete your own account.' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.deleteOne();
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { login, getMe, createUser, promoteUser, deleteUser };
