const { render } = require('../../helpers/response.helper');
const User = require('../../models/user.model');

const show = async (req, res) => {
  return render(res, 'userPages/delete');
};

const deleteAc = async (req, res) => {
  await User.findByIdAndUpdate(req.session.user.id, { isDeleted: true });
  req.session.destroy((err) => {
    if (err) throw err;
    res.clearCookie("connect.sid");
    return res.redirect("/");
  });
};

module.exports = {
  show,
  deleteAc,
};
