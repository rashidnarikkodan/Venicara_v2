const express = require("express");
const router = express.Router();
const { walletController } = require("../../controllers/user/index");
const auth = require("../../middlewares/auth.user.middleware");

router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Wallet Routes ------------------ */
router.get("/", walletController.showWallet);
router.get("/transactions", walletController.showTransactionHistory);
router.post("/deposits", walletController.addToWallet);
router.post("/deposits/verify", walletController.verifyPayment);
router.post("/deposits/fail", walletController.paymentFailed);

/* ------------------ Backward-Compatible Aliases ------------------ */
router.post("/add", walletController.addToWallet);
router.post("/verify-payment", walletController.verifyPayment);
router.patch("/api/addMoneyFailed", walletController.paymentFailed);
router.get("/history", walletController.showTransactionHistory);

module.exports = router;
