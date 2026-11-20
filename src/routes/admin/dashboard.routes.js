const express = require("express");
const router = express.Router();
const { dashboardController } = require("../../controllers/admin/index");
const { asyncFunction } = require("../../helpers");
const auth = require("../../middlewares/auth.admin.middleware");

router
  .route("/")
  .get(auth.requireLogin, asyncFunction(dashboardController.showDashboard));

module.exports = router;
