import assert from "power-assert";
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
      let iter = new MMLIterator("");

      assert(iter.hasNext() === false);
    });
    it("works", () => {
      let iter = new MMLIterator("cde");

      assert(iter.hasNext() === true);
    });
  });
  describe("#next(): { done: boolean, value: object[] }", () => {
    it("works with interval: 0.5", () => {
      let iter = new MMLIterator("ceg");

      assert.deepEqual(iter.next(), {
        done: false,
        value: { time: 0.0, duration: 0.5, noteNumber: 60, velocity: 100, quantize: 75 },
      });
      assert.deepEqual(iter.next(), {
        done: false,
        value: { time: 0.5, duration: 0.5, noteNumber: 64, velocity: 100, quantize: 75 },
      });
      assert.deepEqual(iter.next(), {
        done: false,
        value: { time: 1.0, duration: 0.5, noteNumber: 67, velocity: 100, quantize: 75 },
      });
      assert.deepEqual(iter.next(), {
        done: true,
        value: null,
      });
    });
  });
  describe("#[Symbol.iterator]: Iterator", () => {
    it("works", () => {
      let iter = new MMLIterator("ceg");
      let result = [];

      for (let items of iter) {
        result.push(items);
      }

      assert.deepEqual(result, [
        { time: 0.0, duration: 0.5, noteNumber: 60, velocity: 100, quantize: 75 },
        { time: 0.5, duration: 0.5, noteNumber: 64, velocity: 100, quantize: 75 },
        { time: 1.0, duration: 0.5, noteNumber: 67, velocity: 100, quantize: 75 },
      ]);
    });
  });
});
