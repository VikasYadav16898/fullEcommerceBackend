const BigPromise = require("../middlewares/bigPromise");
const Product = require("../models/product");
const CustomError = require("../utils/customError");
const cloudinary = require("cloudinary");
const WhereClause = require("../utils/whereClause");
const bigPromise = require("../middlewares/bigPromise");

// User Controllers

exports.addProduct = BigPromise(async (req, res, next) => {
  // Images
  let imageArray = [];
  if (!req.files) {
    return next(new CustomError("Images are required.", 401));
  }

  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );
      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  console.log(imageArray);
  req.body.photos = imageArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getAllProduct = BigPromise(async (req, res, next) => {
  const resultPerPage = 6;
  const countProduct = await Product.countDocuments();

  const productsObject = new WhereClause(Product.find(), req.query)
    .search()
    .filter();
  let products = await productsObject.base;
  const totalProductCount = products.length;

  productsObject.pager(resultPerPage);
  products = await productsObject.base.clone();

  res.status(200).json({
    success: true,
    products,
    totalProductCount,
  });
});

exports.getOneProduct = bigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("No Product found with this id.", 401));
  }

  res.status(200).json({
    success: true,
    product,
  });
});
exports.addReview = bigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);
  const alreadyReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        (rev.comment = comment), (rev.rating = rating);
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  // Adjust Ratings
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({
    validateBeforeSave: true,
  });

  res.status(200).json({
    success: true,
    product,
  });
});
exports.deleteReview = bigPromise(async (req, res, next) => {
  const { productId } = req.query;

  const product = await Product.findById(productId);

  const reviews = product.reviews.filter(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  const numberOfReviews = reviews.length;

  // Adjust Ratings
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      rating: product.rating,
      numberOfReviews,
    },
    { new: true, runValidators: true, useFindAndModify: true }
  );

  res.status(200).json({
    success: true,
    product,
  });
});
exports.getOnlyReviewsForOneProduct = BigPromise(async (req, res, next) => {
  const { productId } = req.query;
  const product = await Product.findById(productId);
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Admin Controllers

exports.adminGetAllProduct = BigPromise(async (req, res, next) => {
  const products = await Product.find({});

  res.status(200).json({
    success: true,
    products,
  });
});

exports.adminUpdateOneProduct = BigPromise(async (req, res, next) => {
  let product = await Product.find({ _id: req.params.id });
  if (!product) {
    return next(new CustomError("No Product found with this id.", 401));
  }

  let imageArray = [];

  if (req.files) {
    // destroy the existing images
    for (let index = 0; index < product.photos.length; index++) {
      const res = await cloudinary.v2.uploader.destroy(
        product.photos[index].id
      );
    }

    // upload and save the images
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );
      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
    req.body.photos = imageArray;
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

exports.adminDeleteOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.find({ _id: req.params.id });
  if (!product) {
    return next(new CustomError("No Product found with this id.", 401));
  }

  // destroy the existing images
  for (let index = 0; index < product?.photos?.length; index++) {
    const res = await cloudinary.v2.uploader.destroy(product.photos[index].id);
  }

  await Product.remove(...product);

  res.status(200).json({
    success: true,
    message: "Product Deleted Successfully!",
  });
});
