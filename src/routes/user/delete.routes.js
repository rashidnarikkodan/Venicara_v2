const express = require("express");
const router = express.Router();
const { deleteController } = require("../../controllers/user/index");
const { asyncHandler } = require("../../helpers");

router.route('/')
  .get(asyncHandler(deleteController.show))
  .patch(asyncHandler(deleteController.deleteAc));

module.exports = router;
