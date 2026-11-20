const express = require("express");
const router = express.Router();
const { referralsController } = require("../../controllers/admin/index");
const { asyncFunction } = require("../../helpers");
const auth = require("../../middlewares/auth.admin.middleware");

router
  .route("/")
  .get(auth.requireLogin, asyncFunction(referralsController.showReferrals));
router.patch(
  "/:id",
  auth.requireLogin,
  asyncFunction(referralsController.approveReward)
);

module.exports = router;
