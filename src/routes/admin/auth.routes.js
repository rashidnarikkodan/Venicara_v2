const express = require("express");
const router = express.Router();
const { authController } = require("../../controllers/admin/index");
const { asyncFunction } = require("../../helpers");
const auth = require("../../middlewares/auth.admin.middleware");

router.get("/", auth.isLoggedIn, asyncFunction(authController.handleEntry));
router
  .route("/login")
  .get(auth.isLoggedIn, asyncFunction(authController.showLogin))
  .post(asyncFunction(authController.handleLogin));
router.get("/logout", asyncFunction(authController.handleLogout));

module.exports = router;
