const express = require("express");
const router = express.Router();
const { wishlistController } = require("../../controllers/user/index");
const auth = require("../../middlewares/auth.user.middleware");

// Ensure all wishlist routes require authentication
router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Wishlist Routes ------------------ */

// GET /wishlist - View wishlist page
router.get("/", wishlistController.show);

// POST /wishlist/items/:id - Toggle product in wishlist
router.post("/items/:id", wishlistController.addToWishlist);

// POST /wishlist/items/:id/cart - Move wishlist item to cart
router.post("/items/:id/cart", wishlistController.addToCart);

// DELETE /wishlist/items/:id - Remove item from wishlist
router.delete("/items/:id", wishlistController.remove);

/* ------------------ Backward-Compatible Aliases ------------------ */
router.post("/api/add/:id", wishlistController.addToWishlist);
router.post("/api/addToCart/:id", wishlistController.addToCart);
router.delete("/api/remove/:id", wishlistController.remove);

module.exports = router;
