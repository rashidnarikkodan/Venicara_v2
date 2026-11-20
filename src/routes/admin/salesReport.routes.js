const express = require("express");
const router = express.Router();
const { salesReportController } = require("../../controllers/admin/index");
const { asyncFunction } = require("../../helpers");
const auth = require("../../middlewares/auth.admin.middleware");

router.route("/").get(auth.requireLogin, asyncFunction(salesReportController.showSalesReport));
router.post(
  "/export/pdf",
  auth.requireLogin,
  asyncFunction(salesReportController.exportSalesPDF || salesReportController.downloadPDF)
);
router.post(
  "/export/excel",
  auth.requireLogin,
  asyncFunction(salesReportController.exportSalesExcel || salesReportController.downloadExcel)
);

module.exports = router;
