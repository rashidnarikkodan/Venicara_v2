const { HTTP_STATUS } = require("../constants");
const { success, render, created } = require("./response.helper");

const send = (res, statusCode, isSuccess, message, data = null) => {
  const body = { success: isSuccess, message };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
};

module.exports = {
  success,
  render,
  created,
  ok:        (res, message, data)        => send(res, HTTP_STATUS.OK, true,  message, data),
  badRequest:(res, message)              => send(res, HTTP_STATUS.BAD_REQUEST, false, message),
  unauth:    (res, message, redirectUrl) => send(res, HTTP_STATUS.UNAUTHORIZED, false, message, { redirect: redirectUrl || '/auth/login' }),
  notFound:  (res, message)             => send(res, HTTP_STATUS.NOT_FOUND, false, message),
  serverErr: (res, message)             => send(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, message),
};
