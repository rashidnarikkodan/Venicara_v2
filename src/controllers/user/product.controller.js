const { productService } = require("../../services");
const { success, render } = require("../../helpers/response.helper");

/**
 * Search active products by keyword
 * GET /search
 */
const searchProducts = async (req, res) => {
  const products = await productService.searchProducts(req.query.search);
  return success(res, "Products retrieved successfully", { products });
};

/**
 * View single product details
 * GET /products/:id
 */
const showProductDetails = async (req, res) => {
  const { id } = req.params;
  const data = await productService.getProductDetails(id);
  return render(res, "userPages/productDetails", data);
};

module.exports = {
  searchProducts,
  showProductDetails,
};
