const express = require("express");
const router = express.Router();
const { productsController } = require("../../controllers/admin/index");
const { asyncFunction } = require("../../helpers");
const auth = require("../../middlewares/auth.admin.middleware");
const upload = require("../../middlewares/multer.middleware");

router
  .route("/")
  .get(auth.requireLogin, asyncFunction(productsController.showProducts));
router
  .route("/add")
  .get(auth.requireLogin, asyncFunction(productsController.showAddProduct))
  .post(upload.array("images", 10), asyncFunction(productsController.addProduct));
router.delete("/:id", asyncFunction(productsController.deleteProduct));
router
  .route("/edit/:id")
  .get(auth.requireLogin, asyncFunction(productsController.showEditProduct))
  .put(upload.array("images", 10), asyncFunction(productsController.editProduct));
router.patch("/edit/removeImg/:id", asyncFunction(productsController.removeImage));
router.patch("/status/:id", asyncFunction(productsController.toggleProductActive));

module.exports = router;
