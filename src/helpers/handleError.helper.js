const { HTTP_STATUS } = require('../constants');

const handleError = (res, controllerName = 'GlobalError', error) => {
  console.error(`[${controllerName}]`, error);
  const req = res.req;
  const isApi = Boolean(
    req?.xhr || 
    (req?.headers?.accept || '').includes('application/json') ||
    req?.originalUrl?.startsWith('/api') ||
    req?.headers?.['content-type'] === 'application/json'
  );
  const statusCode = error?.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = error?.message || 'Something went wrong. Please try again.';

  if (isApi) {
    const payload = { success: false, message };
    if (error?.data) payload.data = error.data;
    return res.status(statusCode).json(payload);
  }

  // Flash message and redirect back for client/validation errors on non-GET form submissions
  if (statusCode < 500 && req?.flash && req.method !== 'GET') {
    req.flash('error', message);
    const referer = req.header('Referer') || req.originalUrl || '/';
    return res.redirect(referer);
  }

  if (statusCode === HTTP_STATUS.NOT_FOUND) {
    return res.status(HTTP_STATUS.NOT_FOUND).render('userPages/404', { message, url: req?.originalUrl });
  }

  res.status(statusCode).render('userPages/500', { message: `Error: ${message}` });
};

module.exports = handleError;
