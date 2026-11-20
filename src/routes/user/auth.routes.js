const express = require("express");
const router = express.Router();
const passport = require("passport");
const { authController } = require("../../controllers/user/index");
const { asyncFunction } = require("../../helpers");
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
  asyncFunction(authController.handleGoogleAuth)
);

/* ------------------ LOGIN ------------------ */
router
  .route("/login")
  .get(auth.loggedIn, asyncFunction(authController.showLogin))
  .post(auth.loggedIn, asyncFunction(authController.handleLogin));

/* ------------------ FORGOT PASSWORD + OTP ------------------ */
router
  .route("/forgot")
  .get(auth.loggedIn, asyncFunction(authController.showForgot))
  .post(auth.loggedIn, asyncFunction(authController.handleForgot));

router
  .route("/forgot/otp")
  .get(auth.loggedIn, asyncFunction(authController.showForgotOTP))
  .post(auth.loggedIn, asyncFunction(authController.handleForgotOTP));

router.post(
  "/forgot/resend-otp",
  auth.loggedIn,
  asyncFunction(authController.resendForgotOTP)
);

router
  .route("/forgot/change-password")
  .get(auth.loggedIn, asyncFunction(authController.showChangePass))
  .patch(auth.loggedIn, asyncFunction(authController.handleChangePass));

/* ------------------ SIGNUP + OTP ------------------ */
router
  .route("/signup")
  .get(auth.loggedIn, asyncFunction(authController.showSignup))
  .post(auth.loggedIn, asyncFunction(authController.handleSignup));

router
  .route("/signup/verify-otp")
  .get(auth.loggedIn, asyncFunction(authController.showSignupOTP))
  .post(auth.loggedIn, asyncFunction(authController.handleSignupOTP));

router.post(
  "/signup/resend-otp",
  auth.loggedIn,
  asyncFunction(authController.resendOTP)
);

/* ------------------ LOGOUT ------------------ */
router.route("/logout").all(asyncFunction(authController.handleLogout));

module.exports = router;
