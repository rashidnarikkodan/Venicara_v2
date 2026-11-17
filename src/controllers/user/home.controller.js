const { productService, cartService } = require("../../services");
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

    return res.render("userPages/landing", {
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

    return res.render("userPages/home", {
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

    return res.render("userPages/shop", {
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
    if (!userId) return res.json({ count: 0 });

    const count = await cartService.getCartCount(userId);
    return res.json({ success: true, count });
  } catch (err) {
    handleError(res, "cartCount", err);
  }
};

module.exports = {
  landingPage,
  showHome,
  showShop,
  cartCount,
};
