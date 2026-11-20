const { render } = require('../../helpers/response.helper');
const handleError = require('../../helpers/handleError.helper');
const User = require('../../models/user.model');

const show = async (req, res) => {
  try {
    return render(res, 'userPages/delete');
  } catch (err) {
    handleError(res, "showDeleteAccount", err);
  }
};

const deleteAc = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.session.user.id, { isDeleted: true });
    req.session.destroy((err) => {
      if (err) {
        return handleError(res, 'handleLogout', err);
      }
      res.clearCookie("connect.sid");
      return res.redirect("/");
    });
  } catch (error) {
    handleError(res, 'deleteAc', error);
  }
};

module.exports = {
  show,
  deleteAc,
};
