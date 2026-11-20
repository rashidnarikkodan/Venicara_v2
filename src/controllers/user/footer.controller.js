const { render } = require('../../helpers/response.helper');

const privacyPolicy = (req, res) => {
  return render(res, 'userPages/privacyPolicy');
};

const returnPolicy = (req, res) => {
  return render(res, 'userPages/returnPolicy');
};

const termsConditions = (req, res) => {
  return render(res, 'userPages/termsConditions');
};

const cookiePolicy = (req, res) => {
  return render(res, 'userPages/cookiePolicy');
};

const shippingPolicy = (req, res) => {
  return render(res, 'userPages/shippingPolicy');
};

module.exports = {
  privacyPolicy,
  returnPolicy,
  termsConditions,
  cookiePolicy,
  shippingPolicy,
};
