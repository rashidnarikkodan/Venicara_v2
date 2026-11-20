const { walletService } = require("../../services");
const { render, success } = require("../../helpers/response.helper");
const handleError = require("../../helpers/handleError.helper");

/**
 * Show wallet page
 * GET /wallet
 */
const showWallet = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { wallet, user } = await walletService.getWallet(userId);
    return render(res, "userPages/wallet", { wallet, user });
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
    return success(res, { ...result });
  } catch (error) {
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
    return success(res, result.message, { balance: result.balance });
  } catch (err) {
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
    return success(res, "The payment window was closed before completing transaction.");
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

    return render(res, "userPages/walletTransaction", {
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
