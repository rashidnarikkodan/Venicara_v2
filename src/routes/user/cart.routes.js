const express = require("express");
const router = express.Router();
const { cartController } = require("../../controllers/user/index");
const auth = require("../../middlewares/auth.user.middleware");

// Ensure all cart actions require authenticated user
router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Cart Routes ------------------ */

// GET /cart - View cart page
router.get("/", cartController.showCart);

// POST /cart/items/:id - Add product variant to cart
router.post("/items/:id", cartController.addToCart);

// PATCH /cart/items/:id - Update cart item quantity
router.patch("/items/:id", cartController.updateCartItemQuantity);

// DELETE /cart/items/:id - Remove item from cart
router.delete("/items/:id", cartController.removeFromCart);

/* ------------------ Backward-Compatible Aliases ------------------ */
router.post("/addToCart/:id", cartController.addToCart);
router.delete("/remove/:id", cartController.removeFromCart);
router.patch("/increase/:cartId", cartController.updateCartItemQuantity);
router.patch("/decrease/:cartId", cartController.updateCartItemQuantity);

module.exports = router;
