const express = require("express");
const router = express.Router();
const { checkoutController } = require("../../controllers/user/index");
const { asyncHandler } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");

router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Checkout Routes ------------------ */

// Address selection & management in checkout
router
  .route("/address")
  .get(asyncHandler(checkoutController.showAddress))
  .post(asyncHandler(checkoutController.handleAddAddress));

router.get("/address/new", asyncHandler(checkoutController.showAddAddress));
router.post("/address/select", asyncHandler(checkoutController.handleSelectAddress));

router
  .route("/address/:id/edit")
  .get(asyncHandler(checkoutController.showEditAddress));

router.put("/address/:id", asyncHandler(checkoutController.handleEditAddress));

// Payment Step
router.get("/payment", asyncHandler(checkoutController.showPaymentMethods));

// Coupon management
router
  .route("/coupon")
  .post(asyncHandler(checkoutController.applyCoupon))
  .delete(asyncHandler(checkoutController.cancelCoupon));

// Order creation & payment callbacks
router.post("/orders", asyncHandler(checkoutController.handlePlaceOrder));
router.post("/payments/verify", asyncHandler(checkoutController.handleRazorpaySuccess));
router.post("/payments/fail", asyncHandler(checkoutController.handleRazorpayFailed));
router.get("/orders/:id/success", asyncHandler(checkoutController.showPlaceOrder));

/* ------------------ Backward-Compatible Aliases ------------------ */
router.post("/address/new", asyncHandler(checkoutController.handleAddAddress));
router.get("/address/edit/:id", asyncHandler(checkoutController.showEditAddress));
router.put("/address/edit/:id", asyncHandler(checkoutController.handleEditAddress));
router.post("/address/selectAddress", asyncHandler(checkoutController.handleSelectAddress));
router.get("/paymentMethod", asyncHandler(checkoutController.showPaymentMethods));
router.patch("/api/coupon/apply", asyncHandler(checkoutController.applyCoupon));
router.patch("/api/coupon/cancel", asyncHandler(checkoutController.cancelCoupon));
router.post("/api/placeOrder", asyncHandler(checkoutController.handlePlaceOrder));
router.post("/api/razorpay/success", asyncHandler(checkoutController.handleRazorpaySuccess));
router.post("/api/razorpay/failed", asyncHandler(checkoutController.handleRazorpayFailed));
router.get("/placeOrder/:id", asyncHandler(checkoutController.showPlaceOrder));

module.exports = router;
