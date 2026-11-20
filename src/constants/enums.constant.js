const ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  OUT_FOR_DELIVERY: "Out of delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURNED: "returned",
});

const PAYMENT_METHOD = Object.freeze({
  COD: "COD",
  RAZORPAY: "RAZORPAY",
  WALLET: "WALLET",
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
});

const RETURN_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
});

const WALLET_TRANSACTION_TYPE = Object.freeze({
  CREDIT: "credit",
  DEBIT: "debit",
});

const WALLET_TRANSACTION_STATUS = Object.freeze({
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
});

const ADDRESS_TYPE = Object.freeze({
  HOME: "home",
  WORK: "work",
  OTHER: "other",
});

const ADMIN_ROLE = Object.freeze({
  ADMIN: "admin",
  SUPER_ADMIN: "superAdmin",
});

const USER_GENDER = Object.freeze({
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
});

const CART_ITEM_STATUS = Object.freeze({
  ACTIVE: "active",
  SAVED: "saved",
  ORDERED: "ordered",
});

module.exports = {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  RETURN_STATUS,
  WALLET_TRANSACTION_TYPE,
  WALLET_TRANSACTION_STATUS,
  ADDRESS_TYPE,
  ADMIN_ROLE,
  USER_GENDER,
  CART_ITEM_STATUS,
};
