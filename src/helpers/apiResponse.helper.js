const send = (res, statusCode, success, message, data = null) => {
  const body = { success, message };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
};

module.exports = {
  ok:        (res, message, data)        => send(res, 200, true,  message, data),
  created:   (res, message, data)        => send(res, 201, true,  message, data),
  badRequest:(res, message)              => send(res, 400, false, message),
  unauth:    (res, message, redirectUrl) => send(res, 401, false, message, { redirect: redirectUrl || '/auth/login' }),
  notFound:  (res, message)             => send(res, 404, false, message),
  serverErr: (res, message)             => send(res, 500, false, message),
};
