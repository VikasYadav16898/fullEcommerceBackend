const router = require("express").Router();
const {
  home,
  addCompany,
  addAds,
  getAds,
} = require("../controllers/homeController");

router.route("/").get(home);
router.route("/company").post(addCompany);
router.route("/ads").post(addAds).get(getAds);

module.exports = router;
