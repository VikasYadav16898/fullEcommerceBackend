const mongoose = require("mongoose");

const ads = new mongoose.Schema({
  primaryText: String,
  headline: String,
  description: String,
  cta: String,
  imageUrl: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
});

const company = new mongoose.Schema({
  name: String,
  url: String,
});

const Ads = mongoose.model("Ads", ads);
const Company = mongoose.model("Company", company);

module.exports = { Ads, Company };
