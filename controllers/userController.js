const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
const bigPromise = require("../middlewares/bigPromise");
const mailHelper = require("../utils/emailHelper");
const crypto = require("crypto");

exports.signUp = BigPromise(async (req, res, next) => {
  let result;
  if (!req.files) {
    return next(new CustomError("photo is required for signup", 400));
  }
  const { name, email, password } = req.body;
  if (!email || !name || !password) {
    return next(new CustomError("Name, email and password is required", 400));
  }
  let file = req.files.photo;
  result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: 150,
    crop: "scale",
  });

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;
  // check for presence of email and password
  if (!email || !password) {
    return next(new CustomError("Please provide email and password", 400));
  }

  // using select +password becasue in models password select property is false.
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new CustomError("User doesn't exist.", 400));
  }

  const isPasswordCorrect = await user.isValidatedPassword(password);
  if (!isPasswordCorrect) {
    return next(new CustomError("Email or password doesn't match", 400));
  }

  cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logout Success.",
  });
});

exports.forgotPassword = bigPromise(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new CustomError("Email not found as registered", 400));
  }

  const forgotToken = user.getForgotPasswordToken();

  await user.save({
    validateBeforeSave: false,
  });

  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  const message = `Copy paste this link in your URL and hit enter \n\n ${myUrl}`;
  console.log("ONE");

  try {
    await mailHelper({
      email: user.email,
      subject: "Yaduveera Tech: Password reset email",
      message,
    });

    res.status(200).json({
      success: true,
      message: "email sent successfully",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    return next(new CustomError(error.message, 500));
  }
});

exports.passwordReset = bigPromise(async (req, res, next) => {
  const token = req.params.token;

  const encryToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    encryToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });
  if (!user) {
    return next(new CustomError("Token is invalid or expired", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new CustomError("Password and confirm password does not matched", 400)
    );
  }

  user.password = req.body.password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  // send a json response or a token
  cookieToken(user, res);
});

exports.getLoggedInUserDetails = bigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});
exports.changePassword = bigPromise(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select("+password");

  const isCorrectOldPassword = await user.isValidatedPassword(
    req.body.oldPassword
  );
  if (!isCorrectOldPassword) {
    return next(new CustomError("Old password is incorrect", 400));
  }

  user.password = req.body.password;
  await user.save();

  cookieToken(user, res);
});

exports.updateUserDetails = bigPromise(async (req, res, next) => {
  // add a check for email and password
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.files) {
    const user = User.findById(req.user.id);
    const imageId = user.photo.id;

    // DELETE PHOTO ON CLOUDINARY
    const resp = await cloudinary.v2.uploader.destroy(imageId);

    // UPDATING PHOTO
    let file = req.files.photo;

    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Admin routes
exports.adminAllUsers = bigPromise(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});
exports.adminGetOneUser = bigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    next(new CustomError("No user Found.", 400));
  }

  res.status(200).json({
    success: true,
    user,
  });
});
exports.adminDeleteOneUser = bigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError("No such user found", 401));
  }

  const imageId = user.photo.id;
  await cloudinary.v2.uploader.destroy(imageId);

  await user.remove();

  res.status(200).json({
    success: true,
  });
});
exports.adminUpdateOneUserDetails = bigPromise(async (req, res, next) => {
  // add a check for email and password
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Manager routes
exports.managerAllUsers = bigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" });

  res.status(200).json({
    success: true,
    users,
  });
});
