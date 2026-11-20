const { productService, cartService } = require("../../services");
const { render, success } = require("../../helpers/response.helper");
const { HTTP_STATUS } = require("../../constants");
const handleError = require("../../helpers/handleError.helper");

/**
 * Public Landing page
 * GET /
 */
const landingPage = async (req, res) => {
  try {
    const userId = req.session?.user?.id || null;
    const { products, categories, wishlistIds } = await productService.getLandingData(userId);
    const user = req.session?.user || null;

    return render(res, "userPages/landing", {
      products,
      categories,
      user,
      wishlistIds,
    });
  } catch (err) {
    handleError(res, "landingPage", err);
  }
};

/**
 * Logged-in Home page
 * GET /home
 */
const showHome = async (req, res) => {
  try {
    const userId = req.session?.user?.id || null;
    const { products, categories, wishlistIds } = await productService.getLandingData(userId);
    const user = req.session?.user || null;

    return render(res, "userPages/home", {
      products,
      categories,
      user,
      wishlistIds,
    });
  } catch (err) {
    handleError(res, "showHome", err);
  }
};

/**
 * Shop browsing catalog page
 * GET /shop
 */
const showShop = async (req, res) => {
  try {
    const userId = req.session?.user?.id || null;
    const data = await productService.getShopData(userId, req.query);
    const user = req.session?.user || null;

    return render(res, "userPages/shop", {
      ...data,
      user,
      buildQuery: (extra) => {
        const params = { ...req.query, ...extra };
        return Object.entries(params)
          .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
          .join("&");
      },
    });
  } catch (err) {
    handleError(res, "showShop", err);
  }
};

/**
 * Get active cart count
 * GET /api/cart/count
 */
const cartCount = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) return success(res, "Cart count retrieved", { count: 0 });

    const count = await cartService.getCartCount(userId);
    return success(res, "Cart count retrieved", { count });
  } catch (err) {
    handleError(res, "cartCount", err);
  }
};

/**
 * About page ("Our Story")
 * GET /about
 */
const showAbout = (req, res) => {
  try {
    const user = req.session?.user || null;
    return render(res, "userPages/about", { user });
  } catch (err) {
    handleError(res, "showAbout", err);
  }
};

/**
 * Contact Us page
 * GET /contact
 */
const showContact = (req, res) => {
  try {
    const user = req.session?.user || null;
    return render(res, "userPages/contact", { user });
  } catch (err) {
    handleError(res, "showContact", err);
  }
};

/**
 * Handle Contact Inquiry
 * POST /contact
 */
const handleContactInquiry = (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const isApi = req.xhr || (req.headers.accept || '').includes('application/json');

    if (!name || !email || !message) {
      if (isApi) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Please provide your name, email, and message.' });
      }
      req.flash('error', 'Please fill in all required fields.');
      return res.redirect('/contact');
    }

    if (isApi) {
      return success(res, 'Thank you for reaching out to Venicara. Our concierge will be in touch shortly.');
    }

    req.flash('success', 'Thank you for reaching out. We will respond to your inquiry shortly.');
    return res.redirect('/contact');
  } catch (err) {
    handleError(res, 'handleContactInquiry', err);
  }
};

/**
 * Handle Newsletter Subscription
 * POST /api/newsletter/subscribe
 */
const subscribeNewsletter = (req, res) => {
  try {
    const { email } = req.body;
    const isApi = req.xhr || (req.headers.accept || '').includes('application/json');

    if (!email || !email.includes('@')) {
      if (isApi) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Please enter a valid email address.' });
      }
      req.flash('error', 'Please enter a valid email address.');
      return res.redirect('back');
    }

    if (isApi) {
      return success(res, 'Thank you for subscribing to Venicara private previews!');
    }

    req.flash('success', 'Thank you for subscribing to Venicara private previews!');
    return res.redirect('back');
  } catch (err) {
    handleError(res, 'subscribeNewsletter', err);
  }
};

module.exports = {
  landingPage,
  showHome,
  showShop,
  cartCount,
  showAbout,
  showContact,
  handleContactInquiry,
  subscribeNewsletter,
};
