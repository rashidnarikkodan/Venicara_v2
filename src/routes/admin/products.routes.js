const express = require("express");
const router = express.Router();
const { productsController } = require("../../controllers/admin/index");
const { asyncHandler } = require("../../helpers");
const auth = require("../../middlewares/auth.admin.middleware");
const upload = require("../../middlewares/multer.middleware");

router
  .route("/")
  .get(auth.requireLogin, asyncHandler(productsController.showProducts));
router
  .route("/add")
  .get(auth.requireLogin, asyncHandler(productsController.showAddProduct))
  .post(upload.array("images", 10), asyncHandler(productsController.addProduct));
router.delete("/:id", asyncHandler(productsController.deleteProduct));
router
  .route("/edit/:id")
  .get(auth.requireLogin, asyncHandler(productsController.showEditProduct))
  .put(upload.array("images", 10), asyncHandler(productsController.editProduct));
router.patch("/edit/removeImg/:id", asyncHandler(productsController.removeImage));
router.patch("/status/:id", asyncHandler(productsController.toggleProductActive));

module.exports = router;
