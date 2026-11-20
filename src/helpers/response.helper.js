const { HTTP_STATUS } = require("../constants");

/**
 * Standard JSON Success Response helper
 * Usage:
 *   return success(res, "Item added to cart", result);
 *   return success(res, "Profile updated");
 *   return success(res, "Created successfully", newItem, HTTP_STATUS.CREATED);
 *   return success(res, { message: "Found", data: products });
 *
 * @param {import('express').Response} res
 * @param {string|object} messageOrData
 * @param {any} [data=null]
 * @param {number} [statusCode=HTTP_STATUS.OK]
 */
const success = (res, messageOrData = "Success", data = null, statusCode = HTTP_STATUS.OK) => {
  if (typeof messageOrData === "object" && messageOrData !== null && !Array.isArray(messageOrData)) {
    const opts = messageOrData;
    const code = opts.statusCode || statusCode || HTTP_STATUS.OK;
    const payload = {
      success: true,
      message: opts.message || "Success",
      ...(opts.data !== undefined && opts.data !== null ? { data: opts.data } : {}),
      ...(opts.meta !== undefined && opts.meta !== null ? { meta: opts.meta } : {}),
    };
    // Preserve any existing custom keys if passed in an object
    for (const [key, val] of Object.entries(opts)) {
      if (!["statusCode", "data", "meta", "message"].includes(key)) {
        payload[key] = val;
      }
    }
    return res.status(code).json(payload);
  }

  const code = typeof data === "number" ? data : statusCode;
  const payloadData = typeof data === "number" ? null : data;
  const payload = {
    success: true,
    message: messageOrData || "Success",
  };
  if (payloadData !== null && payloadData !== undefined) {
    payload.data = payloadData;
  }
  return res.status(code).json(payload);
};

/**
 * Standard View Rendering helper
 * Usage:
 *   return render(res, "userPages/shop", { products });
 *   return render(res, "userPages/404", { message: "Not found" }, HTTP_STATUS.NOT_FOUND);
 *
 * @param {import('express').Response} res
 * @param {string} view - View path relative to views folder
 * @param {object} [data={}] - View data passed to EJS template
 * @param {number} [statusCode=HTTP_STATUS.OK] - HTTP status code
 */
const render = (res, view, data = {}, statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).render(view, data);
};

/**
 * Convenience wrapper for 201 Created
 */
const created = (res, message = "Created successfully", data = null) => {
  return success(res, message, data, HTTP_STATUS.CREATED);
};

module.exports = {
  success,
  render,
  created,
};

