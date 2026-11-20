const express = require("express");
const router = express.Router();
const { orderController } = require("../../controllers/user/index");
const { asyncFunction } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");

router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Order Routes ------------------ */

// GET /orders - List all orders
router.get("/", asyncFunction(orderController.showOrders));

// POST /orders/payments/retry - Retry failed payment
router.post("/payments/retry", asyncFunction(orderController.retryPayment));

// PATCH /orders/payments/retry/verify - Verify retried payment
router.patch("/payments/retry/verify", asyncFunction(orderController.retryPaymentSuccess));

// GET /orders/:id/invoice - Download invoice PDF
router.get("/:id/invoice", asyncFunction(orderController.downloadInvoice));

// PATCH /orders/:id/cancel - Cancel order
router.patch("/:id/cancel", asyncFunction(orderController.cancelOrder));

// PATCH /orders/:id/return - Request full return
router.patch("/:id/return", asyncFunction(orderController.returnOrderRequest));

// PATCH /orders/:id/items/cancel - Cancel specific product item
router.patch("/:id/items/cancel", asyncFunction(orderController.cancelProduct));

// PATCH /orders/:id/items/return - Request return for specific item
router.patch("/:id/items/return", asyncFunction(orderController.returnProductRequest));

// POST /orders/:id/reviews - Add product review
router.post("/:id/reviews", asyncFunction(orderController.addReview));

// GET /orders/:id - Order details
router.get("/:id", asyncFunction(orderController.orderDetails));

/* ------------------ Backward-Compatible Aliases ------------------ */
router.patch("/cancel/:id", asyncFunction(orderController.cancelOrder));
router.patch("/return/:id", asyncFunction(orderController.returnOrderRequest));
router.patch("/product/cancel/:id", asyncFunction(orderController.cancelProduct));
router.patch("/product/return/:id", asyncFunction(orderController.returnProductRequest));
router.get("/details/:id", asyncFunction(orderController.orderDetails));
router.post("/review/:id/add", asyncFunction(orderController.addReview));
router.post("/api/retryPayment", asyncFunction(orderController.retryPayment));
router.patch("/api/retryPaymentSuccess", asyncFunction(orderController.retryPaymentSuccess));

module.exports = router;
