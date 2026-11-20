const express = require("express");
const router = express.Router();
const {
  productController,
  homeController,
  footerController,
} = require("../../controllers/user/index");
const { asyncHandler } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");

router.get("/home", auth.isUserBlocked, asyncHandler(homeController.showHome));
router.get("/shop", asyncHandler(homeController.showShop));
router.get("/search", asyncHandler(productController.searchProducts));
router.get("/products/:id", asyncHandler(productController.showProductDetails));
router.get("/", auth.loggedIn, asyncHandler(homeController.landingPage));
router.get("/api/cart/count", auth.requireLogin, asyncHandler(homeController.cartCount));

// Public brand & contact pages
router.get("/about", asyncHandler(homeController.showAbout));
router.get("/contact", asyncHandler(homeController.showContact));
router.post("/contact", asyncHandler(homeController.handleContactInquiry));
router.post("/api/newsletter/subscribe", asyncHandler(homeController.subscribeNewsletter));

// Top-level Policy Aliases
router.get("/privacy", asyncHandler(footerController.privacyPolicy));
router.get("/privacy-policy", asyncHandler(footerController.privacyPolicy));
router.get("/terms", asyncHandler(footerController.termsConditions));
router.get("/terms-conditions", asyncHandler(footerController.termsConditions));
router.get("/return-policy", asyncHandler(footerController.returnPolicy));
router.get("/shipping-policy", asyncHandler(footerController.shippingPolicy));
router.get("/cookie-policy", asyncHandler(footerController.cookiePolicy));

module.exports = router;
