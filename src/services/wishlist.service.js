const Wishlist = require("../models/wishlist.model");
const Product = require("../models/product.model");
const Cart = require("../models/cart.model");
const User = require("../models/user.model");
const { AppError } = require("../helpers/errors.helper");

class WishlistService {
  /**
   * Get user's active wishlist items
   */
  async getWishlist(userId) {
    const wishlistDocs = await Wishlist.find({ userId })
      .populate({
        path: "productId",
        match: { isDeleted: false, isAvailable: true },
        select: "name basePrice variants images",
      })
      .sort({ createdAt: -1 });

    const items = wishlistDocs
      .filter((doc) => doc.productId)
      .map((doc) => ({
        _id: doc._id,
        product: doc.productId,
        variant: doc.productId?.variants?.id(doc.variantId) || null,
        createdAt: doc.createdAt,
      }));

    const user = await User.findById(userId).lean();
    return { items, user };
  }

  /**
   * Toggle item in wishlist (add if not present, remove if present)
   */
  async toggleWishlist(userId, productId, variantId) {
    const product = await Product.findById(productId);
    if (!product || product.isDeleted || !product.isAvailable) {
      throw new AppError("Product not found", 404);
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      throw new AppError("Variant not found", 404);
    }

    const existingItem = await Wishlist.findOne({
      userId,
      productId,
      variantId,
    });

    if (existingItem) {
      await Wishlist.findByIdAndDelete(existingItem._id);
      return { action: "removed", message: "Product removed from wishlist" };
    }

    const newItem = await Wishlist.create({
      userId,
      productId,
      variantId,
    });

    return { action: "added", message: "Product added to wishlist", item: newItem };
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(userId, wishlistId) {
    const deleted = await Wishlist.findOneAndDelete({ _id: wishlistId, userId });
    if (!deleted) {
      throw new AppError("Wishlist item not found", 404);
    }
    return true;
  }

  /**
   * Transfer item from wishlist into shopping cart
   */
  async moveToCart(userId, wishlistId) {
    const wishedItem = await Wishlist.findOne({ _id: wishlistId, userId }).populate("productId");
    if (!wishedItem) {
      throw new AppError("Wishlist item not found", 404);
    }

    const product = wishedItem.productId;
    const variantId = wishedItem.variantId;

    if (!product || product.isDeleted || !product.isAvailable) {
      throw new AppError("Product not found or unavailable", 404);
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      throw new AppError("Variant not found", 404);
    }

    if (variant.stock <= 0) {
      throw new AppError("Out of stock", 400);
    }

    let existingCartItem = await Cart.findOne({
      userId,
      productId: product._id,
      variantId,
      status: "active",
    });

    let cartItem;
    if (existingCartItem) {
      if (existingCartItem.quantity >= variant.stock) {
        throw new AppError("Not enough stock available", 400);
      }
      if (existingCartItem.quantity >= 5) {
        throw new AppError("Quantity limit exceeded (max 5)", 400);
      }

      existingCartItem.quantity += 1;
      await existingCartItem.save();
      cartItem = existingCartItem;
    } else {
      cartItem = await Cart.create({
        userId,
        productId: product._id,
        variantId,
        quantity: 1,
        status: "active",
      });
    }

    await Wishlist.findByIdAndDelete(wishlistId);

    return {
      cartItem,
      message: existingCartItem
        ? "Product quantity updated in cart"
        : "Product added to cart",
    };
  }
}

module.exports = new WishlistService();

