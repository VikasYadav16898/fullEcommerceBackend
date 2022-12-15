const bigPromise = require("../middlewares/bigPromise");
const Order = require("../models/order");
const Product = require("../models/product");
const CustomError = require("../utils/customError");

exports.createOrder = bigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItem,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItem,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});
exports.getOneOrder = bigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user");

  if (order) {
    return new CustomError("Order doesn't exist", 401);
  }

  res.status(200).json({
    success: true,
    order,
  });
});
exports.getLoggedInOrder = bigPromise(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  if (order) {
    return new CustomError("Order doesn't exist", 401);
  }

  res.status(200).json({
    success: true,
    order,
  });
});
exports.adminGetAllOrders = bigPromise(async (req, res, next) => {
  const orders = await Order.find();

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.adminUpdateOrder = bigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus === "delivered") {
    return new CustomError("Order is already marked for delivered", 401);
  }

  order.orderStatus = req.body.orderStatus;
  order.orderItems.forEach(async (prod) => {
    await updateProductStock(prod.product, prod.quantity);
  });

  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});
exports.adminDeleteOrder = bigPromise(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    order,
  });
});

async function updateProductStock(productId, quantity) {
  const product = await Product.findById(productId);

  product.stock = product.stock - quantity;

  await product.save({
    validateBeforeSave: true,
  });
}
