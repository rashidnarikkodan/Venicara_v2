const { authService } = require("../../services");
const { render, success } = require("../../helpers/response.helper");

/**
 * Validates and sanitizes post-login redirect targets.
 * Prevents open redirects, action endpoints (wishlist/cart items), and auth loops.
 */
const getSafeRedirectUrl = (url) => {
  if (!url || typeof url !== "string") return "/home";
  // Must start with single / and not // or /\\ (prevent open redirect / protocol-relative attacks)
  if (!url.startsWith("/") || url.startsWith("//") || url.startsWith("/\\")) return "/home";
  // Must not be an auth, api, or item action route
  if (
    url.startsWith("/auth") ||
    url.includes("/api/") ||
    url.startsWith("/wishlist/items") ||
    url.startsWith("/cart/items") ||
    url.startsWith("/checkout/placeOrder")
  ) {
    return "/home";
  }
  return url;
};

/**
 * Show login form
 * GET /auth/login
 */
const showLogin = (req, res) => {
  const rawNext = req.query.next || "";
  const safeNext = getSafeRedirectUrl(rawNext);
  return render(res, "userPages/login", { nextUrl: safeNext !== "/home" ? safeNext : (rawNext === "/home" ? "/home" : "") });
};

/**
 * Authenticate credentials
 * POST /auth/login
 */
const handleLogin = async (req, res) => {
  const { email, password, next: nextParam } = req.body;
  const safeRedirect = getSafeRedirectUrl(nextParam);

  const userSessionData = await authService.login({ email, password });
  req.session.user = userSessionData;

  req.flash("success", "Logged in successfully");
  return res.redirect(safeRedirect);
};

/**
 * Google OAuth success callback
 * GET /auth/google/callback
 */
const handleGoogleAuth = async (req, res) => {
  const userSessionData = await authService.handleGoogleUser(req.user);
  req.session.user = userSessionData;

  req.flash("success", "Logged in successfully with Google");
  const returnTo = req.session.returnTo;
  delete req.session.returnTo;
  const safeRedirect = getSafeRedirectUrl(returnTo);
  return res.redirect(safeRedirect);
};

/**
 * Show forgot password form
 * GET /auth/forgot
 */
const showForgot = (req, res) => {
  return render(res, "userPages/forgot");
};

/**
 * Submit forgot password email
 * POST /auth/forgot
 */
const handleForgot = async (req, res) => {
  const { email } = req.body;
  const userId = await authService.initiateForgotPassword(email);
  req.session.userId = userId;
  return res.redirect("/auth/forgot/otp");
};

/**
 * Show forgot password OTP form
 * GET /auth/forgot/otp
 */
const showForgotOTP = (req, res) => {
  return render(res, "userPages/forgotOTP");
};

/**
 * Verify forgot password OTP
 * POST /auth/forgot/otp
 */
const handleForgotOTP = async (req, res) => {
  const { otp } = req.body;
  await authService.verifyForgotOTP(req.session.userId, otp);
  return res.redirect("/auth/forgot/change-password");
};

/**
 * Resend forgot password OTP
 * POST /auth/forgot/resend-otp
 */
const resendForgotOTP = async (req, res) => {
  await authService.resendForgotOTP(req.session.userId);
  return success(res, "OTP resent successfully");
};

/**
 * Show change password form
 * GET /auth/forgot/change-password
 */
const showChangePass = (req, res) => {
  return render(res, "userPages/changePass");
};

/**
 * Submit change password form
 * PATCH /auth/forgot/change-password
 */
const handleChangePass = async (req, res) => {
  const { password, confirmPassword } = req.body;
  await authService.resetPassword(req.session.userId, password, confirmPassword);
  req.flash("success", "Password updated successfully. Please login.");
  return res.redirect("/auth/login");
};

/**
 * Show signup registration form
 * GET /auth/signup
 */
const showSignup = (req, res) => {
  const rawNext = req.query.next || "";
  const safeNext = getSafeRedirectUrl(rawNext);
  return render(res, "userPages/signup", { nextUrl: safeNext !== "/home" ? safeNext : (rawNext === "/home" ? "/home" : "") });
};

/**
 * Submit registration details
 * POST /auth/signup
 */
const handleSignup = async (req, res) => {
  const result = await authService.register(req.body);
  req.session.userId = result.userId;
  req.flash("success", `OTP sent to your email: ${req.body.email}`);
  return res.redirect("/auth/signup/verify-otp");
};

/**
 * Show signup OTP form
 * GET /auth/signup/verify-otp
 */
const showSignupOTP = async (req, res) => {
  return render(res, "userPages/verify-otp");
};

/**
 * Verify signup OTP
 * POST /auth/signup/verify-otp
 */
const handleSignupOTP = async (req, res) => {
  const { otp } = req.body;
  await authService.verifySignupOTP(req.session.userId, otp);
  req.flash("success", "Account verified successfully. Please login.");
  return res.redirect("/auth/login");
};

/**
 * Resend signup OTP
 * POST /auth/signup/resend-otp
 */
const resendOTP = async (req, res) => {
  await authService.resendSignupOTP(req.session.userId);
  return success(res, "OTP resent successfully");
};

/**
 * Log out user session
 * POST /auth/logout (or GET /auth/logout)
 */
const handleLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.clearCookie("connect.sid");
    return res.redirect("/auth/login");
  });
};

module.exports = {
  showLogin,
  handleLogin,
  handleGoogleAuth,
  showForgot,
  handleForgot,
  showForgotOTP,
  handleForgotOTP,
  resendForgotOTP,
  showChangePass,
  handleChangePass,
  showSignup,
  handleSignup,
  showSignupOTP,
  handleSignupOTP,
  resendOTP,
  handleLogout,
};
