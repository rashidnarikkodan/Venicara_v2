const express = require("express");
const router = express.Router();
const { categoriesController } = require("../../controllers/admin/index");
const auth = require("../../middlewares/auth.admin.middleware");

router.use(auth.requireLogin);

/* ------------------ RESTful Category Routes ------------------ */
router
  .route("/")
  .get(categoriesController.showCategory)
  .post(categoriesController.addCategory);

router.get("/new", categoriesController.showAddCategory);

router
  .route("/:id")
  .put(categoriesController.editCategory)
  .delete(categoriesController.deleteCategory);

router.get("/:id/edit", categoriesController.showEditCategory);
router.patch("/:id/status", categoriesController.activeCategory);

/* ------------------ Backward-Compatible Aliases ------------------ */
router
  .route("/add")
  .get(categoriesController.showAddCategory)
  .post(categoriesController.addCategory);

router
  .route("/edit/:id")
  .get(categoriesController.showEditCategory)
  .put(categoriesController.editCategory);

router.patch("/active/:id", categoriesController.activeCategory);
router.patch("/:id/toggle", categoriesController.activeCategory);
router.patch("/:id", categoriesController.deleteCategory);

module.exports = router;
