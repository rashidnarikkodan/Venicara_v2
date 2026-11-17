const User = require('../models/user.model');

const isAjax = (req) =>
  Boolean(req.xhr || (req.headers.accept || '').includes('application/json'));

const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    if (isAjax(req)) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to continue',
        data: { redirect: `/auth/login?next=${encodeURIComponent(req.originalUrl)}` },
      });
    }
    req.flash('error', 'Please log in to continue');
    return res.redirect(`/auth/login?next=${encodeURIComponent(req.originalUrl)}`);
  }
  next();
};

const isUserBlocked = async (req, res, next) => {
  try {
    if (!req.session?.user?.id) {
      return next();
    }
    const user = await User.findById(req.session.user.id).lean();
    if (!user || user.isBlocked) {
      req.logout?.((err) => {
        if (err) console.error('Logout error:', err);
      });
      req.session?.destroy?.();
      res.clearCookie('connect.sid');
      if (isAjax(req)) {
        return res.status(403).json({ success: false, message: 'Your account has been blocked' });
      }
      req.flash('error', 'Your account has been blocked');
      return res.redirect('/auth/login');
    }
    next();
  } catch (err) {
    next(err);
  }
};

const loggedIn = (req, res, next) => {
  if (req.session?.user) {
    return res.redirect('/home');
  }
  next();
};

module.exports = {
  requireLogin,
  loggedIn,
  isUserBlocked,
};
