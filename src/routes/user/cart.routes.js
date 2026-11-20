const express = require("express");
const router = express.Router();
const { cartController } = require("../../controllers/user/index");
const { asyncHandler } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");

// Ensure all cart actions require authenticated user
router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Cart Routes ------------------ */

// GET /cart - View cart page
router.get("/", asyncHandler(cartController.showCart));

// POST /cart/items/:id - Add product variant to cart
router.post("/items/:id", asyncHandler(cartController.addToCart));

// PATCH /cart/items/:id - Update cart item quantity
router.patch("/items/:id", asyncHandler(cartController.updateCartItemQuantity));

// DELETE /cart/items/:id - Remove item from cart
router.delete("/items/:id", asyncHandler(cartController.removeFromCart));

/* ------------------ Backward-Compatible Aliases ------------------ */
router.post("/addToCart/:id", asyncHandler(cartController.addToCart));
router.delete("/remove/:id", asyncHandler(cartController.removeFromCart));
router.patch("/increase/:cartId", asyncHandler(cartController.updateCartItemQuantity));
router.patch("/decrease/:cartId", asyncHandler(cartController.updateCartItemQuantity));

module.exports = router;
