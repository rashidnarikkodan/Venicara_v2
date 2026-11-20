/**
 * Wraps an async route handler or all methods on a controller object to catch unhandled errors and pass them to next().
 * @param {Function|Object} fnOrObj - Async route function or controller object
 * @returns {Function|Object}
 */
const asyncHandler = (fnOrObj) => {
  if (typeof fnOrObj === 'function') {
    return (req, res, next) => {
      Promise.resolve(fnOrObj(req, res, next)).catch(next);
    };
  }
  if (typeof fnOrObj === 'object' && fnOrObj !== null) {
    const wrapped = {};
    for (const [key, val] of Object.entries(fnOrObj)) {
      wrapped[key] = typeof val === 'function'
        ? (req, res, next) => Promise.resolve(val(req, res, next)).catch(next)
        : val;
    }
    return wrapped;
  }
  return fnOrObj;
};

module.exports = asyncHandler;
module.exports.asyncHandler = asyncHandler;
module.exports.default = asyncHandler;
