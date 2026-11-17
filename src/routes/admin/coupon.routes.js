const express = require("express");
const router = express.Router();
const { couponsController } = require("../../controllers/admin/index");
const auth = require("../../middlewares/auth.admin.middleware");

router.use(auth.requireLogin);

/* ------------------ RESTful Coupon Routes ------------------ */
router
  .route("/")
  .get(couponsController.showCoupons)
  .post(couponsController.addCoupon);

router
  .route("/:id")
  .delete(couponsController.deleteCoupon);

/* ------------------ Backward-Compatible Aliases ------------------ */
router.post("/add", couponsController.addCoupon);
router.patch("/:id", couponsController.deleteCoupon);

module.exports = router;
