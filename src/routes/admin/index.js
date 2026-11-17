const router = require("express").Router();
const auth = require("../../middlewares/auth.admin.middleware");

// Public / auth routes
router.use("/auth", require("./auth.routes"));
router.use("/", require("./auth.routes"));

// Protected admin routes
router.use(auth.requireLogin);
router.use("/dashboard", require("./dashboard.routes"));
router.use("/orders", require("./order.routes"));
router.use("/order", require("./order.routes"));
router.use("/products", require("./products.routes"));
router.use("/salesReport", require("./salesReport.routes"));
router.use("/customers", require("./customers.routes"));
router.use("/coupons", require("./coupon.routes"));
router.use("/categories", require("./categories.routes"));
router.use("/referrals", require("./referrals.routes"));

module.exports = router;
