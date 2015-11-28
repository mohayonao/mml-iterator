import assert from "power-assert";
import MMLIterator from "../src/MMLIterator";
import DefaultConfig from "../src/DefaultConfig";
import testCases from "./testCases.json";

function getIteratorResult(iter) {
  let result = [];

  while (result.length < 15) {
    let items = iter.next();

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
      let iter = new MMLIterator(source, DefaultConfig);
      let result = getIteratorResult(iter);
      let expected = testCases[source];

      assert.deepEqual(result, expected);
    });
  });
});
