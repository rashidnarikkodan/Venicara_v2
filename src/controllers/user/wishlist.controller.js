const { wishlistService } = require("../../services");
const apiResponse = require("../../helpers/apiResponse.helper");
const handleError = require("../../helpers/handleError.helper");

/**
 * Show Wishlist page
 * GET /wishlist
 */
const show = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { items, user } = await wishlistService.getWishlist(userId);
    res.render("userPages/wishlist", { items, user });
  } catch (err) {
    handleError(res, "showWishlist", err);
  }
};

/**
 * Toggle Wishlist item (add / remove)
 * POST /wishlist/items/:id
 */
const addToWishlist = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { variantId } = req.body;
    const userId = req.session.user.id;

    const result = await wishlistService.toggleWishlist(userId, productId, variantId);
    return apiResponse.ok(res, result.message, { action: result.action, item: result.item });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    handleError(res, "addToWishlist", err);
  }
};

/**
 * Move item from Wishlist to Cart
 * POST /wishlist/items/:id/cart
 */
const addToCart = async (req, res) => {
  try {
    const { id: wishlistId } = req.params;
    const userId = req.session.user.id;

    const result = await wishlistService.moveToCart(userId, wishlistId);
    return apiResponse.ok(res, result.message, { cartItem: result.cartItem });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    handleError(res, "addToCart", err);
  }
};

/**
 * Remove item from Wishlist
 * DELETE /wishlist/items/:id
 */
const remove = async (req, res) => {
  try {
    const { id: wishlistId } = req.params;
    const userId = req.session.user.id;

    await wishlistService.removeFromWishlist(userId, wishlistId);
    return apiResponse.ok(res, "Product removed from wishlist");
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    handleError(res, "removeWishlist", err);
  }
};

module.exports = {
  show,
  addToWishlist,
  addToCart,
  remove,
};
