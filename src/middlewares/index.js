const authUser = require('./auth.user.middleware');
const authAdmin = require('./auth.admin.middleware');
const session = require('./session.middleware');
const multer = require('./multer.middleware');
const flash = require('./flash.middleware');

module.exports = {
  authUser,
  authAdmin,
  session,
  multer,
  flash,
};

