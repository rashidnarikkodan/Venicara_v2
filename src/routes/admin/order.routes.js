const express = require("express");
const router = express.Router();
const { ordersController } = require("../../controllers/admin/index");
const { asyncFunction } = require("../../helpers");
const auth = require("../../middlewares/auth.admin.middleware");

router.route("/").get(auth.requireLogin, asyncFunction(ordersController.showOrders));
router.patch(
  "/product/status/:id",
  asyncFunction(ordersController.handleProductStatus)
);
router.patch("/:id/status", asyncFunction(ordersController.handleOrderStatus));
router.patch("/:orderId/return/reject", asyncFunction(ordersController.rejectReturn));
router.patch("/:orderId/return/approve", asyncFunction(ordersController.approveReturn));
router.get("/:id", auth.requireLogin, asyncFunction(ordersController.showOrderDetails));

module.exports = router;
