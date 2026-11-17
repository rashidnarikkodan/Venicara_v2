const express = require("express");
const router = express.Router();
const { checkoutController } = require("../../controllers/user/index");
const auth = require("../../middlewares/auth.user.middleware");

router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Checkout Routes ------------------ */

// Address selection & management in checkout
router
  .route("/address")
  .get(checkoutController.showAddress)
  .post(checkoutController.handleAddAddress);

router.get("/address/new", checkoutController.showAddAddress);
router.post("/address/select", checkoutController.handleSelectAddress);

router
  .route("/address/:id/edit")
  .get(checkoutController.showEditAddress);

router.put("/address/:id", checkoutController.handleEditAddress);

// Payment Step
router.get("/payment", checkoutController.showPaymentMethods);

// Coupon management
router
  .route("/coupon")
  .post(checkoutController.applyCoupon)
  .delete(checkoutController.cancelCoupon);

// Order creation & payment callbacks
router.post("/orders", checkoutController.handlePlaceOrder);
router.post("/payments/verify", checkoutController.handleRazorpaySuccess);
router.post("/payments/fail", checkoutController.handleRazorpayFailed);
router.get("/orders/:id/success", checkoutController.showPlaceOrder);

/* ------------------ Backward-Compatible Aliases ------------------ */
router.post("/address/new", checkoutController.handleAddAddress);
router.get("/address/edit/:id", checkoutController.showEditAddress);
router.put("/address/edit/:id", checkoutController.handleEditAddress);
router.post("/address/selectAddress", checkoutController.handleSelectAddress);
router.get("/paymentMethod", checkoutController.showPaymentMethods);
router.patch("/api/coupon/apply", checkoutController.applyCoupon);
router.patch("/api/coupon/cancel", checkoutController.cancelCoupon);
router.post("/api/placeOrder", checkoutController.handlePlaceOrder);
router.post("/api/razorpay/success", checkoutController.handleRazorpaySuccess);
router.post("/api/razorpay/failed", checkoutController.handleRazorpayFailed);
router.get("/placeOrder/:id", checkoutController.showPlaceOrder);

module.exports = router;
