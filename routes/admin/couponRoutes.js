const express = require("express");
const router = express.Router();
const { couponsController } = require("../../controllers/admin/index");
const auth = require("../../middlewares/authAdmin");

router.route("/").get(auth.requireLogin, couponsController.showCoupons);
router
  .route("/add")
  .post(auth.requireLogin, couponsController.addCoupon);
router.patch("/:id", couponsController.deleteCoupon);

module.exports = router;
