const express = require("express");
const router = express.Router();

const {
  productController,
  homeController,
  footerController,
} = require("../../controllers/user/index");
const auth = require("../../middlewares/auth.user.middleware");

router.get(
  "/home",
  auth.isUserBlocked,
  homeController.showHome
);
router.get("/shop", homeController.showShop);
router.get("/search", productController.searchProducts);
router.get("/products/:id", productController.showProductDetails);
router.get("/", auth.loggedIn, homeController.landingPage);
router.get("/api/cart/count", auth.requireLogin, homeController.cartCount);

// Public brand & contact pages
router.get("/about", homeController.showAbout);
router.get("/contact", homeController.showContact);
router.post("/contact", homeController.handleContactInquiry);
router.post("/api/newsletter/subscribe", homeController.subscribeNewsletter);

// Top-level Policy Aliases
router.get("/privacy", footerController.privacyPolicy);
router.get("/privacy-policy", footerController.privacyPolicy);
router.get("/terms", footerController.termsConditions);
router.get("/terms-conditions", footerController.termsConditions);
router.get("/return-policy", footerController.returnPolicy);
router.get("/shipping-policy", footerController.shippingPolicy);
router.get("/cookie-policy", footerController.cookiePolicy);

module.exports = router;