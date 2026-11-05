const express = require("express");
const router = express.Router();

const {
  cartController,
} = require("../../controllers/user/index");

const auth = require("../../middlewares/authUser");


router
  .route("/")
  .get(auth.requireLogin, cartController.showCart);

router
  .route("/addToCart/:id")
  .post(cartController.addToCart);

router
  .route("/remove/:id")
  .delete(cartController.removeFromCart);


router
  .route("/increase/:cartId")
  .patch(cartController.increaseQuantity);

router
  .route("/decrease/:cartId")
  .patch(cartController.decreaseQuantity);


module.exports = router