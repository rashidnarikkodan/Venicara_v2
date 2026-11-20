const express = require("express");
const router = express.Router();
const { customersController } = require("../../controllers/admin/index");
const { asyncFunction } = require("../../helpers");
const auth = require("../../middlewares/auth.admin.middleware");

router.use(auth.requireLogin);

/* ------------------ RESTful Customer Routes ------------------ */
router.get("/", asyncFunction(customersController.showCustomers));
router.patch("/:id/status", asyncFunction(customersController.blockCustomer));

/* ------------------ Backward-Compatible Aliases ------------------ */
router.patch("/status/:id", asyncFunction(customersController.blockCustomer));
router.patch("/:id/toggle", asyncFunction(customersController.blockCustomer));

module.exports = router;
