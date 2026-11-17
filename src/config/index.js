const connectDB = require('./db.config');
const cloudinary = require('./cloudinary.config');
const mailer = require('./mailer.config');
const razorpay = require('./payment.config');

module.exports = {
  connectDB,
  cloudinary,
  mailer,
  razorpay,
};

