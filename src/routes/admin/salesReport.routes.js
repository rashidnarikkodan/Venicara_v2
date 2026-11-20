const express = require("express");
const router = express.Router();
const { salesReportController } = require("../../controllers/admin/index");
const { asyncHandler } = require("../../helpers");
const auth = require("../../middlewares/auth.admin.middleware");

router.route("/").get(auth.requireLogin, asyncHandler(salesReportController.showSalesReport));
router.post(
  "/export/pdf",
  auth.requireLogin,
  asyncHandler(salesReportController.exportSalesPDF || salesReportController.downloadPDF)
);
router.post(
  "/export/excel",
  auth.requireLogin,
  asyncHandler(salesReportController.exportSalesExcel || salesReportController.downloadExcel)
);

module.exports = router;
