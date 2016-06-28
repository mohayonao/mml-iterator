"use strict";

const assert = require("power-assert");
const MMLParser = require("../src/MMLParser");
const Syntax = require("../src/Syntax");

describe("MMLParser", () => {
  describe("constructor(source: string)", () => {
    it("works", () => {
      const parser = new MMLParser("");

      assert(parser instanceof MMLParser);
    });
  });
  describe("#parse(): object[]", () => {
    it("works", () => {
      const parser = new MMLParser("ceg");
      const result = parser.parse();

      assert(Array.isArray(result));
      assert(result.length === 3);
      assert(result.every(command => command.hasOwnProperty("type")));
    });
  });
  describe("#advance(): object", () => {
    it("works", () => {
      const parser = new MMLParser("cdefgab[ceg]ro><lqvt$/::/]");

      assert(parser.advance().type === Syntax.Note);
      assert(parser.advance().type === Syntax.Note);
      assert(parser.advance().type === Syntax.Note);
      assert(parser.advance().type === Syntax.Note);
      assert(parser.advance().type === Syntax.Note);
      assert(parser.advance().type === Syntax.Note);
      assert(parser.advance().type === Syntax.Note);
      assert(parser.advance().type === Syntax.Note);
      assert(parser.advance().type === Syntax.Rest);
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
      const parser = new MMLParser("c");

      assert.deepEqual(parser.readNote(), {
        type: Syntax.Note,
        noteNumbers: [ 0 ],
        noteLength: [ null ]
      });
    });
    it("c4", () => {
      const parser = new MMLParser("c4");

      assert.deepEqual(parser.readNote(), {
        type: Syntax.Note,
        noteNumbers: [ 0 ],
        noteLength: [ 4 ]
      });
    });
    it("c8..", () => {
      const parser = new MMLParser("c8..");

      assert.deepEqual(parser.readNote(), {
        type: Syntax.Note,
        noteNumbers: [ 0 ],
        noteLength: [ 8, 0, 0 ]
      });
    });
    it("c4^16", () => {
      const parser = new MMLParser("c4^16");

      assert.deepEqual(parser.readNote(), {
        type: Syntax.Note,
        noteNumbers: [ 0 ],
        noteLength: [ 4, 16 ]
      });
    });
    it("c+", () => {
      const parser = new MMLParser("c+");

      assert.deepEqual(parser.readNote(), {
        type: Syntax.Note,
        noteNumbers: [ 1 ],
        noteLength: [ null ]
      });
    });
    it("d-", () => {
      const parser = new MMLParser("d-");

      assert.deepEqual(parser.readNote(), {
        type: Syntax.Note,
        noteNumbers: [ 1 ],
        noteLength: [ null ]
      });
    });
  });
  describe("#readChord(): object", () => {
    it("[]", () => {
      const parser = new MMLParser("[]");

      assert.deepEqual(parser.readChord(), {
        type: Syntax.Note,
        noteNumbers: [],
        noteLength: [ null ]
      });
    });
    it("[ ceg ]", () => {
      const parser = new MMLParser("[ ceg ]");

      assert.deepEqual(parser.readChord(), {
        type: Syntax.Note,
        noteNumbers: [ 0, 4, 7 ],
        noteLength: [ null ]
      });
    });
    it("[ ceg ]2", () => {
      const parser = new MMLParser("[ ceg ]2");

      assert.deepEqual(parser.readChord(), {
        type: Syntax.Note,
        noteNumbers: [ 0, 4, 7 ],
        noteLength: [ 2 ]
      });
    });
    it("[ >g<ce ]", () => {
      const parser = new MMLParser("[ <g>ce ]");

      assert.deepEqual(parser.readChord(), {
        type: Syntax.Note,
        noteNumbers: [ -5, 0, 4 ],
        noteLength: [ null ]
      });
    });
    it("[ gce. ] throws SyntaxError", () => {
      const parser = new MMLParser("[ gce. ]");

      assert.throws(() => {
        parser.readChord();
      }, SyntaxError);
    });
  });
  describe("#readRest(): object", () => {
    it("r", () => {
      const parser = new MMLParser("r");

      assert.deepEqual(parser.readRest(), {
        type: Syntax.Rest,
        noteLength: [ null ]
      });
    });
    it("r4", () => {
      const parser = new MMLParser("r4");

      assert.deepEqual(parser.readRest(), {
        type: Syntax.Rest,
        noteLength: [ 4 ]
      });
    });
    it("r8..", () => {
      const parser = new MMLParser("r8..");

      assert.deepEqual(parser.readRest(), {
        type: Syntax.Rest,
        noteLength: [ 8, 0, 0 ]
      });
    });
    it("r4^16", () => {
      const parser = new MMLParser("r4^16");

      assert.deepEqual(parser.readRest(), {
        type: Syntax.Rest,
        noteLength: [ 4, 16 ]
      });
    });
  });
  describe("#readOctave(): object", () => {
    it("o", () => {
      const parser = new MMLParser("o");

      assert.deepEqual(parser.readOctave(), {
        type: Syntax.Octave,
        value: null
      });
    });
    it("o4", () => {
      const parser = new MMLParser("o4");

      assert.deepEqual(parser.readOctave(), {
        type: Syntax.Octave,
        value: 4
      });
    });
  });
  describe("#readOctaveShift(): object", () => {
    it("<", () => {
      const parser = new MMLParser("<");

      assert.deepEqual(parser.readOctaveShift(1), {
        type: Syntax.OctaveShift,
        direction: 1,
        value: null
      });
    });
    it(">2", () => {
      const parser = new MMLParser(">2");

      assert.deepEqual(parser.readOctaveShift(-1), {
        type: Syntax.OctaveShift,
        direction: -1,
        value: 2
      });
    });
  });
  describe("#readNoteLength(): object", () => {
    it("l", () => {
      const parser = new MMLParser("l");

      assert.deepEqual(parser.readNoteLength(), {
        type: Syntax.NoteLength,
        noteLength: [ null ]
      });
    });
    it("l4", () => {
      const parser = new MMLParser("l4");

      assert.deepEqual(parser.readNoteLength(), {
        type: Syntax.NoteLength,
        noteLength: [ 4 ]
      });
    });
    it("l8..", () => {
      const parser = new MMLParser("l8..");

      assert.deepEqual(parser.readNoteLength(), {
        type: Syntax.NoteLength,
        noteLength: [ 8, 0, 0 ]
      });
    });
    it("l4^16", () => {
      const parser = new MMLParser("l4^16");

      assert.deepEqual(parser.readNoteLength(), {
        type: Syntax.NoteLength,
        noteLength: [ 4, 16 ]
      });
    });
  });
  describe("#readNoteQuantize(): object", () => {
    it("q", () => {
      const parser = new MMLParser("q");

      assert.deepEqual(parser.readNoteQuantize(), {
        type: Syntax.NoteQuantize,
        value: null
      });
    });
    it("q4", () => {
      const parser = new MMLParser("q4");

      assert.deepEqual(parser.readNoteQuantize(), {
        type: Syntax.NoteQuantize,
        value: 4
      });
    });
  });
  describe("#readNoteVelocity(): object", () => {
    it("q", () => {
      const parser = new MMLParser("v");

      assert.deepEqual(parser.readNoteVelocity(), {
        type: Syntax.NoteVelocity,
        value: null
      });
    });
    it("q4", () => {
      const parser = new MMLParser("v4");

      assert.deepEqual(parser.readNoteVelocity(), {
        type: Syntax.NoteVelocity,
        value: 4
      });
    });
  });
  describe("#readTempo(): object", () => {
    it("t", () => {
      const parser = new MMLParser("t");

      assert.deepEqual(parser.readTempo(), {
        type: Syntax.Tempo,
        value: null
      });
    });
    it("t80", () => {
      const parser = new MMLParser("t80");

      assert.deepEqual(parser.readTempo(), {
        type: Syntax.Tempo,
        value: 80
      });
    });
  });
  describe("#readInfiniteLoop(): object", () => {
    it("$", () => {
      const parser = new MMLParser("$");

      assert.deepEqual(parser.readInfiniteLoop(), {
        type: Syntax.InfiniteLoop
      });
    });
  });
  describe("#readLoop(): object", () => {
    it("/::/", () => {
      const parser = new MMLParser("/::/");

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
      const parser = new MMLParser("/:c:/16");

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
      const parser = new MMLParser("/:c|r:/16");

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
          type: Syntax.Rest,
          noteLength: [ null ]
        },
        {
          type: Syntax.LoopEnd
        }
      ]);
    });
  });
});
