const { adminService } = require("../../services");
const { render, success } = require("../../helpers/response.helper");

/**
 * List categories
 * GET /admin/categories
 */
const showCategory = async (req, res) => {
  const data = await adminService.getCategories({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
  });

  return render(res, "adminPages/categories", {
    page: "categories",
    ...data,
  });
};

/**
 * Delete category
 * DELETE /admin/categories/:id
 */
const deleteCategory = async (req, res) => {
  await adminService.deleteCategory(req.params.id);
  req.flash("success", "Category deleted successfully");
  return res.redirect("/admin/categories");
};

/**
 * Show create category form
 * GET /admin/categories/new
 */
const showAddCategory = (req, res) => {
  return render(res, "adminPages/addCategory", { page: "categories" });
};

/**
 * Create new category
 * POST /admin/categories
 */
const addCategory = async (req, res) => {
  await adminService.createCategory(req.body);
  req.flash("success", "Category added successfully");
  return res.redirect("/admin/categories");
};

/**
 * Show edit category form
 * GET /admin/categories/:id/edit
 */
const showEditCategory = async (req, res) => {
  const Category = require("../../models/category.model");
  const category = await Category.findById(req.params.id).lean();
  if (!category) {
    req.flash("error", "Category not found");
    return res.redirect("/admin/categories");
  }
  return render(res, "adminPages/editCategory", { category, page: "categories" });
};

/**
 * Update category
 * PUT /admin/categories/:id
 */
const editCategory = async (req, res) => {
  const { id } = req.params;
  await adminService.updateCategory(id, req.body);
  req.flash("success", "Category updated successfully");
  return res.redirect("/admin/categories");
};

/**
 * Toggle category active status
 * PATCH /admin/categories/:id/status
 */
const activeCategory = async (req, res) => {
  const { id } = req.params;
  const category = await adminService.toggleCategoryStatus(id);
  return success(res, "Category status updated", { status: category.isActive });
};

module.exports = {
  showCategory,
  deleteCategory,
  showAddCategory,
  addCategory,
  showEditCategory,
  editCategory,
  activeCategory,
};
