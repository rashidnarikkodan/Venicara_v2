const { addressService } = require("../../services");
const apiResponse = require("../../helpers/apiResponse.helper");
const handleError = require("../../helpers/handleError.helper");

/**
 * List all user addresses
 * GET /address
 */
const showAddress = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { addresses, user } = await addressService.getUserAddresses(userId);
    res.render("userPages/address", { addresses, user });
  } catch (err) {
    handleError(res, "showAddress", err);
  }
};

/**
 * Show form to create new address
 * GET /address/new
 */
const showNewAddress = async (req, res) => {
  try {
    res.render("userPages/newAddress");
  } catch (err) {
    handleError(res, "showNewAddress", err);
  }
};

/**
 * Create new address
 * POST /address
 */
const handleNewAddress = async (req, res) => {
  try {
    const userId = req.session.user.id;
    await addressService.createAddress(userId, req.body);
    req.flash("success", "Address added successfully");
    res.redirect("/address");
  } catch (err) {
    if (err.statusCode) {
      req.flash("error", err.message);
      return res.redirect("/address/new");
    }
    handleError(res, "handleNewAddress", err);
  }
};

/**
 * Show form to edit address
 * GET /address/:id/edit
 */
const showEditAddress = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { id } = req.params;
    const address = await addressService.getAddressById(userId, id);
    res.render("userPages/editAddress", { address });
  } catch (err) {
    if (err.statusCode) {
      req.flash("error", err.message);
      return res.redirect("/address");
    }
    handleError(res, "showEditAddress", err);
  }
};

/**
 * Update existing address
 * PUT /address/:id
 */
const handleEditAddress = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { id } = req.params;
    await addressService.updateAddress(userId, id, req.body);
    req.flash("success", "Address updated successfully");
    res.redirect("/address");
  } catch (err) {
    if (err.statusCode) {
      req.flash("error", err.message);
      return res.redirect(`/address/edit/${req.params.id}`);
    }
    handleError(res, "handleEditAddress", err);
  }
};

/**
 * Delete address
 * DELETE /address/:id
 */
const deleteAddress = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { id } = req.params;
    await addressService.deleteAddress(userId, id);
    req.flash("success", "Address deleted successfully");
    res.redirect("/address");
  } catch (err) {
    if (err.statusCode) {
      req.flash("error", err.message);
      return res.redirect("/address");
    }
    handleError(res, "deleteAddress", err);
  }
};

/**
 * Set address as default
 * PATCH /address/:id/default
 */
const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { id } = req.params;
    await addressService.setDefaultAddress(userId, id);
    req.flash("success", "Default address updated");
    res.redirect("/address");
  } catch (err) {
    if (err.statusCode) {
      req.flash("error", err.message);
      return res.redirect("/address");
    }
    handleError(res, "setDefaultAddress", err);
  }
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
