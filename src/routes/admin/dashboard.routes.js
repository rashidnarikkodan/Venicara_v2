const express = require("express");
const router = express.Router();
const { dashboardController } = require("../../controllers/admin/index");
const auth = require("../../middlewares/auth.admin.middleware");

router
  .route("/")
  .get(auth.requireLogin, dashboardController.showDashboard);

module.exports = router;
