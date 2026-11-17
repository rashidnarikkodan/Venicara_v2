const Address = require("../models/address.model");
const Cart = require("../models/cart.model");
const PaymentMethod = require("../models/paymentMethod.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const Coupon = require("../models/coupon.model");
const User = require("../models/user.model");
const Wallet = require("../models/wallet.model");
const WalletTransaction = require("../models/walletTransaction.model");
const generateOrderId = require("../helpers/orderId.helper");
const razorpay = require("../config/payment.config");
const crypto = require("crypto");
const { AppError } = require("../helpers/errors.helper");

class CheckoutService {
  /**
   * Prepare addresses and cart review for checkout
   */
  async prepareAddressStep(userId) {
    const addresses = await Address.find({ userId, isDeleted: false }).sort({ createdAt: -1 });
    const cartDocs = await Cart.find({ userId, status: "active" }).populate("productId");

    let totalCartAmount = 0;
    for (const p of cartDocs) {
      const variant = p.productId?.variants?.find(
        (v) => v._id.toString() === p.variantId.toString()
      );

      if (!variant) continue;
      p.lineTotal = Math.round(variant.finalAmount * p.quantity);
      await p.save();
      totalCartAmount += variant.finalAmount * p.quantity;

      if (variant.stock < p.quantity) {
        throw new AppError(`Product "${p.productId.name}" is out of stock`, 400);
      }
    }

    const deliveryCharge = totalCartAmount > 7000 ? 0 : 500;

    const items = cartDocs
      .map((doc) => {
        const variant = doc.productId?.variants?.find(
          (v) => v._id.toString() === doc.variantId.toString()
        );
        if (!variant) return null;
        return {
          cartId: doc._id,
          quantity: doc.quantity,
          product: doc.productId,
          status: doc.status,
          variant,
        };
      })
      .filter(Boolean);

    return { addresses, items, deliveryCharge, totalCartAmount };
  }

  /**
   * Get available payment methods, coupons, and wallet balance
   */
  async getPaymentStepData(userId, deliveryCharge = 0) {
    const paymentMethods = await PaymentMethod.find({ isActive: true }).sort({ createdAt: 1 });
    const cartDocs = await Cart.find({ userId, status: "active" }).populate("productId").lean();

    const items = cartDocs
      .map((doc) => {
        const variant = doc.productId?.variants?.find(
          (v) => v._id.toString() === doc.variantId.toString()
        );
        if (!variant) return null;
        return {
          cartId: doc._id,
          quantity: doc.quantity,
          product: doc.productId,
          status: doc.status,
          variant,
          lineTotal: variant.finalAmount * doc.quantity,
        };
      })
      .filter(Boolean);

    const invalidItems = items.filter((item) => item.variant.stock < item.quantity);
    if (invalidItems.length > 0) {
      const names = invalidItems.map((i) => i.product.name).join(", ");
      throw new AppError(`Some products are out of stock: ${names}`, 400);
    }

    let subtotal = 0;
    for (const item of items) {
      subtotal += item.lineTotal;
    }
    const total = subtotal + deliveryCharge;

    const coupons = await Coupon.find({
      minPrice: { $lte: total },
      expireAt: { $gte: new Date() },
      usedBy: { $nin: [userId] },
      isDeleted: false,
      $expr: { $lt: ["$used", "$limit"] },
    });

    const [user, walletDocs] = await Promise.all([
      User.findById(userId).lean(),
      Wallet.find({ userId }, { balance: 1 }).lean(),
    ]);

    const balance = walletDocs.length > 0 ? parseFloat(walletDocs[0].balance.toFixed(2)) : 0;

    return {
      paymentMethods,
      items,
      coupons,
      subtotal,
      total,
      deliveryCharge,
      user,
      balance,
    };
  }

  /**
   * Calculate and apply coupon discount
   */
  async calculateCoupon(userId, code, deliveryCharge = 0) {
    const coupon = await Coupon.findOne({
      code,
      isDeleted: false,
      expireAt: { $gte: new Date() },
    });

    if (!coupon) {
      throw new AppError("Invalid or expired coupon", 400);
    }

    if (coupon.usedBy?.includes(userId)) {
      throw new AppError("Coupon has already been used by this account", 400);
    }

    const cartDocs = await Cart.find({ userId, status: "active" }).populate("productId").lean();
    let lineTotal = 0;

    for (const doc of cartDocs) {
      const variant = doc.productId?.variants?.find(
        (v) => v._id.toString() === doc.variantId.toString()
      );
      if (!variant) continue;

      if (variant.stock < doc.quantity) {
        throw new AppError("Some products are out of stock", 400);
      }
      lineTotal += variant.finalAmount * doc.quantity;
    }

    if (lineTotal < coupon.minPrice) {
      throw new AppError(`Minimum order amount of Rs.${coupon.minPrice} required for this coupon`, 400);
    }

    let discPerc = coupon.discount;
    const discount = Math.min(
      parseFloat(((lineTotal * coupon.discount) / 100).toFixed(2)),
      coupon.maxDiscountAmount
    );

    if (discount === coupon.maxDiscountAmount) {
      discPerc = parseFloat(((discount / lineTotal) * 100).toFixed(2));
    }
    const finalAmount = parseFloat((lineTotal - discount + deliveryCharge).toFixed(2));

    return {
      couponId: coupon._id,
      discount,
      finalAmount,
      discPerc,
      actualDiscount: coupon.discount,
    };
  }

  /**
   * Process and place order (COD / Wallet / Razorpay)
   */
  async placeOrder({ userId, addressId, paymentMethod, couponId, deliveryCharge = 0 }) {
    if (!addressId) {
      throw new AppError("Shipping address is required", 400);
    }

    const cartItems = await Cart.find({ userId, status: "active" }).populate("productId").lean();
    if (!cartItems.length) {
      throw new AppError("No items in cart", 400);
    }

    let totalOrderPrice = 0;
    const products = [];

    for (const item of cartItems) {
      const variant = item.productId?.variants?.find(
        (v) => v._id.toString() === item.variantId.toString()
      );
      if (!variant) continue;

      if (variant.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${item.productId.name} (${variant.volume}ml)`, 400);
      }

      const subtotal = Number(variant.finalAmount) * item.quantity;
      totalOrderPrice += subtotal;

      products.push({
        productId: item.productId._id,
        variantId: item.variantId,
        productName: item.productId.name,
        basePrice: Number(variant.basePrice),
        finalAmount: parseFloat(variant.finalAmount),
        discount: Number(variant.finalDiscount || 0),
        quantity: item.quantity,
        subtotal,
        volume: variant.volume,
        status: paymentMethod === "RAZORPAY" ? "pending" : "confirmed",
        image: item.productId.images?.[0]?.url || "/images/placeholder.avif",
      });
    }

    let couponDiscount = 0;
    let couponAmount = 0;
    let coupon = null;
    let finalAmount = totalOrderPrice;

    if (couponId) {
      coupon = await Coupon.findById(couponId);
      if (coupon && coupon.usedBy.includes(userId)) {
        throw new AppError("Coupon already used", 400);
      }

      if (coupon) {
        couponDiscount = coupon.discount;
        couponAmount = Math.min(
          parseFloat(((coupon.discount / 100) * totalOrderPrice).toFixed(2)) || 0,
          coupon.maxDiscountAmount
        );
        if (couponAmount === coupon.maxDiscountAmount) {
          couponDiscount = 0;
        }
        finalAmount -= couponAmount;

        await Coupon.updateOne(
          { _id: coupon._id, usedBy: { $ne: userId } },
          { $push: { usedBy: userId }, $inc: { used: 1 } }
        );
      }
    }

    finalAmount = parseFloat((finalAmount + deliveryCharge).toFixed(2));

    const payment = {
      method: paymentMethod,
      status: "pending",
      transactionId: null,
    };
    let razorpayOrderId = null;

    if (paymentMethod === "RAZORPAY") {
      const MAX_AMOUNT = 50000000;
      if (finalAmount * 100 > MAX_AMOUNT) {
        throw new AppError("Amount exceeds maximum allowed in Razorpay", 400);
      }

      const options = {
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        payment_capture: 1,
      };
      const razorpayOrder = await razorpay.orders.create(options);
      razorpayOrderId = razorpayOrder.id;
    } else if (paymentMethod === "WALLET") {
      const wallet = await Wallet.findOne({ userId });
      if (!wallet || wallet.balance < finalAmount) {
        await WalletTransaction.create({
          userId,
          type: "debit",
          amount: Math.round(finalAmount * 100),
          status: "failed",
          lastBalance: wallet?.balance || 0,
        });

        // Revert coupon if applied
        if (coupon) {
          await Coupon.updateOne(
            { _id: coupon._id },
            { $pull: { usedBy: userId }, $inc: { used: -1 } }
          );
        }
        throw new AppError("Insufficient wallet balance", 400);
      }

      wallet.balance = parseFloat((wallet.balance - finalAmount).toFixed(2));
      await wallet.save();

      await WalletTransaction.create({
        userId,
        type: "debit",
        amount: Math.round(finalAmount * 100),
        status: "success",
        lastBalance: wallet.balance,
      });

      payment.status = "paid";
      payment.method = "WALLET";
      payment.paidAt = new Date();
    }

    const orderId = await generateOrderId();

    const order = await Order.create({
      userId,
      orderId,
      products,
      shippingAddress: addressId,
      payment,
      couponApplied: coupon?._id || null,
      totalOrderPrice,
      couponDiscount,
      couponAmount,
      deliveryCharge,
      finalAmount,
      status: paymentMethod === "RAZORPAY" ? "pending" : "confirmed",
      razorpayOrderId,
    });

    // Reduce product stock
    for (const item of cartItems) {
      await Product.updateOne(
        { _id: item.productId._id, "variants._id": item.variantId },
        { $inc: { "variants.$.stock": -item.quantity } }
      );
    }

    // Clear cart if not razorpay
    if (paymentMethod !== "RAZORPAY") {
      await Cart.deleteMany({ userId });
    }

    return {
      orderId,
      razorpayOrderId,
      finalAmount,
      order,
    };
  }

  /**
   * Verify Razorpay payment signature
   */
  async verifyRazorpaySuccess({ orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature }) {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new AppError("Payment verification failed", 400);
    }

    const order = await Order.findOne({ orderId });
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

    await Cart.deleteMany({ userId: order.userId, status: "active" });
    return { order, message: "Payment verified and order completed" };
  }

  /**
   * Handle Razorpay payment failure
   */
  async handleRazorpayFailure(orderId) {
    const order = await Order.findOne({ orderId });
    if (order) {
      await Cart.deleteMany({ userId: order.userId, status: "active" });
    }
    return { message: "Payment failed, order placed as pending" };
  }
}

module.exports = new CheckoutService();

