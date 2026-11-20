const express = require("express");
const router = express.Router();
const passport = require("passport");
const { authController } = require("../../controllers/user/index");
const { asyncHandler } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");

/* ------------------ GOOGLE OAUTH ------------------ */
router.get(
  "/google",
  auth.loggedIn,
  (req, res, next) => {
    if (req.query.next) {
      req.session.returnTo = req.query.next;
    }
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/login" }),
  asyncHandler(authController.handleGoogleAuth)
);

/* ------------------ LOGIN ------------------ */
router
  .route("/login")
  .get(auth.loggedIn, asyncHandler(authController.showLogin))
  .post(auth.loggedIn, asyncHandler(authController.handleLogin));

/* ------------------ FORGOT PASSWORD + OTP ------------------ */
router
  .route("/forgot")
  .get(auth.loggedIn, asyncHandler(authController.showForgot))
  .post(auth.loggedIn, asyncHandler(authController.handleForgot));

router
  .route("/forgot/otp")
  .get(auth.loggedIn, asyncHandler(authController.showForgotOTP))
  .post(auth.loggedIn, asyncHandler(authController.handleForgotOTP));

router.post(
  "/forgot/resend-otp",
  auth.loggedIn,
  asyncHandler(authController.resendForgotOTP)
);

router
  .route("/forgot/change-password")
  .get(auth.loggedIn, asyncHandler(authController.showChangePass))
  .patch(auth.loggedIn, asyncHandler(authController.handleChangePass));

/* ------------------ SIGNUP + OTP ------------------ */
router
  .route("/signup")
  .get(auth.loggedIn, asyncHandler(authController.showSignup))
  .post(auth.loggedIn, asyncHandler(authController.handleSignup));

router
  .route("/signup/verify-otp")
  .get(auth.loggedIn, asyncHandler(authController.showSignupOTP))
  .post(auth.loggedIn, asyncHandler(authController.handleSignupOTP));

router.post(
  "/signup/resend-otp",
  auth.loggedIn,
  asyncHandler(authController.resendOTP)
);

/* ------------------ LOGOUT ------------------ */
router.route("/logout").all(asyncHandler(authController.handleLogout));

module.exports = router;
