const express = require("express");
const router = express.Router();
const { cartController } = require("../../controllers/user/index");
const { asyncFunction } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");

// Ensure all cart actions require authenticated user
router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Cart Routes ------------------ */

// GET /cart - View cart page
router.get("/", asyncFunction(cartController.showCart));

// POST /cart/items/:id - Add product variant to cart
router.post("/items/:id", asyncFunction(cartController.addToCart));

// PATCH /cart/items/:id - Update cart item quantity
router.patch("/items/:id", asyncFunction(cartController.updateCartItemQuantity));

// DELETE /cart/items/:id - Remove item from cart
router.delete("/items/:id", asyncFunction(cartController.removeFromCart));

/* ------------------ Backward-Compatible Aliases ------------------ */
router.post("/addToCart/:id", asyncFunction(cartController.addToCart));
router.delete("/remove/:id", asyncFunction(cartController.removeFromCart));
router.patch("/increase/:cartId", asyncFunction(cartController.updateCartItemQuantity));
router.patch("/decrease/:cartId", asyncFunction(cartController.updateCartItemQuantity));

module.exports = router;
