const { adminService } = require("../../services");
const handleError = require("../../helpers/handleError.helper");
const apiResponse = require("../../helpers/apiResponse.helper");

/**
 * List coupons
 * GET /admin/coupons
 */
const showCoupons = async (req, res) => {
  try {
    const data = await adminService.getCoupons({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
    });

    return res.render("adminPages/coupons", {
      page: "coupons",
      ...data,
    });
  } catch (err) {
    handleError(res, "showCoupons", err);
  }
};

/**
 * Create new coupon
 * POST /admin/coupons
 */
const addCoupon = async (req, res) => {
  try {
    await adminService.createCoupon(req.body);
    req.flash("success", "Coupon created successfully");
    return res.redirect("/admin/coupons");
  } catch (err) {
    if (err.statusCode) {
      req.flash("error", err.message);
      return res.redirect("/admin/coupons");
    }
    handleError(res, "addCoupon", err);
  }
};

/**
 * Delete coupon
 * DELETE /admin/coupons/:id
 */
const deleteCoupon = async (req, res) => {
  try {
    await adminService.deleteCoupon(req.params.id);
    req.flash("success", "Coupon removed successfully");
    return res.redirect("/admin/coupons");
  } catch (err) {
    handleError(res, "deleteCoupon", err);
  }
};

module.exports = {
  showCoupons,
  addCoupon,
  deleteCoupon,
};
