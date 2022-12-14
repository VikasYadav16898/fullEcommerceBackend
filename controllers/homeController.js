const BigPromise = require("../middlewares/bigPromise");
const { Ads, Company } = require("../models/testModels");
const User = require("../models/user");

exports.home = BigPromise(async (req, res) => {
  const result = await User.find()
    .where("_id")
    .in(["637c8de84b3a761791a3033a", "638b2c8f5376bb2ac46a4f7a"]);

  res.status(200).json({
    success: true,
    greetings: "Hello From Backend...",
    result,
  });
});

exports.addCompany = BigPromise(async (req, res) => {
  const { name, url } = req.body;
  console.log(name, url);

  await Company.create({ name: name, url: url });

  res.status(200).json({
    success: true,
  });
});

exports.addAds = BigPromise(async (req, res) => {
  const { primaryText, headline, description, cta, imageUrl, companyId } =
    req.body;

  await Ads.create({
    primaryText,
    headline,
    description,
    cta,
    imageUrl,
    companyId,
  });

  res.status(200).json({
    success: true,
  });
});

// exports.getAds = BigPromise(async (req, res) => {
//   const result = await Ads.find({
//     headline: { $regex: /chutki/, $options: "i" },
//   }).populate("companyId");

//   res.status(200).json({
//     success: true,
//     result,
//   });
// });

// exports.getAds = BigPromise(async (req, res) => {
//   const variable = "bheem";
//   const result = await Ads.find({})
//     .populate("companyId")
//     .find({
//       $or: [
//         { primaryText: new RegExp(variable, "i") },
//         { primaryText: new RegExp(variable, "i") },
//         { headline: new RegExp(variable, "i") },
//         { description: new RegExp(variable, "i") },
//         { companyId: { name: new RegExp(variable, "i") } },
//       ],
//     });

//   res.status(200).json({
//     success: true,
//     result,
//   });
// });

// exports.getAds = BigPromise(async (req, res) => {
//   const variable = "bheem";
//   const result = await Ads.aggregate([
//     {
//       $lookup: {
//         from: Company.collection.name,
//         localField: "companyId",
//         foreignField: "_id",
//         as: "companyData",
//       },
//     },
//     { $unwind: "$companyData" },
//     { $match: { primaryText: /chai/ } },
//   ]);

//   res.status(200).json({
//     success: true,
//     result,
//   });
// });
exports.getAds = BigPromise(async (req, res) => {
  const variable = "levis";
  const result = await Ads.aggregate([
    {
      $lookup: {
        from: Company.collection.name,
        localField: "companyId",
        foreignField: "_id",
        as: "companyData",
      },
    },
    { $unwind: "$companyData" },
    {
      $match: {
        $or: [
          { primaryText: new RegExp(variable, "i") },
          { primaryText: new RegExp(variable, "i") },
          { headline: new RegExp(variable, "i") },
          { description: new RegExp(variable, "i") },
          { "companyData.name": new RegExp(variable, "i") },
        ],
      },
    },
  ]);

  res.status(200).json({
    success: true,
    result,
  });
});
