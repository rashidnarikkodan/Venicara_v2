const { walletService } = require("../../services");
const apiResponse = require("../../helpers/apiResponse.helper");
const handleError = require("../../helpers/handleError.helper");

/**
 * Show wallet page
 * GET /wallet
 */
const showWallet = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { wallet, user } = await walletService.getWallet(userId);
    res.render("userPages/wallet", { wallet, user });
  } catch (err) {
    handleError(res, "showWallet", err);
  }
};

/**
 * Create order to deposit money into wallet
 * POST /wallet/deposits
 */
const addToWallet = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { amount } = req.body;
    const result = await walletService.createAddMoneyOrder(userId, amount);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    handleError(res, "addToWallet", error);
  }
};

/**
 * Verify payment deposit
 * POST /wallet/deposits/verify
 */
const verifyPayment = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const result = await walletService.verifyAddMoneyPayment(userId, req.body);
    return res.status(200).json({
      status: true,
      success: true,
      message: result.message,
      balance: result.balance,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ status: false, success: false, message: err.message });
    }
    handleError(res, "verifyPayment", err);
  }
};

/**
 * Handle cancelled / failed deposit
 * POST /wallet/deposits/fail
 */
const paymentFailed = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { razorpayId } = req.body;
    await walletService.recordPaymentFailure(userId, razorpayId);
    return res.status(200).json({
      status: true,
      success: true,
      message: "The payment window was closed before completing transaction.",
    });
  } catch (error) {
    handleError(res, "paymentFailed", error);
  }
};

/**
 * View wallet transactions
 * GET /wallet/transactions
 */
const showTransactionHistory = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const data = await walletService.getTransactionHistory(userId, {
      page: req.query.page,
      limit: req.query.limit,
    });

    res.render("userPages/walletTransaction", {
      transactions: data.transactions,
      user: data.user,
      search: null,
      count: data.count,
      totalPages: data.totalPages,
      page: data.page,
      limit: data.limit,
    });
  } catch (error) {
    handleError(res, "showTransactionHistory", error);
  }
};

module.exports = {
  showWallet,
  addToWallet,
  verifyPayment,
  paymentFailed,
  showTransactionHistory,
};
