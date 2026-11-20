const express = require('express');
const router = express.Router();
const { footerController } = require('../../controllers/user/index');
const { asyncFunction } = require('../../helpers');

router.get('/privacy-policy', asyncFunction(footerController.privacyPolicy));
router.get('/return-policy', asyncFunction(footerController.returnPolicy));
router.get('/terms-conditions', asyncFunction(footerController.termsConditions));
router.get('/cookie-policy', asyncFunction(footerController.cookiePolicy));
router.get('/shipping-policy', asyncFunction(footerController.shippingPolicy));

module.exports = router;
