const { checkoutService, addressService } = require("../../services");
const { render, success } = require("../../helpers/response.helper");
const handleError = require("../../helpers/handleError.helper");

/**
 * Show addresses for checkout
 * GET /checkout/address
 */
const showAddress = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { addresses, items, deliveryCharge } = await checkoutService.prepareAddressStep(userId);

    req.session.order = req.session.order || {};
    req.session.order.deliveryCharge = deliveryCharge;

    return render(res, "userPages/checkoutAddress", {
      addresses,
      items,
      deliveryCharge,
    });
  } catch (error) {
    if (error.statusCode) {
      req.flash("error", error.message);
      return res.redirect("/cart");
    }
    handleError(res, "showAddress", error);
  }
};

/**
 * Show add address page
 * GET /checkout/address/new
 */
const showAddAddress = (req, res) => {
  try {
    return render(res, "userPages/checkoutAddressAdd");
  } catch (error) {
    handleError(res, "showAddAddress", error);
  }
};

/**
 * Add new address during checkout
 * POST /checkout/address
 */
const handleAddAddress = async (req, res) => {
  try {
    const userId = req.session.user.id;
    await addressService.createAddress(userId, req.body);
    req.flash("success", "Address added successfully");
    return res.redirect("/checkout/address");
  } catch (error) {
    if (error.statusCode) {
      req.flash("error", error.message);
      return res.redirect("/checkout/address/new");
    }
    handleError(res, "handleAddAddress", error);
  }
};

/**
 * Show edit address during checkout
 * GET /checkout/address/:id/edit
 */
const showEditAddress = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const address = await addressService.getAddressById(userId, req.params.id);
    return render(res, "userPages/checkoutAddressEdit", { address });
  } catch (error) {
    if (error.statusCode) {
      req.flash("error", error.message);
      return res.redirect("/checkout/address");
    }
    handleError(res, "showEditAddress", error);
  }
};

/**
 * Update address during checkout
 * PUT /checkout/address/:id
 */
const handleEditAddress = async (req, res) => {
  try {
    const userId = req.session.user.id;
    await addressService.updateAddress(userId, req.params.id, req.body);
    req.flash("success", "Address updated successfully");
    return res.redirect("/checkout/address");
  } catch (error) {
    if (error.statusCode) {
      req.flash("error", error.message);
      return res.redirect(`/checkout/address/edit/${req.params.id}`);
    }
    handleError(res, "handleEditAddress", error);
  }
};

/**
 * Store selected shipping address in session
 * POST /checkout/address/select
 */
const handleSelectAddress = (req, res) => {
  try {
    const { selectedAddress } = req.body;
    if (!selectedAddress) {
      return handleError(res, "handleSelectAddress", { statusCode: 400, message: "Address is required" });
    }
    req.session.address = selectedAddress;
    return success(res, "Address selected");
  } catch (error) {
    handleError(res, "handleSelectAddress", error);
  }
};

/**
 * Show payment methods & order summary
 * GET /checkout/payment
 */
const showPaymentMethods = async (req, res) => {
  try {
    const userId = req.session.user.id;
    delete req.session.coupon;

    const deliveryCharge = req.session.order?.deliveryCharge || 0;
    const data = await checkoutService.getPaymentStepData(userId, deliveryCharge);

    return render(res, "userPages/checkoutPayment", data);
  } catch (error) {
    if (error.statusCode) {
      req.flash("error", error.message);
      return res.redirect("/cart");
    }
    handleError(res, "showPaymentMethods", error);
  }
};

/**
 * Apply coupon to checkout
 * POST /checkout/coupon
 */
const applyCoupon = async (req, res) => {
  try {
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
  } catch (error) {
    handleError(res, "applyCoupon", error);
  }
};

/**
 * Cancel applied coupon
 * DELETE /checkout/coupon
 */
const cancelCoupon = async (req, res) => {
  try {
    delete req.session.coupon;
    const userId = req.session.user.id;
    const { total } = await (require("../../services").cartService).getCart(userId);
    const deliveryCharge = req.session.order?.deliveryCharge || 0;

    return success(res, {
      message: "Coupon removed",
      finalAmount: total + deliveryCharge,
    });
  } catch (error) {
    handleError(res, "cancelCoupon", error);
  }
};

/**
 * Place order
 * POST /checkout/orders
 */
const handlePlaceOrder = async (req, res) => {
  try {
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
  } catch (error) {
    handleError(res, "handlePlaceOrder", error);
  }
};

/**
 * Razorpay payment verification
 * POST /checkout/payments/verify
 */
const handleRazorpaySuccess = async (req, res) => {
  try {
    const result = await checkoutService.verifyRazorpaySuccess(req.body);
    delete req.session.coupon;
    return success(res, result.message);
  } catch (err) {
    handleError(res, "handleRazorpaySuccess", err);
  }
};

/**
 * Razorpay payment failed handler
 * POST /checkout/payments/fail
 */
const handleRazorpayFailed = async (req, res) => {
  try {
    const { orderId } = req.body;
    await checkoutService.handleRazorpayFailure(orderId);
    delete req.session.coupon;
    return success(res, "Payment failed, Order placed as pending, Please Retry.");
  } catch (error) {
    handleError(res, "handleRazorpayFailed", error);
  }
};

/**
 * Order success confirmation page
 * GET /checkout/orders/:id/success
 */
const showPlaceOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    return render(res, "userPages/placeOrder", { orderId });
  } catch (error) {
    handleError(res, "showPlaceOrder", error);
  }
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
