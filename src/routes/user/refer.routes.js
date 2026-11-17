const express = require("express");
const router = express.Router();
const { referController } = require("../../controllers/user/index");
const auth = require("../../middlewares/auth.user.middleware");

router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Referral Routes ------------------ */
router.get("/", referController.showReferEarn);
router.post("/rewards/:id/claim", referController.earnReward);

/* ------------------ Backward-Compatible Aliases ------------------ */
router.patch("/api/reward", referController.earnReward);

module.exports = router;
