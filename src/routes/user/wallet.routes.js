const express = require("express");
const router = express.Router();
const { walletController } = require("../../controllers/user/index");
const { asyncHandler } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");

router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Wallet Routes ------------------ */
router.get("/", asyncHandler(walletController.showWallet));
router.get("/transactions", asyncHandler(walletController.showTransactionHistory));
router.post("/deposits", asyncHandler(walletController.addToWallet));
router.post("/deposits/verify", asyncHandler(walletController.verifyPayment));
router.post("/deposits/fail", asyncHandler(walletController.paymentFailed));

/* ------------------ Backward-Compatible Aliases ------------------ */
router.post("/add", asyncHandler(walletController.addToWallet));
router.post("/verify-payment", asyncHandler(walletController.verifyPayment));
router.patch("/api/addMoneyFailed", asyncHandler(walletController.paymentFailed));
router.get("/history", asyncHandler(walletController.showTransactionHistory));

module.exports = router;
