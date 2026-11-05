const express = require("express");
const router = express.Router();
const { ordersController } = require("../../controllers/admin/index");
const auth = require("../../middlewares/authAdmin");

router.route("/").get(auth.requireLogin, ordersController.showOrders);
router.patch(
  "/product/status/:id",
  ordersController.handleProductStatus
);
router.patch("/:id/status", ordersController.handleOrderStatus);
router.patch("/:orderId/return/reject", ordersController.rejectReturn);
router.patch("/:orderId/return/approve", ordersController.approveReturn);
router.get("/:id", auth.requireLogin, ordersController.showOrderDetails);

module.exports = router;
