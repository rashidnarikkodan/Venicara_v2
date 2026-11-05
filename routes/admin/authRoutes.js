const express = require("express");
const router = express.Router();
const { authController } = require("../../controllers/admin/index");
const auth = require("../../middlewares/authAdmin");

router.get("/", auth.isLoggedIn, authController.handleEntry);
router
  .route("/login")
  .get(auth.isLoggedIn, authController.showLogin)
  .post(authController.handleLogin);
router.get("/logout", authController.handleLogout);

module.exports = router;
