const express = require("express");
const router = express.Router();
const { dashboardController } = require("../../controllers/admin/index");
const auth = require("../../middlewares/authAdmin");

router
  .route("/")
  .get(auth.requireLogin, dashboardController.showDashboard);

module.exports = router;
