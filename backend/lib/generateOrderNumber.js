import Order from "../models/orderModel.js";

// Generates ORD-MPS-2026-123456. Extra arguments (e.g. the old "mpesa" param)
// are ignored, so existing callers keep working.
export const generateOrderNumber = async () => {
  const year = new Date().getFullYear();

  let orderNumber;
  let exists = true;

  while (exists) {
    const random = Math.floor(100000 + Math.random() * 900000);
    orderNumber = `ORD-MPS-${year}-${random}`;
    exists = !!(await Order.exists({ orderNumber }));
  }

  return orderNumber;
};
