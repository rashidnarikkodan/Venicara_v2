const express = require("express");
const router = express.Router();
const { addressController } = require("../../controllers/user/index");
const { asyncFunction } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");

router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Address Routes ------------------ */

// List addresses & create address
router
  .route("/")
  .get(asyncFunction(addressController.showAddress))
  .post(asyncFunction(addressController.handleNewAddress));

// New address form
router.get("/new", asyncFunction(addressController.showNewAddress));

// Edit address form
router.get("/:id/edit", asyncFunction(addressController.showEditAddress));

// Update address & Delete address
router
  .route("/:id")
  .put(asyncFunction(addressController.handleEditAddress))
  .delete(asyncFunction(addressController.deleteAddress));

// Set default address
router
  .route("/:id/default")
  .patch(asyncFunction(addressController.setDefaultAddress))
  .get(asyncFunction(addressController.setDefaultAddress)); // For HTML link clicks

/* ------------------ Backward-Compatible Aliases ------------------ */
router.post("/new", asyncFunction(addressController.handleNewAddress));
router.get("/edit/:id", asyncFunction(addressController.showEditAddress));
router.put("/edit/:id", asyncFunction(addressController.handleEditAddress));
router.delete("/delete/:id", asyncFunction(addressController.deleteAddress));
router.get("/default/:id", asyncFunction(addressController.setDefaultAddress));

module.exports = router;
