const { referralService } = require("../../services");
const { render, success } = require("../../helpers/response.helper");

/**
 * Show referral dashboard
 * GET /referEarn
 */
const showReferEarn = async (req, res) => {
  const userId = req.session.user.id;
  const data = await referralService.getReferralData(userId);
  return render(res, "userPages/refer", data);
};

/**
 * Claim referral reward
 * POST /referEarn/rewards/:id/claim (or PATCH /referEarn/rewards)
 */
const earnReward = async (req, res) => {
  const referralId = req.params.id || req.body.id;
  const userId = req.session.user.id;

  const result = await referralService.claimReward(userId, referralId);
  return success(res, result.message, { balance: result.balance });
};

module.exports = {
  showReferEarn,
  earnReward,
};
