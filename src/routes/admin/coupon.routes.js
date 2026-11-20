const express = require("express");
const router = express.Router();
const { couponsController } = require("../../controllers/admin/index");
const { asyncFunction } = require("../../helpers");
const auth = require("../../middlewares/auth.admin.middleware");

router.use(auth.requireLogin);

/* ------------------ RESTful Coupon Routes ------------------ */
router
  .route("/")
  .get(asyncFunction(couponsController.showCoupons))
  .post(asyncFunction(couponsController.addCoupon));

router
  .route("/:id")
  .delete(asyncFunction(couponsController.deleteCoupon));

/* ------------------ Backward-Compatible Aliases ------------------ */
router.post("/add", asyncFunction(couponsController.addCoupon));
router.patch("/:id", asyncFunction(couponsController.deleteCoupon));

module.exports = router;
