const User = require("../models/user.model");
const Referrals = require("../models/referrals.model");
const Wallet = require("../models/wallet.model");
const WalletTransaction = require("../models/walletTransaction.model");
const { AppError } = require("../helpers/errors.helper");

class ReferralService {
  /**
   * Get user referral code and reward history
   */
  async getReferralData(userId) {
    const [user, rewards] = await Promise.all([
      User.findById(userId).lean(),
      Referrals.find({ referrerUserId: userId })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    return {
      user,
      referralCode: user?.referralCode || "",
      rewards,
    };
  }

  /**
   * Claim referral reward and credit to wallet
   */
  async claimReward(userId, referralId) {
    const reward = await Referrals.findOne({ _id: referralId, referrerUserId: userId });
    if (!reward) {
      throw new AppError("Referral reward not found", 404);
    }
    if (reward.status === "claimed") {
      throw new AppError("Reward already claimed", 400);
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0 });
    }

    wallet.balance += reward.amount;
    await wallet.save();

    await WalletTransaction.create({
      userId,
      type: "credit",
      amount: reward.amount * 100,
      status: "success",
      lastBalance: wallet.balance,
      note: "Referral reward bonus",
    });

    reward.status = "claimed";
    await reward.save();

    return { message: "Reward claimed successfully", balance: wallet.balance };
  }
}

module.exports = new ReferralService();

