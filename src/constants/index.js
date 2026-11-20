const HTTP_STATUS = require("./statusCodes.constant");
const enums = require("./enums.constant");

module.exports = {
  HTTP_STATUS,
  STATUS_CODES: HTTP_STATUS,
  ...enums,
};

