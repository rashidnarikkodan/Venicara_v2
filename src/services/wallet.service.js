const crypto = require("crypto");
const Wallet = require("../models/wallet.model");
const WalletTransaction = require("../models/walletTransaction.model");
const User = require("../models/user.model");
const razorpay = require("../config/payment.config");
const { AppError } = require("../helpers/errors.helper");

class WalletService {
  /**
   * Get wallet and user info
   */
  async getWallet(userId) {
    let [wallet, user] = await Promise.all([
      Wallet.findOne({ userId }),
      User.findById(userId).lean(),
    ]);

    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0 });
    }

    return { wallet, user };
  }

  /**
   * Create Razorpay order for adding money
   */
  async createAddMoneyOrder(userId, amount) {
    const numAmount = parseInt(amount, 10);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      throw new AppError("Invalid deposit amount", 400);
    }

    const options = {
      amount: numAmount * 100, // in paise
      currency: "INR",
      receipt: "wallet_txn_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    await WalletTransaction.create({
      userId,
      razorpayId: order.id,
      amount: options.amount,
      type: "credit",
      status: "pending",
    });

    return { order };
  }

  /**
   * Verify Razorpay payment and credit wallet
   */
  async verifyAddMoneyPayment(userId, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new AppError("Missing payment details", 400);
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new AppError("Invalid payment signature", 400);
    }

    const txn = await WalletTransaction.findOne({ razorpayId: razorpay_order_id, userId });
    if (!txn) {
      throw new AppError("Transaction not found", 404);
    }
    if (txn.status === "success") {
      return { message: "Already verified", balance: txn.lastBalance };
    }

    const amountInINR = txn.amount / 100;
    const wallet = await Wallet.findOne({ userId });
    const currentBalance = wallet ? wallet.balance : 0;
    const newBalance = currentBalance + amountInINR;

    await Wallet.updateOne({ userId }, { $inc: { balance: amountInINR } }, { upsert: true });

    txn.status = "success";
    txn.lastBalance = newBalance;
    await txn.save();

    return { message: "Wallet updated successfully", balance: newBalance };
  }

  /**
   * Mark transaction as failed if payment was cancelled
   */
  async recordPaymentFailure(userId, razorpayId) {
    const txn = await WalletTransaction.findOne({ userId, razorpayId });
    const wallet = await Wallet.findOne({ userId });
    if (txn) {
      txn.status = "failed";
      txn.lastBalance = wallet?.balance || 0;
      await txn.save();
    }
    return { message: "Payment cancelled" };
  }

  /**
   * Get paginated transaction history
   */
  async getTransactionHistory(userId, { page = 1, limit = 12 }) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;

    const [transactions, user, totalTransactions] = await Promise.all([
      WalletTransaction.find({ userId })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .lean(),
      User.findById(userId).lean(),
      WalletTransaction.countDocuments({ userId }),
    ]);

    const totalPages = Math.ceil(totalTransactions / limitNum) || 1;
    return {
      transactions,
      user,
      totalPages,
      page: pageNum,
      limit: limitNum,
      count: (pageNum - 1) * limitNum,
    };
  }
}

module.exports = new WalletService();

