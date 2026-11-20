const { cartService } = require("../../services");
const { success, render } = require("../../helpers/response.helper");
const handleError = require("../../helpers/handleError.helper");

/**
 * Show Cart page
 * GET /cart
 */
const showCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { items, total } = await cartService.getCart(userId);
    return render(res, "userPages/cart", { items, total });
  } catch (err) {
    handleError(res, "showCart", err);
  }
};

/**
 * Add item to Cart
 * POST /cart/items/:id or POST /cart/items
 */
const addToCart = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { variantId } = req.body;
    const userId = req.session.user.id;

    const result = await cartService.addToCart(userId, productId, variantId);
    return success(res, "Added to bag", result);
  } catch (err) {
    handleError(res, "addToCart", err);
  }
};

/**
 * Remove item from Cart
 * DELETE /cart/items/:id
 */
const removeFromCart = async (req, res) => {
  try {
    const { id: cartItemId } = req.params;
    const userId = req.session.user.id;

    await cartService.removeFromCart(userId, cartItemId);
    return success(res, "Item removed from cart");
  } catch (err) {
    handleError(res, "removeFromCart", err);
  }
};

/**
 * Update item quantity (increase / decrease)
 * PATCH /cart/items/:id
 */
const updateCartItemQuantity = async (req, res) => {
  try {
    const cartItemId = req.params.cartId || req.params.id;
    const userId = req.session.user.id;
    const action = req.body.action || (req.path.includes("increase") ? "increase" : "decrease");

    const result = await cartService.updateQuantity(userId, cartItemId, action);
    return success(res, { ...result });
  } catch (err) {
    handleError(res, "updateCartItemQuantity", err);
  }
};

module.exports = {
  showCart,
  addToCart,
  removeFromCart,
  increaseQuantity: updateCartItemQuantity,
  decreaseQuantity: updateCartItemQuantity,
  updateCartItemQuantity,
};
