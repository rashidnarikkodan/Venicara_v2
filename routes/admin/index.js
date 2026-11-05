const router = require("express").Router();
const auth = require("../../middlewares/authAdmin");

// Public / auth routes
router.use("/auth", require("./authRoutes"));
router.use("/", require("./authRoutes"));

// Protected admin routes
router.use(auth.requireLogin);
router.use("/dashboard", require("./dashboardRoutes"));
router.use("/orders", require("./orderRoutes"));
router.use("/order", require("./orderRoutes"));
router.use("/products", require("./productsRoutes"));
router.use("/salesReport", require("./salesReportRoutes"));
router.use("/customers", require("./customersRoutes"));
router.use("/coupons", require("./couponRoutes"));
router.use("/categories", require("./categoriesRoutes"));
router.use("/referrals", require("./referralsRoutes"));

module.exports = router;
