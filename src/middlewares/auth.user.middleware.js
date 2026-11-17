const User = require('../models/user.model');

const isAjax = (req) =>
  Boolean(req.xhr || (req.headers.accept || '').includes('application/json'));

/**
 * Resolves the genuine page URL where the user should return after logging in.
 * Never redirects to an action endpoint (e.g. POST/DELETE /wishlist/items/:id, /cart/items/:id, or /api/*).
 */
const resolveReturnUrl = (req) => {
  const isGet = req.method === 'GET';
  const url = req.originalUrl || '';
  const isActionOrApi =
    url.includes('/api/') ||
    url.startsWith('/wishlist/items') ||
    url.startsWith('/cart/items') ||
    url.startsWith('/checkout/placeOrder') ||
    url.startsWith('/auth');

  // If this is a direct browser GET request to a real viewable page (e.g. /cart, /wishlist, /orders)
  if (isGet && !isActionOrApi) {
    return url;
  }

  // If this was an AJAX or POST/action request (e.g. clicked Add to Wishlist from /product/:id or /shop)
  const referer = req.get('Referer');
  if (referer) {
    try {
      const parsed = new URL(referer, `${req.protocol}://${req.get('host') || 'localhost'}`);
      const targetPath = parsed.pathname + parsed.search;
      if (
        targetPath.startsWith('/') &&
        !targetPath.startsWith('//') &&
        !targetPath.startsWith('/auth') &&
        !targetPath.includes('/api/') &&
        !targetPath.startsWith('/wishlist/items') &&
        !targetPath.startsWith('/cart/items')
      ) {
        return targetPath;
      }
    } catch (_) {}
  }

  return '/home';
};

const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    const returnUrl = resolveReturnUrl(req);
    const loginRedirect = returnUrl && returnUrl !== '/home'
      ? `/auth/login?next=${encodeURIComponent(returnUrl)}`
      : '/auth/login';

    if (isAjax(req)) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to continue',
        data: { redirect: loginRedirect },
      });
    }
    req.flash('error', 'Please log in to continue');
    return res.redirect(loginRedirect);
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
