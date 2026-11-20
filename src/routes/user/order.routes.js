const express = require("express");
const router = express.Router();
const { orderController } = require("../../controllers/user/index");
const { asyncHandler } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");

router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Order Routes ------------------ */

// GET /orders - List all orders
router.get("/", asyncHandler(orderController.showOrders));

// POST /orders/payments/retry - Retry failed payment
router.post("/payments/retry", asyncHandler(orderController.retryPayment));

// PATCH /orders/payments/retry/verify - Verify retried payment
router.patch("/payments/retry/verify", asyncHandler(orderController.retryPaymentSuccess));

// GET /orders/:id/invoice - Download invoice PDF
router.get("/:id/invoice", asyncHandler(orderController.downloadInvoice));

// PATCH /orders/:id/cancel - Cancel order
router.patch("/:id/cancel", asyncHandler(orderController.cancelOrder));

// PATCH /orders/:id/return - Request full return
router.patch("/:id/return", asyncHandler(orderController.returnOrderRequest));

// PATCH /orders/:id/items/cancel - Cancel specific product item
router.patch("/:id/items/cancel", asyncHandler(orderController.cancelProduct));

// PATCH /orders/:id/items/return - Request return for specific item
router.patch("/:id/items/return", asyncHandler(orderController.returnProductRequest));

// POST /orders/:id/reviews - Add product review
router.post("/:id/reviews", asyncHandler(orderController.addReview));

// GET /orders/:id - Order details
router.get("/:id", asyncHandler(orderController.orderDetails));

/* ------------------ Backward-Compatible Aliases ------------------ */
router.patch("/cancel/:id", asyncHandler(orderController.cancelOrder));
router.patch("/return/:id", asyncHandler(orderController.returnOrderRequest));
router.patch("/product/cancel/:id", asyncHandler(orderController.cancelProduct));
router.patch("/product/return/:id", asyncHandler(orderController.returnProductRequest));
router.get("/details/:id", asyncHandler(orderController.orderDetails));
router.post("/review/:id/add", asyncHandler(orderController.addReview));
router.post("/api/retryPayment", asyncHandler(orderController.retryPayment));
router.patch("/api/retryPaymentSuccess", asyncHandler(orderController.retryPaymentSuccess));

module.exports = router;
