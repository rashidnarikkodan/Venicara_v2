const { checkoutService, addressService } = require("../../services");
const { render, success } = require("../../helpers/response.helper");
const { AppError } = require("../../helpers/errors.helper");

/**
 * Show addresses for checkout
 * GET /checkout/address
 */
const showAddress = async (req, res) => {
  const userId = req.session.user.id;
  const { addresses, items, deliveryCharge } = await checkoutService.prepareAddressStep(userId);

  req.session.order = req.session.order || {};
  req.session.order.deliveryCharge = deliveryCharge;

  return render(res, "userPages/checkoutAddress", {
    addresses,
    items,
    deliveryCharge,
  });
};

/**
 * Show add address page
 * GET /checkout/address/new
 */
const showAddAddress = (req, res) => {
  return render(res, "userPages/checkoutAddressAdd");
};

/**
 * Add new address during checkout
 * POST /checkout/address
 */
const handleAddAddress = async (req, res) => {
  const userId = req.session.user.id;
  await addressService.createAddress(userId, req.body);
  req.flash("success", "Address added successfully");
  return res.redirect("/checkout/address");
};

/**
 * Show edit address during checkout
 * GET /checkout/address/:id/edit
 */
const showEditAddress = async (req, res) => {
  const userId = req.session.user.id;
  const address = await addressService.getAddressById(userId, req.params.id);
  return render(res, "userPages/checkoutAddressEdit", { address });
};

/**
 * Update address during checkout
 * PUT /checkout/address/:id
 */
const handleEditAddress = async (req, res) => {
  const userId = req.session.user.id;
  await addressService.updateAddress(userId, req.params.id, req.body);
  req.flash("success", "Address updated successfully");
  return res.redirect("/checkout/address");
};

/**
 * Store selected shipping address in session
 * POST /checkout/address/select
 */
const handleSelectAddress = (req, res) => {
  const { selectedAddress } = req.body;
  if (!selectedAddress) {
    throw new AppError("Address is required", 400);
  }
  req.session.address = selectedAddress;
  return success(res, "Address selected");
};

/**
 * Show payment methods & order summary
 * GET /checkout/payment
 */
const showPaymentMethods = async (req, res) => {
  const userId = req.session.user.id;
  delete req.session.coupon;

  const deliveryCharge = req.session.order?.deliveryCharge || 0;
  const data = await checkoutService.getPaymentStepData(userId, deliveryCharge);

  return render(res, "userPages/checkoutPayment", data);
};

/**
 * Apply coupon to checkout
 * POST /checkout/coupon
 */
const applyCoupon = async (req, res) => {
  delete req.session.coupon;
  const { code } = req.body;
  const userId = req.session.user.id;
  const deliveryCharge = req.session.order?.deliveryCharge || 0;

  const result = await checkoutService.calculateCoupon(userId, code, deliveryCharge);
  req.session.coupon = result.couponId;

  return success(res, {
    message: "Coupon applied successfully",
    ...result,
  });
};

/**
 * Cancel applied coupon
 * DELETE /checkout/coupon
 */
const cancelCoupon = async (req, res) => {
  delete req.session.coupon;
  const userId = req.session.user.id;
  const { total } = await (require("../../services").cartService).getCart(userId);
  const deliveryCharge = req.session.order?.deliveryCharge || 0;

  return success(res, {
    message: "Coupon removed",
    finalAmount: total + deliveryCharge,
  });
};

/**
 * Place order
 * POST /checkout/orders
 */
const handlePlaceOrder = async (req, res) => {
  const userId = req.session.user?.id;
  const addressId = req.session.address;
  const { paymentMethod } = req.body;
  const couponId = req.session.coupon;
  const deliveryCharge = req.session.order?.deliveryCharge || 0;

  const result = await checkoutService.placeOrder({
    userId,
    addressId,
    paymentMethod,
    couponId,
    deliveryCharge,
  });

  delete req.session.coupon;

  return success(res, {
    message: "Order created successfully",
    orderId: result.orderId,
    razorpayOrderId: result.razorpayOrderId,
    finalAmount: result.finalAmount,
  });
};

/**
 * Razorpay payment verification
 * POST /checkout/payments/verify
 */
const handleRazorpaySuccess = async (req, res) => {
  const result = await checkoutService.verifyRazorpaySuccess(req.body);
  delete req.session.coupon;
  return success(res, result.message);
};

/**
 * Razorpay payment failed handler
 * POST /checkout/payments/fail
 */
const handleRazorpayFailed = async (req, res) => {
  const { orderId } = req.body;
  await checkoutService.handleRazorpayFailure(orderId);
  delete req.session.coupon;
  return success(res, "Payment failed, Order placed as pending, Please Retry.");
};

/**
 * Order success confirmation page
 * GET /checkout/orders/:id/success
 */
const showPlaceOrder = async (req, res) => {
  const orderId = req.params.id;
  return render(res, "userPages/placeOrder", { orderId });
};

module.exports = {
  showAddress,
  showAddAddress,
  handleAddAddress,
  showEditAddress,
  handleEditAddress,
  handleSelectAddress,
  showPaymentMethods,
  applyCoupon,
  cancelCoupon,
  handlePlaceOrder,
  handleRazorpaySuccess,
  handleRazorpayFailed,
  showPlaceOrder,
};
