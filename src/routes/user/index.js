const router = require("express").Router();
const auth = require("../../middlewares/auth.user.middleware");

router.use("/auth", require("./auth.routes"));
router.use("/", require("./home.routes"));

router.use("/profile", auth.requireLogin, auth.isUserBlocked, require("./profile.routes"));
router.use("/address", auth.requireLogin, auth.isUserBlocked, require("./address.routes"));
router.use("/cart", auth.requireLogin, auth.isUserBlocked, require("./cart.routes"));
router.use("/checkout", auth.requireLogin, auth.isUserBlocked, require("./checkout.routes"));
router.use("/wishlist", auth.requireLogin, auth.isUserBlocked, require("./wishlist.routes"));
router.use("/orders", auth.requireLogin, auth.isUserBlocked, require("./order.routes"));
router.use("/referEarn", auth.requireLogin, auth.isUserBlocked, require("./refer.routes"));
router.use("/wallet", auth.requireLogin, auth.isUserBlocked, require("./wallet.routes"));
router.use("/delete", auth.requireLogin, auth.isUserBlocked, require("./delete.routes"));
router.use("/footer", require("./footer.routes"));

module.exports = router;
