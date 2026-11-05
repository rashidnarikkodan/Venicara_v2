const express = require("express");
const router = express.Router();
const { customersController } = require("../../controllers/admin/index");
const auth = require("../../middlewares/authAdmin");

router
  .route("/")
  .get(auth.requireLogin, customersController.showCustomers);
router.patch("/status/:id", customersController.blockCustomer);
router.patch("/:id/toggle", customersController.blockCustomer);

module.exports = router;
