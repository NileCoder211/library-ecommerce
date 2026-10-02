import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";

const TZ = "Africa/Nairobi";

// Only count money actually received and orders that weren't cancelled.
// (Before, pending / failed / cancelled orders were included in revenue.)
const REVENUE_MATCH = {
  paymentStatus: "paid",
  orderStatus: { $ne: "cancelled" },
};

export const getAnalyticsData = async () => {
  const [totalUsers, totalProducts, salesData] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.aggregate([
      { $match: REVENUE_MATCH },
      {
        $group: {
          _id: null, // groups all documents together
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]),
  ]);

  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };

  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
  };
};

export const getDailySalesData = async (startDate, endDate) => {
  const dailySalesData = await Order.aggregate([
    {
      $match: {
        ...REVENUE_MATCH,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        // group by Nairobi calendar day, not UTC day
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: TZ,
          },
        },
        sales: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return getDatesInRange(startDate, endDate).map((date) => {
    const found = dailySalesData.find((item) => item._id === date);
    return {
      date,
      sales: found?.sales || 0,
      revenue: found?.revenue || 0,
    };
  });
};

// "YYYY-MM-DD" in Nairobi time (en-CA formats dates that way)
const formatDay = (d) => d.toLocaleDateString("en-CA", { timeZone: TZ });

function getDatesInRange(startDate, endDate) {
  const dates = [];
  const cursor = new Date(startDate);
  const last = formatDay(new Date(endDate));

  let day = formatDay(cursor);
  while (day <= last) {
    dates.push(day);
    cursor.setUTCDate(cursor.getUTCDate() + 1); // Kenya has no DST, so +24h is safe
    day = formatDay(cursor);
  }

  return dates;
}
