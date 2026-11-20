const express = require("express");
const router = express.Router();
const { referralsController } = require("../../controllers/admin/index");
const { asyncHandler } = require("../../helpers");
const auth = require("../../middlewares/auth.admin.middleware");

router
  .route("/")
  .get(auth.requireLogin, asyncHandler(referralsController.showReferrals));
router.patch(
  "/:id",
  auth.requireLogin,
  asyncHandler(referralsController.approveReward)
);

module.exports = router;
