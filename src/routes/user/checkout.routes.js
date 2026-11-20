const express = require("express");
const router = express.Router();
const { checkoutController } = require("../../controllers/user/index");
const { asyncFunction } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");

router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Checkout Routes ------------------ */

// Address selection & management in checkout
router
  .route("/address")
  .get(asyncFunction(checkoutController.showAddress))
  .post(asyncFunction(checkoutController.handleAddAddress));

router.get("/address/new", asyncFunction(checkoutController.showAddAddress));
router.post("/address/select", asyncFunction(checkoutController.handleSelectAddress));

router
  .route("/address/:id/edit")
  .get(asyncFunction(checkoutController.showEditAddress));

router.put("/address/:id", asyncFunction(checkoutController.handleEditAddress));

// Payment Step
router.get("/payment", asyncFunction(checkoutController.showPaymentMethods));

// Coupon management
router
  .route("/coupon")
  .post(asyncFunction(checkoutController.applyCoupon))
  .delete(asyncFunction(checkoutController.cancelCoupon));

// Order creation & payment callbacks
router.post("/orders", asyncFunction(checkoutController.handlePlaceOrder));
router.post("/payments/verify", asyncFunction(checkoutController.handleRazorpaySuccess));
router.post("/payments/fail", asyncFunction(checkoutController.handleRazorpayFailed));
router.get("/orders/:id/success", asyncFunction(checkoutController.showPlaceOrder));

/* ------------------ Backward-Compatible Aliases ------------------ */
router.post("/address/new", asyncFunction(checkoutController.handleAddAddress));
router.get("/address/edit/:id", asyncFunction(checkoutController.showEditAddress));
router.put("/address/edit/:id", asyncFunction(checkoutController.handleEditAddress));
router.post("/address/selectAddress", asyncFunction(checkoutController.handleSelectAddress));
router.get("/paymentMethod", asyncFunction(checkoutController.showPaymentMethods));
router.patch("/api/coupon/apply", asyncFunction(checkoutController.applyCoupon));
router.patch("/api/coupon/cancel", asyncFunction(checkoutController.cancelCoupon));
router.post("/api/placeOrder", asyncFunction(checkoutController.handlePlaceOrder));
router.post("/api/razorpay/success", asyncFunction(checkoutController.handleRazorpaySuccess));
router.post("/api/razorpay/failed", asyncFunction(checkoutController.handleRazorpayFailed));
router.get("/placeOrder/:id", asyncFunction(checkoutController.showPlaceOrder));

module.exports = router;
