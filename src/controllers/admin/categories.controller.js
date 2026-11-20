const { adminService } = require("../../services");
const { render, success } = require("../../helpers/response.helper");
const handleError = require("../../helpers/handleError.helper");

/**
 * List categories
 * GET /admin/categories
 */
const showCategory = async (req, res) => {
  try {
    const data = await adminService.getCategories({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
    });

    return render(res, "adminPages/categories", {
      page: "categories",
      ...data,
    });
  } catch (err) {
    handleError(res, "showCategory", err);
  }
};

/**
 * Delete category
 * DELETE /admin/categories/:id
 */
const deleteCategory = async (req, res) => {
  try {
    await adminService.deleteCategory(req.params.id);
    req.flash("success", "Category deleted successfully");
    return res.redirect("/admin/categories");
  } catch (err) {
    handleError(res, "deleteCategory", err);
  }
};

/**
 * Show create category form
 * GET /admin/categories/new
 */
const showAddCategory = (req, res) => {
  try {
    return render(res, "adminPages/addCategory", { page: "categories" });
  } catch (err) {
    handleError(res, "showAddCategory", err);
  }
};

/**
 * Create new category
 * POST /admin/categories
 */
const addCategory = async (req, res) => {
  try {
    await adminService.createCategory(req.body);
    req.flash("success", "Category added successfully");
    return res.redirect("/admin/categories");
  } catch (err) {
    if (err.statusCode) {
      req.flash("error", err.message);
      return res.redirect("/admin/categories/add");
    }
    handleError(res, "addCategory", err);
  }
};

/**
 * Show edit category form
 * GET /admin/categories/:id/edit
 */
const showEditCategory = async (req, res) => {
  try {
    const Category = require("../../models/category.model");
    const category = await Category.findById(req.params.id).lean();
    if (!category) {
      req.flash("error", "Category not found");
      return res.redirect("/admin/categories");
    }
    return render(res, "adminPages/editCategory", { category, page: "categories" });
  } catch (err) {
    handleError(res, "showEditCategory", err);
  }
};

/**
 * Update category
 * PUT /admin/categories/:id
 */
const editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.updateCategory(id, req.body);
    req.flash("success", "Category updated successfully");
    return res.redirect("/admin/categories");
  } catch (err) {
    if (err.statusCode) {
      req.flash("error", err.message);
      return res.redirect(`/admin/categories/edit/${req.params.id}`);
    }
    handleError(res, "editCategory", err);
  }
};

/**
 * Toggle category active status
 * PATCH /admin/categories/:id/status
 */
const activeCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await adminService.toggleCategoryStatus(id);
    return success(res, "Category status updated", { status: category.isActive });
  } catch (err) {
    handleError(res, "activeCategory", err);
  }
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
