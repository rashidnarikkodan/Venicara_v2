const Address = require("../models/address.model");
const User = require("../models/user.model");
const { AppError } = require("../helpers/errors.helper");

class AddressService {
  /**
   * Get all active addresses for a user
   */
  async getUserAddresses(userId) {
    const addresses = await Address.find({ userId, isDeleted: false }).sort({ createdAt: -1 });
    const user = await User.findById(userId).lean();
    return { addresses, user };
  }

  /**
   * Get single address by ID
   */
  async getAddressById(userId, addressId) {
    const address = await Address.findOne({ _id: addressId, userId, isDeleted: false });
    if (!address) {
      throw new AppError("Address not found", 404);
    }
    return address;
  }

  /**
   * Create new address
   */
  async createAddress(userId, addressData) {
    const {
      fullName,
      mobile,
      pin,
      street,
      address,
      city,
      state,
      landmark,
      alternateMobile,
      type,
    } = addressData;

    const count = await Address.countDocuments({ userId, isDeleted: false });
    const isDefault = count === 0;

    const newAddress = new Address({
      userId,
      fullName,
      mobile,
      pin,
      street,
      address,
      city,
      state,
      landmark,
      alternateMobile,
      type: type || "HOME",
      isDefault,
    });

    await newAddress.save();

    if (isDefault) {
      await User.findByIdAndUpdate(userId, { defaultAddress: newAddress._id });
    }

    return newAddress;
  }

  /**
   * Update existing address
   */
  async updateAddress(userId, addressId, addressData) {
    const {
      fullName,
      mobile,
      pin,
      street,
      address,
      city,
      state,
      landmark,
      alternateMobile,
      type,
    } = addressData;

    const updated = await Address.findOneAndUpdate(
      { _id: addressId, userId, isDeleted: false },
      {
        fullName,
        mobile,
        pin,
        street,
        address,
        city,
        state,
        landmark,
        alternateMobile,
        type,
      },
      { new: true }
    );

    if (!updated) {
      throw new AppError("Address not found", 404);
    }

    return updated;
  }

  /**
   * Soft-delete address
   */
  async deleteAddress(userId, addressId) {
    const address = await Address.findOne({ _id: addressId, userId, isDeleted: false });
    if (!address) {
      throw new AppError("Address not found", 404);
    }

    address.isDeleted = true;
    await address.save();

    // If default, reset user default
    const user = await User.findById(userId);
    if (user?.defaultAddress?.toString() === addressId.toString()) {
      const nextAddress = await Address.findOne({ userId, isDeleted: false });
      user.defaultAddress = nextAddress ? nextAddress._id : null;
      await user.save();
    }

    return true;
  }

  /**
   * Set address as default
   */
  async setDefaultAddress(userId, addressId) {
    const address = await Address.findOne({ _id: addressId, userId, isDeleted: false });
    if (!address) {
      throw new AppError("Address not found", 404);
    }

    await Address.updateMany({ userId }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    await User.findByIdAndUpdate(userId, { defaultAddress: addressId });
    return address;
  }
}

module.exports = new AddressService();

