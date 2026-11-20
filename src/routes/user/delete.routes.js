const express = require("express");
const router = express.Router();
const { deleteController } = require("../../controllers/user/index");
const { asyncFunction } = require("../../helpers");

router.route('/')
  .get(asyncFunction(deleteController.show))
  .patch(asyncFunction(deleteController.deleteAc));

module.exports = router;
