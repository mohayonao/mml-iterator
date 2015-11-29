import assert from "power-assert";
import MMLParser from "../src/MMLParser";
import Syntax from "../src/Syntax";

describe("MMLParser", () => {
  describe("constructor(source: string)", () => {
    it("works", () => {
      let parser = new MMLParser("");

      assert(parser instanceof MMLParser);
    });
  });
  describe("#parse(): object[]", () => {
    it("works", () => {
      let parser = new MMLParser("ceg");
      let result = parser.parse();

      assert(Array.isArray(result));
      assert(result.length === 3);
      assert(result.every(command => command.hasOwnProperty("type")));
    });
  });
  describe("#advance(): object", () => {
    it("works", () => {
      let parser = new MMLParser("cdefgab[ceg]ro><lqvt$/::/]");

      assert(parser.advance().type === Syntax.Note);
      assert(parser.advance().type === Syntax.Note);
      assert(parser.advance().type === Syntax.Note);
      assert(parser.advance().type === Syntax.Note);
      assert(parser.advance().type === Syntax.Note);
      assert(parser.advance().type === Syntax.Note);
      assert(parser.advance().type === Syntax.Note);
      assert(parser.advance().type === Syntax.Note);
      assert(parser.advance().type === Syntax.Note);
      assert(parser.advance().type === Syntax.Octave);
      assert(parser.advance().type === Syntax.OctaveShift);
      assert(parser.advance().type === Syntax.OctaveShift);
      assert(parser.advance().type === Syntax.NoteLength);
      assert(parser.advance().type === Syntax.NoteQuantize);
      assert(parser.advance().type === Syntax.NoteVelocity);
      assert(parser.advance().type === Syntax.Tempo);
      assert(parser.advance().type === Syntax.InfiniteLoop);
      assert(Array.isArray(parser.advance()));
      assert.throws(() => {
        parser.advance();
      }, SyntaxError);
    });
  });
  describe("#readNote(): object", () => {
    it("c", () => {
      let parser = new MMLParser("c");

      assert.deepEqual(parser.readNote(), {
        type: Syntax.Note,
        noteNumbers: [ 0 ],
        noteLength: [ null ]
      });
    });
    it("c4", () => {
      let parser = new MMLParser("c4");

      assert.deepEqual(parser.readNote(), {
        type: Syntax.Note,
        noteNumbers: [ 0 ],
        noteLength: [ 4 ]
      });
    });
    it("c8..", () => {
      let parser = new MMLParser("c8..");

      assert.deepEqual(parser.readNote(), {
        type: Syntax.Note,
        noteNumbers: [ 0 ],
        noteLength: [ 8, 0, 0 ]
      });
    });
    it("c4^16", () => {
      let parser = new MMLParser("c4^16");

      assert.deepEqual(parser.readNote(), {
        type: Syntax.Note,
        noteNumbers: [ 0 ],
        noteLength: [ 4, 16 ]
      });
    });
    it("c+", () => {
      let parser = new MMLParser("c+");

      assert.deepEqual(parser.readNote(), {
        type: Syntax.Note,
        noteNumbers: [ 1 ],
        noteLength: [ null ]
      });
    });
    it("d-", () => {
      let parser = new MMLParser("d-");

      assert.deepEqual(parser.readNote(), {
        type: Syntax.Note,
        noteNumbers: [ 1 ],
        noteLength: [ null ]
      });
    });
  });
  describe("#readChord(): object", () => {
    it("[]", () => {
      let parser = new MMLParser("[]");

      assert.deepEqual(parser.readChord(), {
        type: Syntax.Note,
        noteNumbers: [],
        noteLength: [ null ]
      });
    });
    it("[ ceg ]", () => {
      let parser = new MMLParser("[ ceg ]");

      assert.deepEqual(parser.readChord(), {
        type: Syntax.Note,
        noteNumbers: [ 0, 4, 7 ],
        noteLength: [ null ]
      });
    });
    it("[ ceg ]2", () => {
      let parser = new MMLParser("[ ceg ]2");

      assert.deepEqual(parser.readChord(), {
        type: Syntax.Note,
        noteNumbers: [ 0, 4, 7 ],
        noteLength: [ 2 ]
      });
    });
    it("[ >g<ce ]", () => {
      let parser = new MMLParser("[ <g>ce ]");

      assert.deepEqual(parser.readChord(), {
        type: Syntax.Note,
        noteNumbers: [ -5, 0, 4 ],
        noteLength: [ null ]
      });
    });
    it("[ gce. ] throws SyntaxError", () => {
      let parser = new MMLParser("[ gce. ]");

      assert.throws(() => {
        parser.readChord();
      }, SyntaxError);
    });
  });
  describe("#readRest(): object", () => {
    it("r", () => {
      let parser = new MMLParser("r");

      assert.deepEqual(parser.readRest(), {
        type: Syntax.Note,
        noteNumbers: [],
        noteLength: [ null ]
      });
    });
    it("r4", () => {
      let parser = new MMLParser("r4");

      assert.deepEqual(parser.readRest(), {
        type: Syntax.Note,
        noteNumbers: [],
        noteLength: [ 4 ]
      });
    });
    it("r8..", () => {
      let parser = new MMLParser("r8..");

      assert.deepEqual(parser.readRest(), {
        type: Syntax.Note,
        noteNumbers: [],
        noteLength: [ 8, 0, 0 ]
      });
    });
    it("r4^16", () => {
      let parser = new MMLParser("r4^16");

      assert.deepEqual(parser.readRest(), {
        type: Syntax.Note,
        noteNumbers: [],
        noteLength: [ 4, 16 ]
      });
    });
  });
  describe("#readOctave(): object", () => {
    it("o", () => {
      let parser = new MMLParser("o");

      assert.deepEqual(parser.readOctave(), {
        type: Syntax.Octave,
        value: null
      });
    });
    it("o4", () => {
      let parser = new MMLParser("o4");

      assert.deepEqual(parser.readOctave(), {
        type: Syntax.Octave,
        value: 4
      });
    });
  });
  describe("#readOctaveShift(): object", () => {
    it("<", () => {
      let parser = new MMLParser("<");

      assert.deepEqual(parser.readOctaveShift(1), {
        type: Syntax.OctaveShift,
        direction: 1,
        value: null
      });
    });
    it(">2", () => {
      let parser = new MMLParser(">2");

      assert.deepEqual(parser.readOctaveShift(-1), {
        type: Syntax.OctaveShift,
        direction: -1,
        value: 2
      });
    });
  });
  describe("#readNoteLength(): object", () => {
    it("l", () => {
      let parser = new MMLParser("l");

      assert.deepEqual(parser.readNoteLength(), {
        type: Syntax.NoteLength,
        noteLength: [ null ]
      });
    });
    it("l4", () => {
      let parser = new MMLParser("l4");

      assert.deepEqual(parser.readNoteLength(), {
        type: Syntax.NoteLength,
        noteLength: [ 4 ]
      });
    });
    it("l8..", () => {
      let parser = new MMLParser("l8..");

      assert.deepEqual(parser.readNoteLength(), {
        type: Syntax.NoteLength,
        noteLength: [ 8, 0, 0 ]
      });
    });
    it("l4^16", () => {
      let parser = new MMLParser("l4^16");

      assert.deepEqual(parser.readNoteLength(), {
        type: Syntax.NoteLength,
        noteLength: [ 4, 16 ]
      });
    });
  });
  describe("#readNoteQuantize(): object", () => {
    it("q", () => {
      let parser = new MMLParser("q");

      assert.deepEqual(parser.readNoteQuantize(), {
        type: Syntax.NoteQuantize,
        value: null
      });
    });
    it("q4", () => {
      let parser = new MMLParser("q4");

      assert.deepEqual(parser.readNoteQuantize(), {
        type: Syntax.NoteQuantize,
        value: 4
      });
    });
  });
  describe("#readNoteVelocity(): object", () => {
    it("q", () => {
      let parser = new MMLParser("v");

      assert.deepEqual(parser.readNoteVelocity(), {
        type: Syntax.NoteVelocity,
        value: null
      });
    });
    it("q4", () => {
      let parser = new MMLParser("v4");

      assert.deepEqual(parser.readNoteVelocity(), {
        type: Syntax.NoteVelocity,
        value: 4
      });
    });
  });
  describe("#readTempo(): object", () => {
    it("t", () => {
      let parser = new MMLParser("t");

      assert.deepEqual(parser.readTempo(), {
        type: Syntax.Tempo,
        value: null
      });
    });
    it("t80", () => {
      let parser = new MMLParser("t80");

      assert.deepEqual(parser.readTempo(), {
        type: Syntax.Tempo,
        value: 80
      });
    });
  });
  describe("#readInfiniteLoop(): object", () => {
    it("$", () => {
      let parser = new MMLParser("$");

      assert.deepEqual(parser.readInfiniteLoop(), {
        type: Syntax.InfiniteLoop
      });
    });
  });
  describe("#readLoop(): object", () => {
    it("/::/", () => {
      let parser = new MMLParser("/::/");

      assert.deepEqual(parser.readLoop(), [
        {
          type: Syntax.LoopBegin,
          value: null
        },
        {
          type: Syntax.LoopEnd
        }
      ]);
    });
    it("/:c:/16", () => {
      let parser = new MMLParser("/:c:/16");

      assert.deepEqual(parser.readLoop(), [
        {
          type: Syntax.LoopBegin,
          value: 16
        },
        {
          type: Syntax.Note,
          noteNumbers: [ 0 ],
          noteLength: [ null ]
        },
        {
          type: Syntax.LoopEnd
        }
      ]);
    });
    it("/:c|r:/16", () => {
      let parser = new MMLParser("/:c|r:/16");

      assert.deepEqual(parser.readLoop(), [
        {
          type: Syntax.LoopBegin,
          value: 16
        },
        {
          type: Syntax.Note,
          noteNumbers: [ 0 ],
          noteLength: [ null ]
        },
        {
          type: Syntax.LoopExit
        },
        {
          type: Syntax.Note,
          noteNumbers: [],
          noteLength: [ null ]
        },
        {
          type: Syntax.LoopEnd
        }
      ]);
    });
  });
});
