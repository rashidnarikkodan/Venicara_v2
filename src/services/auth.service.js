const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const User = require("../models/user.model");
const Wallet = require("../models/wallet.model");
const Referrals = require("../models/referrals.model");
const generateOTP = require("../helpers/generateOTP.helper");
const sendEmail = require("../helpers/sendMail.helper");
const generateRefCode = require("../helpers/referralCode.helper");
const { AppError } = require("../helpers/errors.helper");

class AuthService {
  /**
   * Authenticate user by email & password
   */
  async login({ email, password }) {
    if (!email || !password) {
      throw new AppError("Email and Password are required", 400);
    }

    const user = await User.findOne({ email });
    if (!user || user.isDeleted || !user.password) {
      throw new AppError("Incorrect Email or Password", 400);
    }

    if (user.isBlocked) {
      throw new AppError("Access denied. Your account is blocked", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Incorrect Email or Password", 400);
    }

    if (!user.isVerified) {
      throw new AppError("Verify before login (OTP)", 400);
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      isDeleted: user.isDeleted,
      isBlocked: user.isBlocked,
      referralCode: user.referralCode,
    };
  }

  /**
   * Handle Google OAuth user profile sync
   */
  async handleGoogleUser(authUser) {
    const user = await User.findById(authUser._id);
    if (user.isBlocked) {
      throw new AppError("This account is blocked", 403);
    }

    if (user.isDeleted) {
      user.isDeleted = false;
      user.isBlocked = false;
    }
    if (!user.referralCode) {
      user.referralCode = await generateRefCode(user.name);
    }
    if (!user.userId) {
      user.userId = `USR-${nanoid(6).toUpperCase()}`;
    }
    await user.save();

    const wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      await Wallet.create({ userId: user._id });
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      isDeleted: user.isDeleted,
      isBlocked: user.isBlocked,
      referralCode: user.referralCode,
    };
  }

  /**
   * Initiate forgot password flow
   */
  async initiateForgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user || user.isDeleted) {
      throw new AppError("User not found", 404);
    }
    if (user.isBlocked) {
      throw new AppError("This account is blocked", 403);
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendEmail(email, otp, user.name);
    return user._id;
  }

  /**
   * Verify forgot password OTP
   */
  async verifyForgotOTP(userId, otp) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.otp === otp && user.otpExpiry > Date.now()) {
      user.isVerified = true;
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return true;
    }

    throw new AppError("Invalid or expired OTP", 400);
  }

  /**
   * Resend OTP for forgot password
   */
  async resendForgotOTP(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendEmail(user.email, otp, user.name);
    return true;
  }

  /**
   * Reset password after OTP verification
   */
  async resetPassword(userId, password, confirmPassword) {
    if (password !== confirmPassword) {
      throw new AppError("Confirm password does not match", 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    return true;
  }

  /**
   * Register new user account
   */
  async register({ name, email, password, confirmPassword, refCode }) {
    if (password !== confirmPassword) {
      throw new AppError("Confirm password does not match", 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isDeleted) {
        existingUser.isDeleted = false;
        existingUser.isVerified = false;
        existingUser.password = await bcrypt.hash(password, 10);
        await existingUser.save();

        if (existingUser.isBlocked) {
          throw new AppError("Access denied", 403);
        }
      }

      if (existingUser.isVerified) {
        throw new AppError("User already exists", 400);
      } else {
        existingUser.otp = generateOTP();
        existingUser.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        await existingUser.save();
        await sendEmail(email, existingUser.otp, name);
        return { userId: existingUser._id, isNew: false };
      }
    }

    let refUser = null;
    if (refCode && refCode.trim() !== "") {
      refUser = await User.findOne({ referralCode: refCode.trim() });
      if (!refUser) {
        throw new AppError("Invalid referral code", 400);
      }
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    const hashedPass = await bcrypt.hash(password, 10);
    const referralCode = await generateRefCode(name);
    const userId = `USR-${nanoid(6).toUpperCase()}`;

    const newUser = new User({
      name,
      email,
      userId,
      password: hashedPass,
      referralCode,
      referredBy: refUser?._id || null,
      otp,
      otpExpiry,
    });
    await newUser.save();

    await sendEmail(email, otp, name);

    const wallet = await Wallet.findOne({ userId: newUser._id });
    if (!wallet) {
      await Wallet.create({ userId: newUser._id });
    }

    if (refUser) {
      await Referrals.create({
        referrerUserId: refUser._id,
        referredUserId: newUser._id,
        referralCodeUsed: refCode.trim(),
        amount: 200,
        status: "pending",
      });
    }

    return { userId: newUser._id, isNew: true };
  }

  /**
   * Verify signup OTP
   */
  async verifySignupOTP(userId, otp) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.otp === otp && user.otpExpiry > Date.now()) {
      user.isVerified = true;
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return true;
    }

    throw new AppError("Invalid or expired OTP", 400);
  }

  /**
   * Resend signup OTP
   */
  async resendSignupOTP(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendEmail(user.email, otp, user.name);
    return true;
  }
}

module.exports = new AuthService();

