const express = require("express");
const router = express.Router();
const { referralsController } = require("../../controllers/admin/index");
const auth = require("../../middlewares/authAdmin");

router
  .route("/")
  .get(auth.requireLogin, referralsController.showReferrals);
router.patch(
  "/:id",
  auth.requireLogin,
  referralsController.approveReward
);

module.exports = router;
