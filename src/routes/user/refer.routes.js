const express = require("express");
const router = express.Router();
const { referController } = require("../../controllers/user/index");
const { asyncHandler } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");

router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Referral Routes ------------------ */
router.get("/", asyncHandler(referController.showReferEarn));
router.post("/rewards/:id/claim", asyncHandler(referController.earnReward));

/* ------------------ Backward-Compatible Aliases ------------------ */
router.patch("/api/reward", asyncHandler(referController.earnReward));

module.exports = router;
