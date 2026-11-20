const { productService } = require("../../services");
const { success, render } = require("../../helpers/response.helper");
const handleError = require("../../helpers/handleError.helper");

/**
 * Search active products by keyword
 * GET /search
 */
const searchProducts = async (req, res) => {
  try {
    const products = await productService.searchProducts(req.query.search);
    return success(res, "Products retrieved successfully", { products });
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
    return render(res, "userPages/productDetails", data);
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
