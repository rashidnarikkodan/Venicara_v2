const express = require("express");
const router = express.Router();
const {
  productController,
  homeController,
  footerController,
} = require("../../controllers/user/index");
const { asyncFunction } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");

router.get("/home", auth.isUserBlocked, asyncFunction(homeController.showHome));
router.get("/shop", asyncFunction(homeController.showShop));
router.get("/search", asyncFunction(productController.searchProducts));
router.get("/products/:id", asyncFunction(productController.showProductDetails));
router.get("/", auth.loggedIn, asyncFunction(homeController.landingPage));
router.get("/api/cart/count", auth.requireLogin, asyncFunction(homeController.cartCount));

// Public brand & contact pages
router.get("/about", asyncFunction(homeController.showAbout));
router.get("/contact", asyncFunction(homeController.showContact));
router.post("/contact", asyncFunction(homeController.handleContactInquiry));
router.post("/api/newsletter/subscribe", asyncFunction(homeController.subscribeNewsletter));

// Top-level Policy Aliases
router.get("/privacy", asyncFunction(footerController.privacyPolicy));
router.get("/privacy-policy", asyncFunction(footerController.privacyPolicy));
router.get("/terms", asyncFunction(footerController.termsConditions));
router.get("/terms-conditions", asyncFunction(footerController.termsConditions));
router.get("/return-policy", asyncFunction(footerController.returnPolicy));
router.get("/shipping-policy", asyncFunction(footerController.shippingPolicy));
router.get("/cookie-policy", asyncFunction(footerController.cookiePolicy));

module.exports = router;
