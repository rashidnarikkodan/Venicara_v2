const express = require("express");
const router = express.Router();
const { customersController } = require("../../controllers/admin/index");
const auth = require("../../middlewares/auth.admin.middleware");

router.use(auth.requireLogin);

/* ------------------ RESTful Customer Routes ------------------ */
router.get("/", customersController.showCustomers);
router.patch("/:id/status", customersController.blockCustomer);

/* ------------------ Backward-Compatible Aliases ------------------ */
router.patch("/status/:id", customersController.blockCustomer);
router.patch("/:id/toggle", customersController.blockCustomer);

module.exports = router;
