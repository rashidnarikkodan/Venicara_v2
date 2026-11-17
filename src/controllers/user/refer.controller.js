const { referralService } = require("../../services");
const apiResponse = require("../../helpers/apiResponse.helper");
const handleError = require("../../helpers/handleError.helper");

/**
 * Show referral dashboard
 * GET /referEarn
 */
const showReferEarn = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const data = await referralService.getReferralData(userId);
    res.render("userPages/refer", data);
  } catch (err) {
    handleError(res, "showReferEarn", err);
  }
};

/**
 * Claim referral reward
 * POST /referEarn/rewards/:id/claim (or PATCH /referEarn/rewards)
 */
const earnReward = async (req, res) => {
  try {
    const referralId = req.params.id || req.body.id;
    const userId = req.session.user.id;

    const result = await referralService.claimReward(userId, referralId);
    return apiResponse.ok(res, result.message, { balance: result.balance });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, status: false, message: err.message });
    }
    handleError(res, "earnReward", err);
  }
};

module.exports = {
  showReferEarn,
  earnReward,
};
