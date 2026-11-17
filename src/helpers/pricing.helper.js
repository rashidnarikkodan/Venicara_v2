const Category = require('../models/category.model');

/**
 * Compute final price and discount percent for a product variant.
 * Uses the higher of category discount and product discount.
 * @param {number} basePrice
 * @param {number|string} productDiscount  - percentage e.g. 10
 * @param {string} categoryId
 * @returns {{ finalAmount: number, finalDiscount: number }}
 */
async function computePricing(basePrice, productDiscount, categoryId) {
  const category = await Category.findById(categoryId).lean();
  const catDiscount = parseFloat(category?.discount ?? 0);
  const prodDiscount = parseFloat(productDiscount ?? 0);
  const finalDiscount = Math.max(catDiscount, prodDiscount);
  const finalAmount = Math.round(basePrice - (finalDiscount / 100) * basePrice);
  return { finalAmount, finalDiscount };
}

module.exports = computePricing;
