import Order from "../models/orderModel.js";

export const generateOrderNumber = async (paymentMethod) => {
  const year = new Date().getFullYear();

  const prefix = paymentMethod === "stripe" ? "STR" : "MPS";

  let orderNumber;
  let exists = true;

  while (exists) {
    const random = Math.floor(100000 + Math.random() * 900000);

    orderNumber = `ORD-${prefix}-${year}-${random}`;

    const existingOrder = await Order.findOne({
      orderNumber,
    });

    exists = !!existingOrder;
  }

  return orderNumber;
};
