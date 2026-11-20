const User = require("../../models/user.model");
const sendEmail = require("../../helpers/sendMail.helper");
const generateOTP = require("../../helpers/generateOTP.helper");
const bcrypt = require("bcrypt");
const processImages = require("../../helpers/imgProcess.helper");
const { render, success } = require("../../helpers/response.helper");
const cloudinary = require("../../config/cloudinary.config");

const showProfile = async (req, res) => {
  const user = await User.findById(req.session.user.id);
  return render(res, "userPages/profile", { user });
};

const showEditProfile = async (req, res) => {
  const user = await User.findById(req.session.user.id);
  return render(res, "userPages/profileEdit", { user });
};

const editProfile = async (req, res) => {
  const { name, email, phone, gender } = req.body;
  const existingUser = await User.findOne({
    $and: [{ _id: { $ne: req.session.user.id } }, { email }],
  });

  if (existingUser) {
    req.flash("error", "Email already exists");
    return res.redirect("/profile");
  }
  
  const user = await User.findById(req.session.user.id);
  let photoUrl = user.photoUrl;
  let public_id = user.public_id;
  if (req.file) {
    const result = await processImages(req.file, "profiles");
    photoUrl = result.url;
    public_id = result.public_id;
  }

  const updateData = {
    name,
    email,
    mobile: phone,
    gender,
    photoUrl,
    public_id,
  };
  if (email !== user.email) delete updateData.email;

  await User.findByIdAndUpdate(req.session.user.id, updateData, {
    new: true,
  });
  if (email !== user.email) {
    const otp = generateOTP();
    await User.findByIdAndUpdate(req.session.user.id, {
      otp,
      otpExpiry: new Date(Date.now() + 50 * 1000),
    });
    sendEmail(email, otp);
    req.flash("success", `New OTP sent to your email: ${email}`);
    return render(res, "userPages/newEmailOTP", { email });
  }

  req.flash("success", "Profile updated successfully");
  return res.redirect("/profile");
};

const deleteProfile = async (req, res) => {
  const { public_id } = req.body;
  const user = await User.findById(req.session.user.id);
  user.photoUrl = '';
  user.public_id = '';
  await user.save();
  if (public_id) await cloudinary.uploader.destroy(public_id);
  return success(res, "Profile picture removed");
};

const handleNewEmailOTP = async (req, res) => {
  const { otp, email } = req.body;
  const user = await User.findById(req.session.user.id);

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    return render(res, "userPages/newEmailOTP", {
      email,
      messages: { error: ["Invalid or expired OTP"] },
    });
  }
  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  user.email = email;
  await user.save();
  req.flash("success", "New email updated");
  return res.redirect("/profile");
};

const resendNewEmailOTP = async (req, res) => {
  const user = await User.findById(req.session.user.id);
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 50 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  sendEmail(req.body.email, otp, user.name);
  return success(res, "OTP resent successfully");
};

const showProfileChangePass = async (req, res) => {
  const user = await User.findById(req.session.user.id);
  return render(res, "userPages/profileChangePass", { user });
};

const handleProfileChangePass = async (req, res) => {
  const { oldPassword, password, confirmPassword } = req.body;

  const user = await User.findById(req.session.user.id);

  if (!user.password) {
    req.flash("error", "Google Authenticated accounts can't change password");
    return res.redirect("/profile/changePassword");
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    req.flash("error", "Incorrect old password");
    return res.redirect("/profile/changePassword");
  }

  if (password !== confirmPassword) {
    req.flash("error", "Confirm password did not match");
    return res.redirect("/profile/changePassword");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(req.session.user.id, {
    password: passwordHash,
  });

  req.flash("success", "Password updated");
  return res.redirect("/profile");
};

const showDeleteAc = async (req, res) => {
  const user = await User.findById(req.session.user.id);
  return render(res, "userPages/deleteAc", { user });
};

const handleDeleteAc = async (req, res) => {
  await User.findByIdAndUpdate(req.session.user.id, { isDeleted: true });
  req.flash("success", "Account deleted");
  return res.redirect("/");
};

module.exports = {
  showProfile,
  showEditProfile,
  editProfile,
  deleteProfile,
  handleNewEmailOTP,
  resendNewEmailOTP,
  showProfileChangePass,
  handleProfileChangePass,
  showDeleteAc,
  handleDeleteAc,
};
