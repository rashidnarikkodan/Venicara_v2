const express = require("express");
const router = express.Router();
const { customersController } = require("../../controllers/admin/index");
const { asyncHandler } = require("../../helpers");
const auth = require("../../middlewares/auth.admin.middleware");

router.use(auth.requireLogin);

/* ------------------ RESTful Customer Routes ------------------ */
router.get("/", asyncHandler(customersController.showCustomers));
router.patch("/:id/status", asyncHandler(customersController.blockCustomer));

/* ------------------ Backward-Compatible Aliases ------------------ */
router.patch("/status/:id", asyncHandler(customersController.blockCustomer));
router.patch("/:id/toggle", asyncHandler(customersController.blockCustomer));

module.exports = router;
