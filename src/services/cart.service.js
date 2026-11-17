const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const { AppError } = require("../helpers/errors.helper");

class CartService {
  /**
   * Retrieve active cart items and calculate totals
   */
  async getCart(userId) {
    const cartDocs = await Cart.find({
      userId,
      status: "active",
    })
      .populate("productId")
      .lean();

    const items = cartDocs.map((doc) => {
      const variant = doc.productId?.variants?.find(
        (v) => v._id.toString() === doc.variantId?.toString()
      );

      const safeVariant = variant || {
        _id: null,
        name: "Default Variant",
        finalAmount: 0,
        stock: 0,
      };

      const price = safeVariant.finalAmount || 0;
      const lineTotal = price * doc.quantity;

      return {
        _id: doc._id,
        quantity: doc.quantity,
        product: doc.productId,
        variant: safeVariant,
        lineTotal,
      };
    });

    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
    return { items, total };
  }

  /**
   * Add a product variant to user's cart
   */
  async addToCart(userId, productId, variantId) {
    const product = await Product.findById(productId);
    if (!product || product.isDeleted || !product.isAvailable) {
      throw new AppError("Product not found", 404);
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      throw new AppError("Variant not found", 404);
    }

    if (variant.stock <= 0) {
      throw new AppError("Out of stock", 400);
    }

    const existingCartItem = await Cart.findOne({
      userId,
      productId,
      variantId,
      status: "active",
    });

    const maxQty = Math.min(5, variant.stock);

    if (existingCartItem) {
      if (existingCartItem.quantity >= maxQty) {
        throw new AppError("Quantity limit reached", 400);
      }
      existingCartItem.quantity += 1;
      await existingCartItem.save();
      return { item: existingCartItem, action: "updated" };
    }

    const newItem = new Cart({
      userId,
      productId,
      variantId,
      quantity: 1,
      status: "active",
    });
    await newItem.save();
    return { item: newItem, action: "created" };
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(userId, cartItemId) {
    const deleted = await Cart.findOneAndDelete({ _id: cartItemId, userId });
    if (!deleted) {
      throw new AppError("Item not found in cart", 404);
    }
    return true;
  }

  /**
   * Update quantity (increase / decrease)
   */
  async updateQuantity(userId, cartItemId, action) {
    const cartItem = await Cart.findOne({ _id: cartItemId, userId }).populate("productId");
    if (!cartItem) {
      throw new AppError("Item not found", 404);
    }

    const variant = cartItem.productId?.variants?.find(
      (v) => v._id.toString() === cartItem.variantId.toString()
    );
    if (!variant) {
      throw new AppError("Variant not found", 404);
    }

    const maxQty = Math.min(5, variant.stock);

    if (action === "increase") {
      if (cartItem.quantity >= maxQty) {
        throw new AppError("Quantity limit reached", 400, { newQuantity: cartItem.quantity });
      }
      cartItem.quantity += 1;
    } else if (action === "decrease") {
      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
      }
    } else {
      throw new AppError("Invalid action", 400);
    }

    await cartItem.save();

    const price = variant.finalAmount || 0;
    const lineTotal = price * cartItem.quantity;
    const stock = variant.stock || 0;

    const cartItems = await Cart.find({ userId, status: "active" }).populate("productId");
    const total = cartItems.reduce((sum, item) => {
      const v = item.productId?.variants?.find(
        (vv) => vv._id.toString() === item.variantId.toString()
      );
      return sum + ((v?.finalAmount || 0) * item.quantity);
    }, 0);

    return {
      newQuantity: cartItem.quantity,
      lineTotal,
      total,
      stock,
    };
  }

  /**
   * Count active cart items for user
   */
  async getCartCount(userId) {
    return await Cart.countDocuments({ userId, status: "active" });
  }
}

module.exports = new CartService();

