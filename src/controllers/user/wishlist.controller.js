const { wishlistService } = require("../../services");
const { success, render } = require("../../helpers/response.helper");

/**
 * Show Wishlist page
 * GET /wishlist
 */
const show = async (req, res) => {
  const userId = req.session.user.id;
  const { items, user } = await wishlistService.getWishlist(userId);
  return render(res, "userPages/wishlist", { items, user });
};

/**
 * Toggle Wishlist item (add / remove)
 * POST /wishlist/items/:id
 */
const addToWishlist = async (req, res) => {
  const { id: productId } = req.params;
  const { variantId } = req.body;
  const userId = req.session.user.id;

  const result = await wishlistService.toggleWishlist(userId, productId, variantId);
  return success(res, result.message, { action: result.action, item: result.item });
};

/**
 * Move item from Wishlist to Cart
 * POST /wishlist/items/:id/cart
 */
const addToCart = async (req, res) => {
  const { id: wishlistId } = req.params;
  const userId = req.session.user.id;

  const result = await wishlistService.moveToCart(userId, wishlistId);
  return success(res, result.message, { cartItem: result.cartItem });
};

/**
 * Remove item from Wishlist
 * DELETE /wishlist/items/:id
 */
const remove = async (req, res) => {
  const { id: wishlistId } = req.params;
  const userId = req.session.user.id;

  await wishlistService.removeFromWishlist(userId, wishlistId);
  return success(res, "Product removed from wishlist");
};

module.exports = {
  show,
  addToWishlist,
  addToCart,
  remove,
};
