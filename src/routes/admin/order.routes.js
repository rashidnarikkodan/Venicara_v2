const express = require("express");
const router = express.Router();
const { ordersController } = require("../../controllers/admin/index");
const { asyncHandler } = require("../../helpers");
const auth = require("../../middlewares/auth.admin.middleware");

router.route("/").get(auth.requireLogin, asyncHandler(ordersController.showOrders));
router.patch(
  "/product/status/:id",
  asyncHandler(ordersController.handleProductStatus)
);
router.patch("/:id/status", asyncHandler(ordersController.handleOrderStatus));
router.patch("/:orderId/return/reject", asyncHandler(ordersController.rejectReturn));
router.patch("/:orderId/return/approve", asyncHandler(ordersController.approveReturn));
router.get("/:id", auth.requireLogin, asyncHandler(ordersController.showOrderDetails));

module.exports = router;
