import assert from "power-assert";
import index from "../src";
import MMLIterator from "../src/MMLIterator";

describe("index", () => {
  it("exports", () => {
    assert(index === MMLIterator);
  });
});
