const BigPromise = require("../middlewares/bigPromise");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.sendStripeKey = BigPromise(async (req, res, next) => {
  res.status(200).json({
    stripekey: process.env.STRIPE_API_KEY,
  });
});
exports.sendRazorPayKey = BigPromise(async (req, res, next) => {
  res.status(200).json({
    stripekey: process.env.STRIPE_API_KEY,
  });
});
exports.captureRazorPayPayment = BigPromise(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",

    // Optional
    metadata: {
      integration_check: "accept_a_payment",
    },
  });

  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
    // you can optionally send id as well
  });
});
exports.captureStripePayment = BigPromise(async (req, res, next) => {
  var instance = new Razorpay({
    key_id: "YOUR_KEY_ID",
    key_secret: "YOUR_SECRET",
  });

  const myOrder = instance.orders.create({
    amount: req.body.amount,
    currency: "INR",
    receipt: "receipt#1",
    notes: {
      key1: "value3",
      key2: "value2",
    },
  });

  res.status(200).json({
    success: true,
    amount: req.body.amount,
    order: myOrder,
  });
});
