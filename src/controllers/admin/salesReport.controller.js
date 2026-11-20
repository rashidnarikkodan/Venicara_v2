const { render } = require("../../helpers/response.helper");
const Order = require("../../models/order.model");
const generatePDF = require("../../helpers/salesPdf.helper");
const generateSalesReportExcel = require("../../helpers/salesExcel.helper");

const showSalesReport = async (req, res) => {
  let filter = req.query.filter || "daily";
  let startDate, endDate;
  const now = new Date();
  const today = new Date().toISOString().split("T")[0];

  // decide filtration
  switch (filter) {
    case "daily":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case "weekly":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      endDate = new Date();
      break;
    case "monthly":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case "yearly":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    case "custom":
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);
      if (!req.query.startDate || !req.query.endDate) {
        req.flash("error", "Please select both start and end dates for custom filter.");
        return res.redirect(`/admin/salesReport?filter=daily`);
      }
      endDate.setHours(23, 59, 59, 999);
      break;
  }

  const delivered = {
    updatedAt: { $gte: startDate, $lte: endDate },
    status: "delivered",
    'payment.status': "paid"
  };
  const cancelled = {
    updatedAt: { $gte: startDate, $lte: endDate },
    status: "cancelled",
  };
  const returned = {
    updatedAt: { $gte: startDate, $lte: endDate },
    status: "returned",
  };

  const orders = await Order.find(delivered)
    .populate("userId")
    .populate("items.productId")
    .sort({ updatedAt: -1 });

  const totalOrders = await Order.countDocuments(delivered);
  const totalCancelledOrders = await Order.countDocuments(cancelled);
  const totalReturnedOrders = await Order.countDocuments(returned);

  const metrics = await Order.aggregate([
    { $match: delivered },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$finalAmount" },
        totalDiscount: { $sum: "$couponDiscount" },
      },
    },
  ]);

  const totalSales = metrics[0]?.totalSales || 0;
  const totalDiscount = metrics[0]?.totalDiscount || 0;

  return render(res, "adminPages/salesReport", {
    orders,
    totalOrders,
    totalSales,
    totalDiscount,
    totalCancelledOrders,
    totalReturnedOrders,
    page: "salesReport",
    filter,
    startDate: req.query.startDate || today,
    endDate: req.query.endDate || today,
  });
};

const downloadPDF = async (req, res) => {
  const { startDate, endDate } = req.query;
  const query = {
    updatedAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    status: "delivered",
    "payment.status": "paid",
  };

  const orders = await Order.find(query)
    .populate("userId")
    .populate("items.productId")
    .sort({ updatedAt: -1 });

  const metrics = await Order.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$finalAmount" },
        totalDiscount: { $sum: "$couponDiscount" },
      },
    },
  ]);

  const totalSales = metrics[0]?.totalSales || 0;
  const totalDiscount = metrics[0]?.totalDiscount || 0;

  const stream = res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=SalesReport_${startDate}_to_${endDate}.pdf`,
  });

  generatePDF(
    (chunk) => stream.write(chunk),
    () => stream.end(),
    orders,
    totalSales,
    totalDiscount,
    startDate,
    endDate
  );
};

const downloadExcel = async (req, res) => {
  const { startDate, endDate } = req.query;
  const query = {
    updatedAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    status: "delivered",
    "payment.status": "paid",
  };

  const orders = await Order.find(query)
    .populate("userId")
    .populate("items.productId")
    .sort({ updatedAt: -1 });

  const metrics = await Order.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$finalAmount" },
        totalDiscount: { $sum: "$couponDiscount" },
      },
    },
  ]);

  const totalSales = metrics[0]?.totalSales || 0;
  const totalDiscount = metrics[0]?.totalDiscount || 0;

  await generateSalesReportExcel(
    res,
    orders,
    totalSales,
    totalDiscount,
    startDate,
    endDate
  );
};

module.exports = {
  showSalesReport,
  downloadPDF,
  downloadExcel,
  exportSalesPDF: downloadPDF,
  exportSalesExcel: downloadExcel,
};
