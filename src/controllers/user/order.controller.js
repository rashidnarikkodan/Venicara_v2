const { orderService } = require("../../services");
const { render, success, created } = require("../../helpers/response.helper");
const generateInvoice = require("../../helpers/generateInvoice.helper");
const handleError = require("../../helpers/handleError.helper");
const Order = require("../../models/order.model");

/**
 * List orders for user
 * GET /orders
 */
const showOrders = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { user, orders, page, limit, totalPages } = await orderService.getUserOrders(userId, {
      page: req.query.page,
      limit: req.query.limit,
    });

    return render(res, "userPages/orders", {
      orders,
      user,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    handleError(res, "showOrders", error);
  }
};

/**
 * Cancel full order
 * PATCH /orders/:id/cancel
 */
const cancelOrder = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const userId = req.session.user.id;

    const result = await orderService.cancelOrder(userId, orderId);
    return success(res, result.message);
  } catch (err) {
    handleError(res, "cancelOrder", err);
  }
};

/**
 * Cancel specific product in an order
 * PATCH /orders/:id/items/cancel
 */
const cancelProduct = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const index = req.query.index || req.body.index;
    const userId = req.session.user.id;

    const result = await orderService.cancelOrderItem(userId, orderId, index);
    return success(res, result.message);
  } catch (err) {
    handleError(res, "cancelProduct", err);
  }
};

/**
 * Request return for full order
 * PATCH /orders/:id/return
 */
const returnOrderRequest = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { reason } = req.body;
    const userId = req.session.user.id;

    const result = await orderService.requestOrderReturn(userId, orderId, reason);
    return success(res, result.message);
  } catch (err) {
    handleError(res, "returnOrderRequest", err);
  }
};

/**
 * Request return for specific product in an order
 * PATCH /orders/:id/items/return
 */
const returnProductRequest = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const index = req.query.index || req.body.index;
    const { reason } = req.body;
    const userId = req.session.user.id;

    const result = await orderService.requestOrderItemReturn(userId, orderId, index, reason);
    return success(res, result.message);
  } catch (err) {
    handleError(res, "returnProductRequest", err);
  }
};

/**
 * Show order details
 * GET /orders/:id
 */
const orderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { index } = req.query;
    const userId = req.session.user.id;

    const details = await orderService.getOrderDetails(userId, id, index);
    return render(res, "userPages/orderDetails", details);
  } catch (err) {
    if (err.statusCode) {
      req.flash("error", err.message);
      return res.redirect("/orders");
    }
    handleError(res, "orderDetails", err);
  }
};

/**
 * Download order PDF invoice
 * GET /orders/:id/invoice
 */
const downloadInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId || req.params.id;
    const userId = req.session.user.id;

    const order = await Order.findOne({ _id: orderId, userId })
      .populate("userId", "name email")
      .populate("shippingAddress")
      .lean();

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/orders");
    }

    const populatedOrder = {
      ...order,
      orderId: order.orderId || order._id,
      userId: {
        name: order.userId?.name || "N/A",
        email: order.userId?.email || "N/A",
      },
      shippingAddress: {
        fullName: order.shippingAddress?.fullName || "N/A",
        street: order.shippingAddress?.street || "N/A",
        city: order.shippingAddress?.city || "N/A",
        state: order.shippingAddress?.state || "N/A",
        pin: order.shippingAddress?.pin || "N/A",
        mobile: order.shippingAddress?.mobile || "N/A",
      },
      products: order.products?.map((p) => ({
        productName: p.productName || "N/A",
        volume: p.volume || "-",
        quantity: p.quantity || 0,
        discountPrice: p.finalDiscount || 0,
        subtotal: p.subtotal || 0,
        createdAt: order.createdAt || new Date(),
        finalAmount: p.finalAmount || 0,
        discountAmount: p.discountAmount || 0,
      })),
      totalAmount: order.totalAmount || 0,
      payment: {
        method: order.payment?.method || "N/A",
      },
      status: order.status || "N/A",
    };

    generateInvoice(populatedOrder, res);
  } catch (error) {
    handleError(res, "downloadInvoice", error);
  }
};

/**
 * Add or update review for a product
 * POST /orders/:id/reviews
 */
const addReview = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const userId = req.session.user.id;
    const { name, rating, message } = req.body;

    const result = await orderService.addReview(userId, productId, { name, rating, message });
    return created(res, result.message, result.review);
  } catch (err) {
    handleError(res, "addReview", err);
  }
};

/**
 * Create Razorpay order to retry payment
 * POST /orders/payments/retry
 */
const retryPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.session.user.id;

    const result = await orderService.retryPayment(userId, orderId);
    return success(res, "Payment order created", result);
  } catch (err) {
    handleError(res, "retryPayment", err);
  }
};

/**
 * Verify retry payment
 * PATCH /orders/payments/retry/verify
 */
const retryPaymentSuccess = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const result = await orderService.verifyRetryPayment(userId, req.body);
    return success(res, result.message);
  } catch (err) {
    handleError(res, "retryPaymentSuccess", err);
  }
};

module.exports = {
  showOrders,
  cancelOrder,
  returnOrderRequest,
  cancelProduct,
  returnProductRequest,
  downloadInvoice,
  orderDetails,
  addReview,
  retryPayment,
  retryPaymentSuccess,
};
