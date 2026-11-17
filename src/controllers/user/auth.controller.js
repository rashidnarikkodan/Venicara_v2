const { authService } = require("../../services");
const handleError = require("../../helpers/handleError.helper");
const apiResponse = require("../../helpers/apiResponse.helper");

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
  try {
    const rawNext = req.query.next || "";
    const safeNext = getSafeRedirectUrl(rawNext);
    res.render("userPages/login", { nextUrl: safeNext !== "/home" ? safeNext : (rawNext === "/home" ? "/home" : "") });
  } catch (err) {
    handleError(res, "showLogin", err);
  }
};

/**
 * Authenticate credentials
 * POST /auth/login
 */
const handleLogin = async (req, res) => {
  try {
    const { email, password, next: nextParam } = req.body;
    const safeRedirect = getSafeRedirectUrl(nextParam);
    const loginRedirect = safeRedirect && safeRedirect !== "/home"
      ? `/auth/login?next=${encodeURIComponent(safeRedirect)}`
      : "/auth/login";

    const userSessionData = await authService.login({ email, password });
    req.session.user = userSessionData;

    req.flash("success", "Logged in successfully");
    return res.redirect(safeRedirect);
  } catch (err) {
    const nextParam = req.body.next;
    const safeRedirect = getSafeRedirectUrl(nextParam);
    const loginRedirect = safeRedirect && safeRedirect !== "/home"
      ? `/auth/login?next=${encodeURIComponent(safeRedirect)}`
      : "/auth/login";

    if (err.statusCode) {
      req.flash("error", err.message);
      return res.redirect(loginRedirect);
    }
    handleError(res, "handleLogin", err);
  }
};

/**
 * Google OAuth success callback
 * GET /auth/google/callback
 */
const handleGoogleAuth = async (req, res) => {
  try {
    const userSessionData = await authService.handleGoogleUser(req.user);
    req.session.user = userSessionData;

    req.flash("success", "Logged in successfully with Google");
    const returnTo = req.session.returnTo;
    delete req.session.returnTo;
    const safeRedirect = getSafeRedirectUrl(returnTo);
    return res.redirect(safeRedirect);
  } catch (err) {
    if (err.statusCode) {
      req.flash("error", err.message);
      return res.redirect("/auth/login");
    }
    handleError(res, "handleGoogleAuth", err);
  }
};

/**
 * Show forgot password form
 * GET /auth/forgot
 */
const showForgot = (req, res) => {
  try {
    return res.render("userPages/forgot");
  } catch (err) {
    handleError(res, "showForgot", err);
  }
};

/**
 * Submit forgot password email
 * POST /auth/forgot
 */
const handleForgot = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = await authService.initiateForgotPassword(email);
    req.session.userId = userId;
    return res.redirect("/auth/forgot/otp");
  } catch (err) {
    if (err.statusCode) {
      req.flash("error", err.message);
      return res.redirect("/auth/forgot");
    }
    handleError(res, "handleForgot", err);
  }
};

/**
 * Show forgot password OTP form
 * GET /auth/forgot/otp
 */
const showForgotOTP = (req, res) => {
  try {
    return res.render("userPages/forgotOTP");
  } catch (err) {
    handleError(res, "showForgotOTP", err);
  }
};

/**
 * Verify forgot password OTP
 * POST /auth/forgot/otp
 */
const handleForgotOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    await authService.verifyForgotOTP(req.session.userId, otp);
    return res.redirect("/auth/forgot/change-password");
  } catch (err) {
    if (err.statusCode) {
      req.flash("error", err.message);
      return res.redirect("/auth/forgot/otp");
    }
    handleError(res, "handleForgotOTP", err);
  }
};

/**
 * Resend forgot password OTP
 * POST /auth/forgot/resend-otp
 */
const resendForgotOTP = async (req, res) => {
  try {
    await authService.resendForgotOTP(req.session.userId);
    return res.json({ success: true, message: "OTP resent successfully" });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    handleError(res, "resendForgotOTP", err);
  }
};

/**
 * Show change password form
 * GET /auth/forgot/change-password
 */
const showChangePass = (req, res) => {
  try {
    return res.render("userPages/changePass");
  } catch (err) {
    handleError(res, "showChangePass", err);
  }
};

/**
 * Submit change password form
 * PATCH /auth/forgot/change-password
 */
const handleChangePass = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    await authService.resetPassword(req.session.userId, password, confirmPassword);
    req.flash("success", "Password updated successfully. Please login.");
    return res.redirect("/auth/login");
  } catch (err) {
    if (err.statusCode) {
      req.flash("error", err.message);
      return res.redirect("/auth/forgot/change-password");
    }
    handleError(res, "handleChangePass", err);
  }
};

/**
 * Show signup registration form
 * GET /auth/signup
 */
const showSignup = (req, res) => {
  try {
    const rawNext = req.query.next || "";
    const safeNext = getSafeRedirectUrl(rawNext);
    res.render("userPages/signup", { nextUrl: safeNext !== "/home" ? safeNext : (rawNext === "/home" ? "/home" : "") });
  } catch (err) {
    handleError(res, "showSignup", err);
  }
};

/**
 * Submit registration details
 * POST /auth/signup
 */
const handleSignup = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    req.session.userId = result.userId;
    req.flash("success", `OTP sent to your email: ${req.body.email}`);
    return res.redirect("/auth/signup/verify-otp");
  } catch (err) {
    if (err.statusCode) {
      req.flash("error", err.message);
      return res.redirect("/auth/signup");
    }
    handleError(res, "handleSignup", err);
  }
};

/**
 * Show signup OTP form
 * GET /auth/signup/verify-otp
 */
const showSignupOTP = async (req, res) => {
  try {
    res.render("userPages/verify-otp");
  } catch (err) {
    handleError(res, "showSignupOTP", err);
  }
};

/**
 * Verify signup OTP
 * POST /auth/signup/verify-otp
 */
const handleSignupOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    await authService.verifySignupOTP(req.session.userId, otp);
    req.flash("success", "Account verified successfully. Please login.");
    return res.redirect("/auth/login");
  } catch (err) {
    if (err.statusCode) {
      req.flash("error", err.message);
      return res.redirect("/auth/signup/verify-otp");
    }
    handleError(res, "handleSignupOTP", err);
  }
};

/**
 * Resend signup OTP
 * POST /auth/signup/resend-otp
 */
const resendOTP = async (req, res) => {
  try {
    await authService.resendSignupOTP(req.session.userId);
    return res.json({ success: true, message: "OTP resent successfully" });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    handleError(res, "resendOTP", err);
  }
};

/**
 * Log out user session
 * POST /auth/logout (or GET /auth/logout)
 */
const handleLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return handleError(res, "handleLogout", err);
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
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
