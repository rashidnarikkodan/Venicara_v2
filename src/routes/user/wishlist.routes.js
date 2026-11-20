const express = require("express");
const router = express.Router();
const { wishlistController } = require("../../controllers/user/index");
const { asyncFunction } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");

// Ensure all wishlist routes require authentication
router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Wishlist Routes ------------------ */

// GET /wishlist - View wishlist page
router.get("/", asyncFunction(wishlistController.show));

// POST /wishlist/items/:id - Toggle product in wishlist
router.post("/items/:id", asyncFunction(wishlistController.addToWishlist));

// POST /wishlist/items/:id/cart - Move wishlist item to cart
router.post("/items/:id/cart", asyncFunction(wishlistController.addToCart));

// DELETE /wishlist/items/:id - Remove item from wishlist
router.delete("/items/:id", asyncFunction(wishlistController.remove));

/* ------------------ Backward-Compatible Aliases ------------------ */
router.post("/api/add/:id", asyncFunction(wishlistController.addToWishlist));
router.post("/api/addToCart/:id", asyncFunction(wishlistController.addToCart));
router.delete("/api/remove/:id", asyncFunction(wishlistController.remove));

module.exports = router;
