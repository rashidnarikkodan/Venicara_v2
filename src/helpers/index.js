const apiResponse = require('./apiResponse.helper');
const { success, render, created } = require('./response.helper');
const asyncHandler = require('./asyncHandler');
const { AppError } = require('./errors.helper');
const generateInvoice = require('./generateInvoice.helper');
const generateOTP = require('./generateOTP.helper');
const getChartData = require('./getChartData.helper');
const getDashboardData = require('./getDashboardData.helper');
const handleError = require('./handleError.helper');
const imgProcess = require('./imgProcess.helper');
const generateOrderId = require('./orderId.helper');
const computePricing = require('./pricing.helper');
const generateRefCode = require('./referralCode.helper');
const generateSalesReportExcel = require('./salesExcel.helper');
const generatePDF = require('./salesPdf.helper');
const sendEmail = require('./sendMail.helper');

module.exports = {
  apiResponse,
  success,
  render,
  created,
  asyncHandler,
  asyncFunction: asyncHandler,
  AppError,
  generateInvoice,
  generateOTP,
  getChartData,
  getDashboardData,
  handleError,
  imgProcess,
  generateOrderId,
  computePricing,
  generateRefCode,
  generateSalesReportExcel,
  generatePDF,
  sendEmail,
};
