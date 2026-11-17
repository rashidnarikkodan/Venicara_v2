const express = require("express");
const router = express.Router();
const { addressController } = require("../../controllers/user/index");
const auth = require("../../middlewares/auth.user.middleware");

router.use(auth.requireLogin, auth.isUserBlocked);

/* ------------------ RESTful Address Routes ------------------ */

// List addresses & create address
router
  .route("/")
  .get(addressController.showAddress)
  .post(addressController.handleNewAddress);

// New address form
router.get("/new", addressController.showNewAddress);

// Edit address form
router.get("/:id/edit", addressController.showEditAddress);

// Update address & Delete address
router
  .route("/:id")
  .put(addressController.handleEditAddress)
  .delete(addressController.deleteAddress);

// Set default address
router
  .route("/:id/default")
  .patch(addressController.setDefaultAddress)
  .get(addressController.setDefaultAddress); // For HTML link clicks

/* ------------------ Backward-Compatible Aliases ------------------ */
router.post("/new", addressController.handleNewAddress);
router.get("/edit/:id", addressController.showEditAddress);
router.put("/edit/:id", addressController.handleEditAddress);
router.delete("/delete/:id", addressController.deleteAddress);
router.get("/default/:id", addressController.setDefaultAddress);

module.exports = router;
