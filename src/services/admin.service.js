const Category = require("../models/category.model");
const Product = require("../models/product.model");
const Coupon = require("../models/coupon.model");
const User = require("../models/user.model");
const computePricing = require("../helpers/pricing.helper");
const { AppError } = require("../helpers/errors.helper");

class AdminService {
  /* ------------------ CATEGORIES ------------------ */

  async getCategories({ page = 1, limit = 7, search = "" }) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 7;
    const filter = { isDeleted: false };

    if (search && search.trim() !== "") {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    const [categories, totalCategories] = await Promise.all([
      Category.find(filter)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .lean(),
      Category.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCategories / limitNum) || 1;
    return {
      categories,
      totalCategories,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      search,
      count: (pageNum - 1) * limitNum,
    };
  }

  async createCategory({ name, discount = 0, description = "" }) {
    const cleanName = (name || "").trim();
    if (!cleanName) {
      throw new AppError("Category name is required", 400);
    }

    const existing = await Category.findOne({
      name: { $regex: `^${cleanName}$`, $options: "i" },
      isDeleted: false,
    });
    if (existing) {
      throw new AppError("Category already exists", 400);
    }

    return await Category.create({
      name: cleanName,
      discount: parseFloat(discount) || 0,
      description: description.trim(),
    });
  }

  async updateCategory(id, { name, discount = 0, description = "" }) {
    const cleanName = (name || "").trim();
    const existing = await Category.findOne({
      _id: { $ne: id },
      name: { $regex: `^${cleanName}$`, $options: "i" },
      isDeleted: false,
    });
    if (existing) {
      throw new AppError("Category already exists with this name", 400);
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: cleanName,
        discount: parseFloat(discount) || 0,
        description: description.trim(),
      },
      { new: true }
    );

    if (!updatedCategory) {
      throw new AppError("Category not found", 404);
    }

    // Recalculate variant prices for all products in this category
    const products = await Product.find({ category: id });
    for (const p of products) {
      for (const v of p.variants) {
        const { finalAmount, finalDiscount } = await computePricing(v.basePrice, v.discount, id);
        await Product.updateOne(
          { _id: p._id, "variants._id": v._id },
          {
            $set: {
              "variants.$.finalAmount": finalAmount,
              "variants.$.finalDiscount": finalDiscount,
            },
          }
        );
      }
    }

    return updatedCategory;
  }

  async deleteCategory(id) {
    const category = await Category.findByIdAndUpdate(id, { isDeleted: true });
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    return true;
  }

  async toggleCategoryStatus(id) {
    const category = await Category.findById(id);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    category.isActive = !category.isActive;
    await category.save();
    return category;
  }

  /* ------------------ COUPONS ------------------ */

  async getCoupons({ page = 1, limit = 10, search = "" }) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const filter = { isDeleted: false };

    if (search && search.trim() !== "") {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    const [coupons, totalCoupons] = await Promise.all([
      Coupon.find(filter)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .lean(),
      Coupon.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCoupons / limitNum) || 1;
    return {
      coupons,
      totalCoupons,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      search,
      count: (pageNum - 1) * limitNum,
    };
  }

  async createCoupon({ name, code, minPrice, maxDiscountAmount, discount, limit = 1, expireAt }) {
    const cleanCode = (code || "").toUpperCase().trim();
    const existing = await Coupon.findOne({ code: cleanCode, isDeleted: false });
    if (existing) {
      throw new AppError("Coupon code already exists", 400);
    }

    const disc = parseFloat(discount);
    if (disc >= 50) {
      throw new AppError("Discount must be less than 50%", 400);
    }

    const expiryDate = new Date(expireAt);

    return await Coupon.create({
      name: (name || "").trim(),
      code: cleanCode,
      minPrice: parseFloat(minPrice) || 0,
      maxDiscountAmount: parseFloat(maxDiscountAmount) || 0,
      discount: disc,
      limit: parseInt(limit, 10) || 1,
      expireAt: expiryDate,
    });
  }

  async deleteCoupon(id) {
    const coupon = await Coupon.findByIdAndUpdate(id, { isDeleted: true });
    if (!coupon) {
      throw new AppError("Coupon not found", 404);
    }
    return true;
  }

  /* ------------------ CUSTOMERS ------------------ */

  async getCustomers({ page = 1, limit = 10, search = "" }) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const filter = { isDeleted: false };

    if (search && search.trim() !== "") {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const [customers, totalCustomers] = await Promise.all([
      User.find(filter)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .lean(),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCustomers / limitNum) || 1;
    return {
      customers,
      totalCustomers,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      search,
      count: (pageNum - 1) * limitNum,
    };
  }

  async toggleCustomerBlock(id) {
    const customer = await User.findById(id);
    if (!customer) {
      throw new AppError("Customer not found", 404);
    }
    customer.isBlocked = !customer.isBlocked;
    await customer.save();
    return customer;
  }
}

module.exports = new AdminService();

