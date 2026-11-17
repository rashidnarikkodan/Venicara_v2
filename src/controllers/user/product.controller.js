const { productService } = require("../../services");
const apiResponse = require("../../helpers/apiResponse.helper");
const handleError = require("../../helpers/handleError.helper");

/**
 * Search active products by keyword
 * GET /search
 */
const searchProducts = async (req, res) => {
  try {
    const products = await productService.searchProducts(req.query.search);
    return res.status(200).json({ success: true, products });
  } catch (err) {
    handleError(res, "searchProducts", err);
  }
};

/**
 * View single product details
 * GET /products/:id
 */
const showProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await productService.getProductDetails(id);
    return res.render("userPages/productDetails", data);
  } catch (err) {
    if (err.statusCode) {
      req.flash("error", err.message);
      return res.redirect("/shop");
    }
    handleError(res, "showProductDetails", err);
  }
};

module.exports = {
  searchProducts,
  showProductDetails,
};
