const express = require("express");
const router = express.Router();
const { productsController } = require("../../controllers/admin/index");
const auth = require("../../middlewares/authAdmin");
const upload = require("../../middlewares/multer");

router
  .route("/")
  .get(auth.requireLogin, productsController.showProducts);
router
  .route("/add")
  .get(auth.requireLogin, productsController.showAddProduct)
  .post(upload.array("images", 10), productsController.addProduct);
router.delete("/:id", productsController.deleteProduct);
router
  .route("/edit/:id")
  .get(auth.requireLogin, productsController.showEditProduct)
  .put(upload.array("images", 10), productsController.editProduct);
router.patch("/edit/removeImg/:id", productsController.removeImage);
router.patch("/status/:id", productsController.toggleProductActive);

module.exports = router;
