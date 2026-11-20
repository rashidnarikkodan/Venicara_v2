const { render } = require('../../helpers/response.helper');
const handleError = require('../../helpers/handleError.helper');

const privacyPolicy = (req, res) => {
  try {
    return render(res, 'userPages/privacyPolicy');
  } catch (error) {
    handleError(res, 'privacyPolicy', error);
  }
};

const returnPolicy = (req, res) => {
  try {
    return render(res, 'userPages/returnPolicy');
  } catch (error) {
    handleError(res, 'returnPolicy', error);
  }
};

const termsConditions = (req, res) => {
  try {
    return render(res, 'userPages/termsConditions');
  } catch (error) {
    handleError(res, 'termsConditions', error);
  }
};

const cookiePolicy = (req, res) => {
  try {
    return render(res, 'userPages/cookiePolicy');
  } catch (error) {
    handleError(res, 'cookiePolicy', error);
  }
};

const shippingPolicy = (req, res) => {
  try {
    return render(res, 'userPages/shippingPolicy');
  } catch (error) {
    handleError(res, 'shippingPolicy', error);
  }
};

module.exports = {
  privacyPolicy,
  returnPolicy,
  termsConditions,
  cookiePolicy,
  shippingPolicy,
};
