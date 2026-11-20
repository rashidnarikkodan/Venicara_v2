const express = require("express");
const router = express.Router();
const { categoriesController } = require("../../controllers/admin/index");
const { asyncHandler } = require("../../helpers");
const auth = require("../../middlewares/auth.admin.middleware");

router.use(auth.requireLogin);

/* ------------------ RESTful Category Routes ------------------ */
router
  .route("/")
  .get(asyncHandler(categoriesController.showCategory))
  .post(asyncHandler(categoriesController.addCategory));

router.get("/new", asyncHandler(categoriesController.showAddCategory));

router
  .route("/:id")
  .put(asyncHandler(categoriesController.editCategory))
  .delete(asyncHandler(categoriesController.deleteCategory));

router.get("/:id/edit", asyncHandler(categoriesController.showEditCategory));
router.patch("/:id/status", asyncHandler(categoriesController.activeCategory));

/* ------------------ Backward-Compatible Aliases ------------------ */
router
  .route("/add")
  .get(asyncHandler(categoriesController.showAddCategory))
  .post(asyncHandler(categoriesController.addCategory));

router
  .route("/edit/:id")
  .get(asyncHandler(categoriesController.showEditCategory))
  .put(asyncHandler(categoriesController.editCategory));

router.patch("/active/:id", asyncHandler(categoriesController.activeCategory));
router.patch("/:id/toggle", asyncHandler(categoriesController.activeCategory));
router.patch("/:id", asyncHandler(categoriesController.deleteCategory));

module.exports = router;
