const { adminService } = require("../../services");
const { render } = require("../../helpers/response.helper");

/**
 * List registered customers
 * GET /admin/customers
 */
const showCustomers = async (req, res) => {
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
};

/**
 * Toggle customer block status
 * PATCH /admin/customers/:id/status
 */
const blockCustomer = async (req, res) => {
  const { id } = req.params;
  await adminService.toggleCustomerBlock(id);
  req.flash("success", "Status updated successfully");
  return res.redirect("/admin/customers");
};

module.exports = {
  showCustomers,
  blockCustomer,
};
