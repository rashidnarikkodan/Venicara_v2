const express = require("express");
const router = express.Router();
const { userController } = require("../../controllers/user/index");
const { asyncHandler } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");
const upload = require("../../middlewares/multer.middleware");

router.get("/", asyncHandler(userController.showProfile));

router
  .route("/delete")
  .get(auth.requireLogin, asyncHandler(userController.showDeleteAc))
  .patch(asyncHandler(userController.handleDeleteAc));

router.route("/edit")
  .get(asyncHandler(userController.showEditProfile))
  .patch(
    upload.single("userProfile"),
    auth.requireLogin,
    asyncHandler(userController.editProfile)
  );

router.patch("/api/deleteProfile", asyncHandler(userController.deleteProfile));

router.post("/edit/otp", asyncHandler(userController.handleNewEmailOTP));
router.post("/resendOTP", asyncHandler(userController.resendNewEmailOTP));

router
  .route("/changePassword")
  .get(auth.requireLogin, asyncHandler(userController.showProfileChangePass))
  .patch(auth.requireLogin, asyncHandler(userController.handleProfileChangePass));

// Backward-compatible alias
router
  .route("/changePass")
  .get(auth.requireLogin, asyncHandler(userController.showProfileChangePass))
  .patch(auth.requireLogin, asyncHandler(userController.handleProfileChangePass));

module.exports = router;
