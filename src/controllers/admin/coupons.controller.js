const { adminService } = require("../../services");
const { render } = require("../../helpers/response.helper");

/**
 * List coupons
 * GET /admin/coupons
 */
const showCoupons = async (req, res) => {
  const data = await adminService.getCoupons({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
  });

  return render(res, "adminPages/coupons", {
    page: "coupons",
    ...data,
  });
};

/**
 * Create new coupon
 * POST /admin/coupons
 */
const addCoupon = async (req, res) => {
  await adminService.createCoupon(req.body);
  req.flash("success", "Coupon created successfully");
  return res.redirect("/admin/coupons");
};

/**
 * Delete coupon
 * DELETE /admin/coupons/:id
 */
const deleteCoupon = async (req, res) => {
  await adminService.deleteCoupon(req.params.id);
  req.flash("success", "Coupon removed successfully");
  return res.redirect("/admin/coupons");
};

module.exports = {
  showCoupons,
  addCoupon,
  deleteCoupon,
};
