import assert from "power-assert";
import DefaultConfig from "../src/DefaultConfig";
import MMLIterator from "../src/MMLIterator";

describe("MMLIterator", () => {
  describe("constructor(source: string, config: object)", () => {
    it("works", () => {
      let iter = new MMLIterator("");

      assert(iter instanceof MMLIterator);
    });
  });
  describe("#hasNext(): boolean", () => {
    it("works", () => {
      let iter = new MMLIterator("", DefaultConfig);

      assert(iter.hasNext() === false);
    });
    it("works", () => {
      let iter = new MMLIterator("cde", DefaultConfig);

      assert(iter.hasNext() === true);
    });
  });
  describe("#next(): { done: boolean, value: object[] }", () => {
    it("works with interval: 0.5", () => {
      let iter = new MMLIterator("ceg", DefaultConfig);

      assert.deepEqual(iter.next(), {
        done: false,
        value: { time: 0, duration: 0.5, gateTime: 0.375, noteNumbers: [ 72 ], volume: 0.75 }
      });
      assert.deepEqual(iter.next(), {
        done: false,
        value: { time: 0.5, duration: 0.5, gateTime: 0.375, noteNumbers: [ 76 ], volume: 0.75 }
      });
      assert.deepEqual(iter.next(), {
        done: false,
        value: { time: 1, duration: 0.5, gateTime: 0.375, noteNumbers: [ 79 ], volume: 0.75 }
      });
      assert.deepEqual(iter.next(), {
        done: true,
        value: null
      });
    });
  });
  describe("#[Symbol.iterator]: Iterator", () => {
    it("works", () => {
      let iter = new MMLIterator("ceg", DefaultConfig);
      let result = [];

      for (let items of iter) {
        result.push(items);
      }

      assert.deepEqual(result, [
        { time: 0, duration: 0.5, gateTime: 0.375, noteNumbers: [ 72 ], volume: 0.75 },
        { time: 0.5, duration: 0.5, gateTime: 0.375, noteNumbers: [ 76 ], volume: 0.75 },
        { time: 1, duration: 0.5, gateTime: 0.375, noteNumbers: [ 79 ], volume: 0.75 }
      ]);
    });
  });
});
