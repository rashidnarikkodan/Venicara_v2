const Order = require("../models/order.model");
const Product = require("../models/product.model");
const Coupon = require("../models/coupon.model");
const Wallet = require("../models/wallet.model");
const WalletTransaction = require("../models/walletTransaction.model");
const Review = require("../models/review.model");
const User = require("../models/user.model");
const razorpay = require("../config/payment.config");
const crypto = require("crypto");
const { AppError } = require("../helpers/errors.helper");

class OrderService {
  /**
   * Get paginated orders list for user
   */
  async getUserOrders(userId, { page = 1, limit = 6 }) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 6;

    const [user, orders, totalOrders] = await Promise.all([
      User.findById(userId).lean(),
      Order.find({ userId })
        .populate("products.productId")
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .lean(),
      Order.countDocuments({ userId }),
    ]);

    const totalPages = Math.ceil(totalOrders / limitNum) || 1;
    return { user, orders, page: pageNum, limit: limitNum, totalPages };
  }

  /**
   * Get single order details with selected product item
   */
  async getOrderDetails(userId, orderId, itemIndex) {
    const [order, user] = await Promise.all([
      Order.findOne({ _id: orderId, userId }).populate("shippingAddress"),
      User.findById(userId).lean(),
    ]);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const idx = parseInt(itemIndex, 10);
    const product = !isNaN(idx) ? order.products[idx] : order.products[0];
    if (!product) {
      throw new AppError("Product details not found in this order", 404);
    }

    return {
      order,
      product,
      user,
      payment: order.payment,
      shippedAddress: order.shippingAddress,
    };
  }

  /**
   * Cancel entire order with inventory restocking and wallet refunding
   */
  async cancelOrder(userId, orderId) {
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (["delivered", "shipped"].includes(order.status)) {
      throw new AppError("Cannot cancel the order at this stage", 400);
    }

    // Restock all active products
    for (const product of order.products) {
      if (["cancelled", "returned"].includes(product.status)) continue;
      await Product.updateOne(
        { _id: product.productId, "variants._id": product.variantId },
        { $inc: { "variants.$.stock": product.quantity } }
      );
      product.status = "cancelled";
    }

    // Process refund if prepaid
    if (["WALLET", "RAZORPAY"].includes(order.payment?.method)) {
      if (order.payment.status === "pending") {
        order.status = "cancelled";
        await order.save();
        return {
          message: "Order cancelled successfully. No refund required as payment was not completed.",
        };
      }

      let wallet = await Wallet.findOne({ userId });
      if (!wallet) wallet = new Wallet({ userId, balance: 0 });

      let refundAmount = parseFloat(order.finalAmount.toFixed(2));

      if (order.couponApplied) {
        const totalRefund = parseFloat((order.refundAmount + order.finalAmount).toFixed(2));
        const originalAmount =
          order.totalOrderPrice -
          ((order.totalOrderPrice * order.couponDiscount) / 100).toFixed(2);
        if (totalRefund > originalAmount) {
          const extraMoney = totalRefund - originalAmount;
          refundAmount -= extraMoney;
          order.couponApplied = null;
          order.couponDiscount = 0;
        }
      }

      wallet.balance = parseFloat((wallet.balance + refundAmount).toFixed(2));
      await wallet.save();

      await WalletTransaction.create({
        userId,
        orderId,
        type: "credit",
        amount: Math.round(refundAmount * 100),
        status: "success",
        lastBalance: wallet.balance,
        note: "Refund for cancelled order",
      });

      order.payment.status = "refunded";
      order.refundAmount = (order.refundAmount || 0) + refundAmount;
      order.finalAmount = 0;
    }

    order.status = "cancelled";
    await order.save();

    return { message: "Order cancelled successfully" };
  }

  /**
   * Cancel single product item in an order
   */
  async cancelOrderItem(userId, orderId, index) {
    const itemIndex = parseInt(index, 10);
    const [order, walletDoc] = await Promise.all([
      Order.findOne({ _id: orderId, userId }),
      Wallet.findOne({ userId }),
    ]);

    if (!order) {
      throw new AppError("Order not found", 404);
    }
    const wallet = walletDoc || new Wallet({ userId, balance: 0 });

    const product = order.products[itemIndex];
    if (!product) {
      throw new AppError("Invalid product index", 400);
    }
    if (product.status === "cancelled") {
      throw new AppError("Item already cancelled", 400);
    }
    if (["cancelled", "returned"].includes(product.status)) {
      throw new AppError("Product already cancelled/returned", 400);
    }
    if (["delivered", "shipped", "Out of delivery"].includes(product.status)) {
      throw new AppError("Cannot cancel at this stage", 400);
    }

    // Restock variant
    await Product.updateOne(
      { _id: product.productId, "variants._id": product.variantId },
      { $inc: { "variants.$.stock": product.quantity } }
    );
    product.status = "cancelled";

    // Refund calculation
    if (["RAZORPAY", "WALLET"].includes(order.payment?.method)) {
      const couponId = order.couponApplied;
      let refundAmount = 0;

      if (couponId) {
        const coupon = await Coupon.findById(couponId).lean();
        const discountPercent = order.couponDiscount || 0;

        if (order.couponAmount < (coupon?.maxDiscountAmount || Infinity)) {
          let productPaid = parseFloat(
            (product.subtotal - product.subtotal * (discountPercent / 100)).toFixed(2)
          );
          const amount = parseFloat((order.finalAmount - productPaid).toFixed(2));

          if (coupon && amount < coupon.minPrice) {
            const remainings = order.products.filter(
              (p, i) => i !== itemIndex && !["cancelled", "returned"].includes(p.status)
            );
            const remainingsTotal = remainings.reduce(
              (sum, p) => sum + p.subtotal * (discountPercent / 100),
              0
            );
            productPaid -= parseFloat(remainingsTotal.toFixed(2));
            order.couponApplied = null;
          }
          refundAmount = productPaid;
        } else {
          const totalSubtotal = order.totalOrderPrice;
          const totalDiscount = order.couponAmount;
          const productShare = parseFloat((product.subtotal / totalSubtotal).toFixed(2));
          const productDiscount = parseFloat((totalDiscount * productShare).toFixed(2));
          let productPaid = parseFloat((product.subtotal - productDiscount).toFixed(2));
          const amount = parseFloat((order.finalAmount - productPaid).toFixed(2));

          if (coupon && amount < coupon.minPrice) {
            const remainings = order.products.filter(
              (p, i) => i !== itemIndex && p.status === "confirmed"
            );
            const remainingsTotal = remainings.reduce((sum, p) => {
              const share = parseFloat((p.subtotal / totalSubtotal).toFixed(2));
              const discount = parseFloat((totalDiscount * share).toFixed(2));
              return sum + discount;
            }, 0);
            productPaid -= parseFloat(remainingsTotal.toFixed(2));
            order.couponApplied = null;
          }
          refundAmount = productPaid;
        }
      } else {
        refundAmount = parseFloat(product.subtotal.toFixed(2));
      }

      const totalPaid = order.totalOrderPrice - (order.couponAmount || 0);
      const totalRefunded = order.refundAmount || 0;
      if (totalRefunded + refundAmount > totalPaid) {
        refundAmount = parseFloat((totalPaid - totalRefunded).toFixed(2));
      }

      order.finalAmount = parseFloat((order.finalAmount - refundAmount).toFixed(2));
      if (order.deliveryCharge > 0 && order.finalAmount === order.deliveryCharge) {
        order.finalAmount -= order.deliveryCharge;
        refundAmount += order.deliveryCharge;
      }

      if (!order.refundAmount) order.refundAmount = 0;
      product.refundAmount = parseFloat(refundAmount.toFixed(2));
      order.refundAmount += parseFloat(refundAmount.toFixed(2));

      wallet.balance = parseFloat((wallet.balance + refundAmount).toFixed(2));
      await wallet.save();

      await WalletTransaction.create({
        userId,
        orderId,
        type: "credit",
        amount: Math.round(refundAmount * 100),
        status: "success",
        lastBalance: wallet.balance,
      });
    }

    if (order.products.every((p) => p.status === "cancelled")) {
      order.status = "cancelled";
    } else if (order.products.every((p) => p.status === "returned")) {
      order.status = "returned";
      order.payment.status = "refunded";
    }

    await order.save();
    return { message: "Product cancelled successfully" };
  }

  /**
   * Request full order return
   */
  async requestOrderReturn(userId, orderId, reason) {
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const cleanReason = String(reason || "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanReason) {
      throw new AppError("Return reason is required", 400);
    }

    order.return.isRequested = true;
    order.return.reason = cleanReason;
    await order.save();

    return { message: "Return request submitted for order" };
  }

  /**
   * Request single product return
   */
  async requestOrderItemReturn(userId, orderId, index, reason) {
    const itemIndex = parseInt(index, 10);
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const product = order.products[itemIndex];
    if (!product) {
      throw new AppError("Invalid product index", 400);
    }

    const cleanReason = String(reason || "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanReason) {
      throw new AppError("Return reason is required", 400);
    }

    product.return.isRequested = true;
    product.return.reason = cleanReason;
    await order.save();

    return { message: "Return request submitted for product" };
  }

  /**
   * Create Razorpay order to retry payment
   */
  async retryPayment(userId, orderId) {
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const MAX_AMOUNT = 50000000;
    if (order.finalAmount * 100 > MAX_AMOUNT) {
      throw new AppError("Amount exceeds maximum allowed limit", 400);
    }

    const options = {
      amount: Math.round(order.finalAmount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return {
      orderId: order.orderId,
      razorpayOrderId: razorpayOrder.id,
      finalAmount: order.finalAmount,
    };
  }

  /**
   * Verify Razorpay payment signature for retry payment
   */
  async verifyRetryPayment(userId, { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature }) {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new AppError("Payment verification failed", 400);
    }

    const order = await Order.findOne({ orderId, userId });
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    order.payment.status = "paid";
    order.payment.transactionId = razorpay_payment_id;
    order.payment.paidAt = new Date();
    order.status = "confirmed";

    for (const prod of order.products) {
      prod.status = "confirmed";
    }

    await order.save();
    return { message: "Payment verified and order completed" };
  }

  /**
   * Add or update product review
   */
  async addReview(userId, productId, { name, rating, message }) {
    if (!rating || !message || !name || !productId) {
      throw new AppError("All fields are required", 400);
    }

    const existingReview = await Review.findOne({ userId, productId });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.message = message;
      existingReview.name = name;
      await existingReview.save();
      return { message: "Review updated successfully", review: existingReview };
    }

    const newReview = await Review.create({
      name,
      rating,
      message,
      userId,
      productId,
    });

    return { message: "Review added successfully", review: newReview };
  }
}

module.exports = new OrderService();

