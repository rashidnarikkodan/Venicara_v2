const express = require("express");
const router = express.Router();
const { authController } = require("../../controllers/admin/index");
const { asyncHandler } = require("../../helpers");
const auth = require("../../middlewares/auth.admin.middleware");

router.get("/", auth.isLoggedIn, asyncHandler(authController.handleEntry));
router
  .route("/login")
  .get(auth.isLoggedIn, asyncHandler(authController.showLogin))
  .post(asyncHandler(authController.handleLogin));
router.get("/logout", asyncHandler(authController.handleLogout));

module.exports = router;
