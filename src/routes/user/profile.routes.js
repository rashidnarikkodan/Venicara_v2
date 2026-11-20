const express = require("express");
const router = express.Router();
const { userController } = require("../../controllers/user/index");
const { asyncFunction } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");
const upload = require("../../middlewares/multer.middleware");

router.get("/", asyncFunction(userController.showProfile));

router
  .route("/delete")
  .get(auth.requireLogin, asyncFunction(userController.showDeleteAc))
  .patch(asyncFunction(userController.handleDeleteAc));

router.route("/edit")
  .get(asyncFunction(userController.showEditProfile))
  .patch(
    upload.single("userProfile"),
    auth.requireLogin,
    asyncFunction(userController.editProfile)
  );

router.patch("/api/deleteProfile", asyncFunction(userController.deleteProfile));

router.post("/edit/otp", asyncFunction(userController.handleNewEmailOTP));
router.post("/resendOTP", asyncFunction(userController.resendNewEmailOTP));

router
  .route("/changePassword")
  .get(auth.requireLogin, asyncFunction(userController.showProfileChangePass))
  .patch(auth.requireLogin, asyncFunction(userController.handleProfileChangePass));

// Backward-compatible alias
router
  .route("/changePass")
  .get(auth.requireLogin, asyncFunction(userController.showProfileChangePass))
  .patch(auth.requireLogin, asyncFunction(userController.handleProfileChangePass));

module.exports = router;
