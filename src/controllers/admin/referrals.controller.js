const { render, success } = require("../../helpers/response.helper");
const handleError = require("../../helpers/handleError.helper");
const Referrals = require('../../models/referrals.model');
const User = require('../../models/user.model');

const showReferrals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    // Total referrals for pagination
    const totalReferrals = await Referrals.countDocuments();

    // Fetch referrals with pagination
    const referrals = await Referrals.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    // Populate referrer and referred names
    for (let r of referrals) {
      const referrer = await User.findById(r.referrerUserId).lean();
      const referred = await User.findById(r.referredUserId).lean();
      r.referrer = referrer?.name || "N/A";
      r.referred = referred?.name || "N/A";
    }

    // Global totals
    const pipeline = [
      {
        $group: {
          _id: null,
          referrers: { $addToSet: "$referrerUserId" },
          referred: { $addToSet: "$referredUserId" },
        },
      },
      {
        $project: {
          _id: 0,
          totalReferrerUsers: { $size: "$referrers" },
          totalReferredUsers: { $size: "$referred" },
        },
      },
    ];

    const total = await Referrals.aggregate(pipeline);
    const { totalReferredUsers, totalReferrerUsers } = total[0] || {};

    let totalPaid = 0;
    let totalPending = 0;

    for (let r of referrals) {
      if (r.status === "claimed") totalPaid += r.rewardAmount;
      if (r.status === "pending") totalPending += r.rewardAmount;
    }

    return render(res, "adminPages/referrals", {
      page: "referrals",
      referrals,
      totalReferrals,
      totalPages: Math.ceil(totalReferrals / limit),
      currentPage: page,
      limit,
      totalReferrerUsers,
      totalReferredUsers,
      totalPaid,
      totalPending,
    });
  } catch (error) {
    handleError(res, "showReferrals", error);
  }
};

const approveReward = async (req, res) => {
  try {
    const referralId = req.params.id;
    const referral = await Referrals.findById(referralId);
    if (!referral) {
      return handleError(res, "approveReward", { statusCode: 404, message: "Referral not found" });
    }

    referral.status = "claim";
    await referral.save();

    return success(res, "Reward claimed successfully");
  } catch (error) {
    handleError(res, "approveReward", error);
  }
};

module.exports = {
  showReferrals,
  approveReward,
};
