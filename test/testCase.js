"use strict";

const assert = require("power-assert");
const MMLIterator = require("../src/MMLIterator");
const testCases = require("./testCases.json");

function getIteratorResult(iter) {
  const result = [];

  while (result.length < 15) {
    const items = iter.next();

    if (items.done) {
      break;
    }

    result.push(items.value);
  }

  return result;
}

describe("test", () => {
  Object.keys(testCases).forEach((source) => {
    it(source, () => {
      const iter = new MMLIterator(source);
      const result = getIteratorResult(iter);
      const expected = testCases[source];

      assert.deepEqual(result, expected);
    });
  });
});
