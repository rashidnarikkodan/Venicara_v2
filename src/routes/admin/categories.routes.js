const express = require("express");
const router = express.Router();
const { categoriesController } = require("../../controllers/admin/index");
const { asyncFunction } = require("../../helpers");
const auth = require("../../middlewares/auth.admin.middleware");

router.use(auth.requireLogin);

/* ------------------ RESTful Category Routes ------------------ */
router
  .route("/")
  .get(asyncFunction(categoriesController.showCategory))
  .post(asyncFunction(categoriesController.addCategory));

router.get("/new", asyncFunction(categoriesController.showAddCategory));

router
  .route("/:id")
  .put(asyncFunction(categoriesController.editCategory))
  .delete(asyncFunction(categoriesController.deleteCategory));

router.get("/:id/edit", asyncFunction(categoriesController.showEditCategory));
router.patch("/:id/status", asyncFunction(categoriesController.activeCategory));

/* ------------------ Backward-Compatible Aliases ------------------ */
router
  .route("/add")
  .get(asyncFunction(categoriesController.showAddCategory))
  .post(asyncFunction(categoriesController.addCategory));

router
  .route("/edit/:id")
  .get(asyncFunction(categoriesController.showEditCategory))
  .put(asyncFunction(categoriesController.editCategory));

router.patch("/active/:id", asyncFunction(categoriesController.activeCategory));
router.patch("/:id/toggle", asyncFunction(categoriesController.activeCategory));
router.patch("/:id", asyncFunction(categoriesController.deleteCategory));

module.exports = router;
