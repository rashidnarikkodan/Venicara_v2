const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Review = require("../models/review.model");
const Wishlist = require("../models/wishlist.model");
const { AppError } = require("../helpers/errors.helper");

class ProductService {
  /**
   * Search active products by name query
   */
  async searchProducts(query) {
    const search = (query || "").trim();
    const filter = { isDeleted: false, isAvailable: true };

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    return await Product.find(filter, { name: 1, images: 1 }).lean();
  }

  /**
   * Get single product details, reviews, and related products
   */
  async getProductDetails(productId) {
    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError("Invalid product id", 400);
    }

    const product = await Product.findOne({
      _id: productId,
      isDeleted: false,
      isAvailable: true,
    })
      .populate("category")
      .lean();

    if (!product) {
      throw new AppError("Product not found or unavailable", 404);
    }

    const reviews = await Review.find({ productId: product._id }).lean();
    let averageRating = 0;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (reviews.length > 0) {
      const total = reviews.reduce((acc, r) => acc + r.rating, 0);
      averageRating = total / reviews.length;
      reviews.forEach((r) => {
        ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
      });
    }

    const ratingPercentages = {};
    for (let i = 5; i >= 1; i--) {
      ratingPercentages[i] =
        reviews.length > 0 ? ((ratingCounts[i] / reviews.length) * 100).toFixed(0) : 0;
    }

    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isDeleted: false,
      isAvailable: true,
    })
      .populate("category")
      .limit(8)
      .lean();

    return {
      product,
      relatedProducts,
      reviews,
      averageRating: averageRating.toFixed(1),
      ratingPercentages,
    };
  }

  /**
   * Get landing page data
   */
  async getLandingData(userId = null) {
    const categories = await Category.find(
      { isDeleted: false, isActive: true },
      { _id: 1, name: 1 }
    ).lean();

    if (categories.length >= 3) {
      categories[0].img = "/images/category-MEN.avif";
      categories[1].img = "/images/category-unisex.avif";
      categories[2].img = "/images/category-women.avif";
    }

    const products = await Product.find({
      isDeleted: false,
      isAvailable: true,
      isFeatured: true,
    })
      .populate("category")
      .lean();

    const wishlistIds = userId
      ? (await Wishlist.find({ userId }, { variantId: 1, _id: 0 }).lean()).map((item) =>
          item.variantId.toString()
        )
      : [];

    return { products, categories, wishlistIds };
  }

  /**
   * Get shop products with filtering, sorting, price range, and pagination
   */
  async getShopData(userId, query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 9;
    const { maxPrice, minPrice, sort, category, search } = query;

    const wishlistIds = userId
      ? (await Wishlist.find({ userId }, { variantId: 1, _id: 0 }).lean()).map((item) =>
          item.variantId.toString()
        )
      : [];

    const categories = await Category.find({ isDeleted: false, isActive: true }).lean();

    const noFilters = !maxPrice && !minPrice && !sort && !category && !search;
    if (noFilters) {
      const products = await Product.find({ isDeleted: false, isAvailable: true })
        .populate("category")
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      for (const product of products) {
        const reviews = await Review.find({ productId: product._id }).lean();
        if (reviews.length > 0) {
          const total = reviews.reduce((acc, r) => acc + r.rating, 0);
          product.rating = total / reviews.length;
          product.reviewLength = reviews.length;
        }
      }

      const totalProducts = await Product.countDocuments({
        isDeleted: false,
        isAvailable: true,
      });
      const totalPages = Math.ceil(totalProducts / limit) || 1;

      return {
        products,
        categories,
        minPrice,
        maxPrice,
        sort,
        search,
        selectedCategory: category,
        currentPage: page,
        totalPages,
        limit,
        wishlistIds,
        totalProducts,
      };
    }

    const selectedCategory =
      category && category !== "all" && mongoose.isValidObjectId(category)
        ? new mongoose.Types.ObjectId(category)
        : null;

    const selectedMinPrice = Number(minPrice) || 0;
    const selectedMaxPrice = Number(maxPrice) || Infinity;

    const sortOptions = {
      az: { name: 1 },
      za: { name: -1 },
      asc: { lowestPrice: 1 },
      desc: { lowestPrice: -1 },
      newest: { createdAt: -1 },
    };
    const selectedSort = sortOptions[sort] || sortOptions.newest;

    const pipeline = [
      {
        $match: {
          isDeleted: false,
          isAvailable: true,
          ...(selectedCategory ? { category: selectedCategory } : {}),
          ...(search ? { name: { $regex: search, $options: "i" } } : {}),
        },
      },
      {
        $addFields: {
          lowestPrice: { $min: "$variants.finalAmount" },
        },
      },
      {
        $match: {
          lowestPrice: { $gte: selectedMinPrice, $lte: selectedMaxPrice },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      { $sort: selectedSort },
    ];

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Product.aggregate(countPipeline);
    const totalProducts = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalProducts / limit) || 1;

    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    const products = await Product.aggregate(pipeline);

    return {
      products,
      categories,
      minPrice,
      maxPrice,
      sort,
      search,
      selectedCategory: category,
      currentPage: page,
      totalPages,
      limit,
      wishlistIds,
      totalProducts,
    };
  }
}

module.exports = new ProductService();

