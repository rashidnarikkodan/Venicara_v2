/**
 * Wraps an async route handler (or all handler functions in an object)
 * to catch unhandled promise rejections and forward them to Express's next(err).
 *
 * Usage with a single handler function:
 *   router.get('/', asyncFunction(controller.show));
 *
 * Usage wrapping an entire controller object:
 *   const controller = asyncFunction(rawController);
 *   router.get('/', controller.show);
 *
 * @param {Function|Object} fnOrObj - Route handler function or object of handlers
 * @returns {Function|Object} Wrapped handler function or object of wrapped handlers
 */
const asyncFunction = (fnOrObj) => {
  if (typeof fnOrObj === "function") {
    return (req, res, next) => {
      Promise.resolve(fnOrObj(req, res, next)).catch(next);
    };
  }

  if (typeof fnOrObj === "object" && fnOrObj !== null) {
    const wrapped = {};
    for (const [key, val] of Object.entries(fnOrObj)) {
      if (typeof val === "function") {
        wrapped[key] = (req, res, next) => {
          Promise.resolve(val(req, res, next)).catch(next);
        };
      } else {
        wrapped[key] = val;
      }
    }
    return wrapped;
  }

  return fnOrObj;
};

module.exports = asyncFunction;
module.exports.asyncFunction = asyncFunction;
module.exports.asyncHandler = asyncFunction;
