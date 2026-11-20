const { walletService } = require("../../services");
const { render, success } = require("../../helpers/response.helper");

/**
 * Show wallet page
 * GET /wallet
 */
const showWallet = async (req, res) => {
  const userId = req.session.user.id;
  const { wallet, user } = await walletService.getWallet(userId);
  return render(res, "userPages/wallet", { wallet, user });
};

/**
 * Create order to deposit money into wallet
 * POST /wallet/deposits
 */
const addToWallet = async (req, res) => {
  const userId = req.session.user.id;
  const { amount } = req.body;
  const result = await walletService.createAddMoneyOrder(userId, amount);
  return success(res, { ...result });
};

/**
 * Verify payment deposit
 * POST /wallet/deposits/verify
 */
const verifyPayment = async (req, res) => {
  const userId = req.session.user.id;
  const result = await walletService.verifyAddMoneyPayment(userId, req.body);
  return success(res, result.message, { balance: result.balance });
};

/**
 * Handle cancelled / failed deposit
 * POST /wallet/deposits/fail
 */
const paymentFailed = async (req, res) => {
  const userId = req.session.user.id;
  const { razorpayId } = req.body;
  await walletService.recordPaymentFailure(userId, razorpayId);
  return success(res, "The payment window was closed before completing transaction.");
};

/**
 * View wallet transactions
 * GET /wallet/transactions
 */
const showTransactionHistory = async (req, res) => {
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
};

module.exports = {
  showWallet,
  addToWallet,
  verifyPayment,
  paymentFailed,
  showTransactionHistory,
};
