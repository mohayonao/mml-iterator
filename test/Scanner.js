import assert from "power-assert";
import Scanner from "../src/Scanner";

describe("Scanner", () => {
  describe("constructor(source: string)", () => {
    it("works", () => {
      let scanner = new Scanner("");

      assert(scanner instanceof Scanner);
    });
  });
  describe("#hasNext(): boolean", () => {
    it("works", () => {
      let scanner = new Scanner("foo");

      assert(scanner.hasNext() === true);

      scanner.next();
      assert(scanner.hasNext() === true);

      scanner.next();
      assert(scanner.hasNext() === true);

      scanner.next();
      assert(scanner.hasNext() === false);
    });
  });
  describe("#peek(): string", () => {
    it("works", () => {
      let scanner = new Scanner("foo");

      assert(scanner.peek() === "f");
      assert(scanner.peek() === "f");

      scanner.next();

      assert(scanner.peek() === "o");
      assert(scanner.peek() === "o");

      scanner.next();

      assert(scanner.peek() === "o");
      assert(scanner.peek() === "o");

      scanner.next();

      assert(scanner.peek() === "");
      assert(scanner.peek() === "");
    });
  });
  describe("#next(): string", () => {
    it("works", () => {
      let scanner = new Scanner("foo");

      assert(scanner.next() === "f");
      assert(scanner.next() === "o");
      assert(scanner.next() === "o");
      assert(scanner.next() === "");
    });
  });
  describe("#forward(): void", () => {
    it("works", () => {
      let scanner = new Scanner("f   o   o");

      assert(scanner.next() === "f");

      scanner.forward();

      assert(scanner.next() === "o");

      scanner.forward();

      assert(scanner.next() === "o");

      scanner.forward();

      assert(scanner.next() === "");
    });
  });
  describe("#match(matcher: string|RegExp): boolean", () => {
    it("works with string", () => {
      let scanner = new Scanner("foo");

      assert(scanner.match("f") === true);
      assert(scanner.match("F") === false);
    });
    it("works with RegExp", () => {
      let scanner = new Scanner("foo");

      assert(scanner.match(/\w/) === true);
      assert(scanner.match(/F/i) === true);
    });
  });
  describe("#expect(matcher: string|RegExp): void throws SyntaxError", () => {
    it("works with string", () => {
      let scanner = new Scanner("foo");

      assert.doesNotThrow(() => {
        scanner.expect("f");
      });
      assert.throws(() => {
        scanner.expect("f");
      });
    });
    it("works with RegExp", () => {
      let scanner = new Scanner("foo");

      assert.doesNotThrow(() => {
        scanner.expect(/\w/);
      });
      assert.throws(() => {
        scanner.expect(/\d/);
      }, SyntaxError);
    });
  });
  describe("#scan(matcher: string|RegExp): string", () => {
    it("works with string", () => {
      let scanner = new Scanner("foo bar baz");

      assert(scanner.scan("foo") === "foo");
      assert(scanner.scan("foo") === null);
    });
    it("works with RegExp", () => {
      let scanner = new Scanner("foo bar baz");

      assert(scanner.scan(/\w+/) === "foo");
      assert(scanner.scan(/\w+/) === null);
    });
  });
  describe("#throwUnexpectedToken(): throws SyntaxError", () => {
    it("works with invalid token", () => {
      let scanner = new Scanner("foo bar baz");

      assert.throws(() => {
        scanner.throwUnexpectedToken();
      }, (err) => {
        return err instanceof SyntaxError && err.message === "Unexpected token: f";
      });
    });
    it("works with ILLEGAL token", () => {
      let scanner = new Scanner("");

      assert.throws(() => {
        scanner.throwUnexpectedToken();
      }, (err) => {
        return err instanceof SyntaxError && err.message === "Unexpected token: ILLEGAL";
      });
    });
  });
});
