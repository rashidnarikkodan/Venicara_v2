const express = require("express");
const router = express.Router();
const { wishlistController } = require("../../controllers/user/index");
const { asyncHandler } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");

// Ensure all wishlist routes require authentication
router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Wishlist Routes ------------------ */

// GET /wishlist - View wishlist page
router.get("/", asyncHandler(wishlistController.show));

// POST /wishlist/items/:id - Toggle product in wishlist
router.post("/items/:id", asyncHandler(wishlistController.addToWishlist));

// POST /wishlist/items/:id/cart - Move wishlist item to cart
router.post("/items/:id/cart", asyncHandler(wishlistController.addToCart));

// DELETE /wishlist/items/:id - Remove item from wishlist
router.delete("/items/:id", asyncHandler(wishlistController.remove));

/* ------------------ Backward-Compatible Aliases ------------------ */
router.post("/api/add/:id", asyncHandler(wishlistController.addToWishlist));
router.post("/api/addToCart/:id", asyncHandler(wishlistController.addToCart));
router.delete("/api/remove/:id", asyncHandler(wishlistController.remove));

module.exports = router;
