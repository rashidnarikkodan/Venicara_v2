const express = require("express");
const router = express.Router();
const { orderController } = require("../../controllers/user/index");
const auth = require("../../middlewares/auth.user.middleware");

router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Order Routes ------------------ */

// GET /orders - List all orders
router.get("/", orderController.showOrders);

// POST /orders/payments/retry - Retry failed payment
router.post("/payments/retry", orderController.retryPayment);

// PATCH /orders/payments/retry/verify - Verify retried payment
router.patch("/payments/retry/verify", orderController.retryPaymentSuccess);

// GET /orders/:id/invoice - Download invoice PDF
router.get("/:id/invoice", orderController.downloadInvoice);

// PATCH /orders/:id/cancel - Cancel order
router.patch("/:id/cancel", orderController.cancelOrder);

// PATCH /orders/:id/return - Request full return
router.patch("/:id/return", orderController.returnOrderRequest);

// PATCH /orders/:id/items/cancel - Cancel specific product item
router.patch("/:id/items/cancel", orderController.cancelProduct);

// PATCH /orders/:id/items/return - Request return for specific item
router.patch("/:id/items/return", orderController.returnProductRequest);

// POST /orders/:id/reviews - Add product review
router.post("/:id/reviews", orderController.addReview);

// GET /orders/:id - Order details
router.get("/:id", orderController.orderDetails);

/* ------------------ Backward-Compatible Aliases ------------------ */
router.patch("/cancel/:id", orderController.cancelOrder);
router.patch("/return/:id", orderController.returnOrderRequest);
router.patch("/product/cancel/:id", orderController.cancelProduct);
router.patch("/product/return/:id", orderController.returnProductRequest);
router.get("/details/:id", orderController.orderDetails);
router.post("/review/:id/add", orderController.addReview);
router.post("/api/retryPayment", orderController.retryPayment);
router.patch("/api/retryPaymentSuccess", orderController.retryPaymentSuccess);

module.exports = router;
