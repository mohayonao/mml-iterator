"use strict";

const assert = require("power-assert");
const MMLIterator = require("../src/MMLIterator");

describe("MMLIterator", () => {
  describe("constructor(source: string, config: object)", () => {
    it("works", () => {
      const iter = new MMLIterator("");

      assert(iter instanceof MMLIterator);
    });
  });
  describe("#hasNext(): boolean", () => {
    it("works", () => {
      const iter = new MMLIterator("");

      assert(iter.hasNext() === false);
    });
    it("works", () => {
      const iter = new MMLIterator("cde");

      assert(iter.hasNext() === true);
    });
  });
  describe("#next(): { done: boolean, value: object[] }", () => {
    it("works with interval: 0.5", () => {
      const iter = new MMLIterator("ceg");

      assert.deepEqual(iter.next(), {
        done: false,
        value: { type: "note", time: 0.0, duration: 0.5, noteNumber: 60, velocity: 100, quantize: 75 }
      });
      assert.deepEqual(iter.next(), {
        done: false,
        value: { type: "note", time: 0.5, duration: 0.5, noteNumber: 64, velocity: 100, quantize: 75 }
      });
      assert.deepEqual(iter.next(), {
        done: false,
        value: { type: "note", time: 1.0, duration: 0.5, noteNumber: 67, velocity: 100, quantize: 75 }
      });
      assert.deepEqual(iter.next(), {
        done: false,
        value: { type: "end", time: 1.5 }
      });
      assert.deepEqual(iter.next(), {
        done: true,
        value: null
      });
    });
  });
  describe("#[Symbol.iterator]: Iterator", () => {
    it("works", () => {
      const iter = new MMLIterator("ceg");
      const result = [];

      for (let items of iter) {
        result.push(items);
      }

      assert.deepEqual(result, [
        { type: "note", time: 0.0, duration: 0.5, noteNumber: 60, velocity: 100, quantize: 75 },
        { type: "note", time: 0.5, duration: 0.5, noteNumber: 64, velocity: 100, quantize: 75 },
        { type: "note", time: 1.0, duration: 0.5, noteNumber: 67, velocity: 100, quantize: 75 },
        { type: "end", time: 1.5 }
      ]);
    });
  });
});
