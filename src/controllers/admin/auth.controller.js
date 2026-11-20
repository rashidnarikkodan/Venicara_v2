const bcrypt = require('bcrypt');
const Admin = require('../../models/admin.model');
const { render } = require('../../helpers/response.helper');

const handleEntry = (req, res) => {
  return res.redirect('/admin/login');
};

// SHOW LOGIN
const showLogin = (req, res) => {
  return render(res, 'adminPages/login');
};

// HANDLE LOGIN
const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.flash('error', 'Email and password are required');
    return res.redirect('/admin/login');
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    req.flash('error', 'Invalid credentials');
    return res.redirect('/admin/login');
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    req.flash('error', 'Invalid credentials');
    return res.redirect('/admin/login');
  }

  if (!admin.isActive) {
    req.flash('error', 'Account is not active.');
    return res.redirect('/admin/login');
  }

  req.session.admin = {
    id: admin._id,
    email: admin.email,
  };

  req.flash('success', 'Logged in successfully');
  return res.redirect('/admin');
};

// HANDLE LOGOUT
const handleLogout = (req, res) => {
  req.session.admin = null;
  req.flash('success', 'Logged out successfully');
  return res.redirect('/admin/login');
};

module.exports = {
  handleEntry,
  showLogin,
  handleLogin,
  handleLogout,
};
