const { json } = require("express");
const Product = require("../models/product");

class WhereClause {
  constructor(base, bigQuery) {
    (this.base = base), (this.bigQuery = bigQuery);
  }

  search() {
    const searchWord = this.bigQuery.search
      ? {
          name: {
            $regex: this.bigQuery.search,
            $options: "i",
          },
        }
      : {};

    this.base = this.base.find({ ...searchWord });
    return this;
  }

  filter() {
    const copyQuerry = { ...this.bigQuery };
    delete copyQuerry["search"];
    delete copyQuerry["limit"];
    delete copyQuerry["page"];

    //convert copyQuerry into string
    let stringOfCopyQuery = JSON.stringify(copyQuerry);
    stringOfCopyQuery = stringOfCopyQuery.replace(
      /\b(gte|lte|gt|lt)\b/g,
      (m) => `$${m}`
    );
    let jsonOfCopyQuery = JSON.parse(stringOfCopyQuery);

    this.base = this.base.find(jsonOfCopyQuery);
    return this;
  }

  //   Pagination
  pager(resultPerPage) {
    let currentPage = 1;
    if (this.bigQuery.page) {
      currentPage = this.bigQuery.page;
    }

    this.base.limit(resultPerPage).skip(resultPerPage * (currentPage - 1));
    return this;
  }
}

module.exports = WhereClause;
