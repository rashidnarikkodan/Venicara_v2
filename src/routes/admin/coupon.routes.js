const express = require("express");
const router = express.Router();
const { couponsController } = require("../../controllers/admin/index");
const { asyncHandler } = require("../../helpers");
const auth = require("../../middlewares/auth.admin.middleware");

router.use(auth.requireLogin);

/* ------------------ RESTful Coupon Routes ------------------ */
router
  .route("/")
  .get(asyncHandler(couponsController.showCoupons))
  .post(asyncHandler(couponsController.addCoupon));

router
  .route("/:id")
  .delete(asyncHandler(couponsController.deleteCoupon));

/* ------------------ Backward-Compatible Aliases ------------------ */
router.post("/add", asyncHandler(couponsController.addCoupon));
router.patch("/:id", asyncHandler(couponsController.deleteCoupon));

module.exports = router;
