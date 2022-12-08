const express = require("express");
const router = express.Router();

const {
  signUp,
  login,
  logout,
  forgotPassword,
  passwordReset,
  getLoggedInUserDetails,
  changePassword,
  updateUserDetails,
  adminAllUsers,
  managerAllUsers,
  adminGetOneUser,
  adminUpdateOneUserDetails,
  adminDeleteOneUser,
} = require("../controllers/userController");
const { isLoggedIn, customRole } = require("../middlewares/user");

router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/logout").get(logout);

router.route("/forgotpassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userdashboard/update").post(isLoggedIn, updateUserDetails);

// Admin routes
router
  .route("/admin/users")
  .get(isLoggedIn, customRole("admin"), adminAllUsers);
router
  .route("/admin/users/:id")
  .get(isLoggedIn, customRole("admin"), adminGetOneUser)
  .put(isLoggedIn, customRole("admin"), adminUpdateOneUserDetails)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneUser);

// Manager routes
router
  .route("/manager/users")
  .get(isLoggedIn, customRole("admin", "manager"), managerAllUsers);

module.exports = router;
