"use strict";

const assert = require("power-assert");
const index = require("../src");
const MMLIterator = require("../src/MMLIterator");

describe("index", () => {
  it("exports", () => {
    assert(index === MMLIterator);
  });
});
