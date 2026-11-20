const express = require('express');
const router = express.Router();
const { footerController } = require('../../controllers/user/index');
const { asyncHandler } = require('../../helpers');

router.get('/privacy-policy', asyncHandler(footerController.privacyPolicy));
router.get('/return-policy', asyncHandler(footerController.returnPolicy));
router.get('/terms-conditions', asyncHandler(footerController.termsConditions));
router.get('/cookie-policy', asyncHandler(footerController.cookiePolicy));
router.get('/shipping-policy', asyncHandler(footerController.shippingPolicy));

module.exports = router;
