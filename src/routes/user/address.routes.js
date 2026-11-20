const express = require("express");
const router = express.Router();
const { addressController } = require("../../controllers/user/index");
const { asyncHandler } = require("../../helpers");
const auth = require("../../middlewares/auth.user.middleware");

router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Address Routes ------------------ */

// List addresses & create address
router
  .route("/")
  .get(asyncHandler(addressController.showAddress))
  .post(asyncHandler(addressController.handleNewAddress));

// New address form
router.get("/new", asyncHandler(addressController.showNewAddress));

// Edit address form
router.get("/:id/edit", asyncHandler(addressController.showEditAddress));

// Update address & Delete address
router
  .route("/:id")
  .put(asyncHandler(addressController.handleEditAddress))
  .delete(asyncHandler(addressController.deleteAddress));

// Set default address
router
  .route("/:id/default")
  .patch(asyncHandler(addressController.setDefaultAddress))
  .get(asyncHandler(addressController.setDefaultAddress)); // For HTML link clicks

/* ------------------ Backward-Compatible Aliases ------------------ */
router.post("/new", asyncHandler(addressController.handleNewAddress));
router.get("/edit/:id", asyncHandler(addressController.showEditAddress));
router.put("/edit/:id", asyncHandler(addressController.handleEditAddress));
router.delete("/delete/:id", asyncHandler(addressController.deleteAddress));
router.get("/default/:id", asyncHandler(addressController.setDefaultAddress));

module.exports = router;
