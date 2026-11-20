const express = require("express");
const router = express.Router();
const { referController } = require("../../controllers/user/index");
const { asyncFunction } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");

router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Referral Routes ------------------ */
router.get("/", asyncFunction(referController.showReferEarn));
router.post("/rewards/:id/claim", asyncFunction(referController.earnReward));

/* ------------------ Backward-Compatible Aliases ------------------ */
router.patch("/api/reward", asyncFunction(referController.earnReward));

module.exports = router;
