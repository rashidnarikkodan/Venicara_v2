const { addressService } = require("../../services");
const { render } = require("../../helpers/response.helper");

/**
 * List all user addresses
 * GET /address
 */
const showAddress = async (req, res) => {
  const userId = req.session.user.id;
  const { addresses, user } = await addressService.getUserAddresses(userId);
  return render(res, "userPages/address", { addresses, user });
};

/**
 * Show form to create new address
 * GET /address/new
 */
const showNewAddress = async (req, res) => {
  return render(res, "userPages/newAddress");
};

/**
 * Create new address
 * POST /address
 */
const handleNewAddress = async (req, res) => {
  const userId = req.session.user.id;
  await addressService.createAddress(userId, req.body);
  req.flash("success", "Address added successfully");
  return res.redirect("/address");
};

/**
 * Show form to edit address
 * GET /address/:id/edit
 */
const showEditAddress = async (req, res) => {
  const userId = req.session.user.id;
  const { id } = req.params;
  const address = await addressService.getAddressById(userId, id);
  return render(res, "userPages/editAddress", { address });
};

/**
 * Update existing address
 * PUT /address/:id
 */
const handleEditAddress = async (req, res) => {
  const userId = req.session.user.id;
  const { id } = req.params;
  await addressService.updateAddress(userId, id, req.body);
  req.flash("success", "Address updated successfully");
  return res.redirect("/address");
};

/**
 * Delete address
 * DELETE /address/:id
 */
const deleteAddress = async (req, res) => {
  const userId = req.session.user.id;
  const { id } = req.params;
  await addressService.deleteAddress(userId, id);
  req.flash("success", "Address deleted successfully");
  return res.redirect("/address");
};

/**
 * Set address as default
 * PATCH /address/:id/default
 */
const setDefaultAddress = async (req, res) => {
  const userId = req.session.user.id;
  const { id } = req.params;
  await addressService.setDefaultAddress(userId, id);
  req.flash("success", "Default address updated");
  return res.redirect("/address");
};

module.exports = {
  showAddress,
  showNewAddress,
  handleNewAddress,
  showEditAddress,
  handleEditAddress,
  deleteAddress,
  setDefaultAddress,
};
