const { AppError } = require('./errors.helper');

const handleError = (res, controllerName, error) => {
  console.error(`[${controllerName}]`, error);
  const isApi = Boolean(
    res.req?.xhr || 
    (res.req?.headers?.accept || '').includes('application/json') ||
    res.req?.originalUrl?.startsWith('/api') ||
    res.req?.headers['content-type'] === 'application/json'
  );
  const statusCode = error?.statusCode || 500;
  const message = error?.message || 'Something went wrong. Please try again.';

  if (isApi) {
    const payload = { success: false, message };
    if (error?.data) payload.data = error.data;
    return res.status(statusCode).json(payload);
  }

  if (statusCode === 404) {
    return res.status(404).render('userPages/404', { message, url: res.req?.originalUrl });
  }

  res.status(statusCode).render('userPages/500', { message: `Error from ${controllerName}: ${message}` });
};

module.exports = handleError;
