const { adminService } = require("../../services");
const { render } = require("../../helpers/response.helper");
const handleError = require("../../helpers/handleError.helper");

/**
 * List registered customers
 * GET /admin/customers
 */
const showCustomers = async (req, res) => {
  try {
    const data = await adminService.getCustomers({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
    });

    return render(res, "adminPages/customers", {
      page: "customers",
      users: data.customers,
      ...data,
    });
  } catch (err) {
    handleError(res, "showCustomers", err);
  }
};

/**
 * Toggle customer block status
 * PATCH /admin/customers/:id/status
 */
const blockCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.toggleCustomerBlock(id);
    req.flash("success", "Status updated successfully");
    return res.redirect("/admin/customers");
  } catch (err) {
    if (err.statusCode) {
      req.flash("error", err.message);
      return res.redirect("/admin/customers");
    }
    handleError(res, "blockCustomer", err);
  }
};

module.exports = {
  showCustomers,
  blockCustomer,
};
