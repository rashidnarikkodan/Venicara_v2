const { HTTP_STATUS } = require("../constants");

class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.BAD_REQUEST, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.name = "AppError";
  }
}

module.exports = {
  AppError,
};
