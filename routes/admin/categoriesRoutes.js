const express = require("express");
const router = express.Router();
const { categoriesController } = require("../../controllers/admin/index");
const auth = require("../../middlewares/authAdmin");

router
  .route("/")
  .get(auth.requireLogin, categoriesController.showCategory);
router
  .route("/add")
  .get(auth.requireLogin, categoriesController.showAddCategory)
  .post(categoriesController.addCategory);
router
  .route("/edit/:id")
  .get(auth.requireLogin, categoriesController.showEditCategory)
  .put(categoriesController.editCategory);
router.patch("/active/:id", categoriesController.activeCategory);
router.patch("/:id/toggle", categoriesController.activeCategory);
router.patch("/:id", categoriesController.deleteCategory);

module.exports = router;

