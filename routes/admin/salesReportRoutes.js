const express = require("express");
const router = express.Router();
const { salesReportController } = require("../../controllers/admin/index");
const auth = require("../../middlewares/authAdmin");

router.route("/").get(auth.requireLogin, salesReportController.showSalesReport);
router.post(
  "/export/pdf",
  auth.requireLogin,
  salesReportController.exportSalesPDF
);
router.post(
  "/export/excel",
  auth.requireLogin,
  salesReportController.exportSalesExcel
);

module.exports = router;
