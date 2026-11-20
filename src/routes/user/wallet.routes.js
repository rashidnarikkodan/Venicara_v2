const express = require("express");
const router = express.Router();
const { walletController } = require("../../controllers/user/index");
const { asyncFunction } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");

router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Wallet Routes ------------------ */
router.get("/", asyncFunction(walletController.showWallet));
router.get("/transactions", asyncFunction(walletController.showTransactionHistory));
router.post("/deposits", asyncFunction(walletController.addToWallet));
router.post("/deposits/verify", asyncFunction(walletController.verifyPayment));
router.post("/deposits/fail", asyncFunction(walletController.paymentFailed));

/* ------------------ Backward-Compatible Aliases ------------------ */
router.post("/add", asyncFunction(walletController.addToWallet));
router.post("/verify-payment", asyncFunction(walletController.verifyPayment));
router.patch("/api/addMoneyFailed", asyncFunction(walletController.paymentFailed));
router.get("/history", asyncFunction(walletController.showTransactionHistory));

module.exports = router;
