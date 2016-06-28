"use strict";

const Syntax = require("./Syntax");
const DefaultParams = require("./DefaultParams");
const MMLParser = require("./MMLParser");
const ITERATOR = typeof Symbol !== "undefined" ? Symbol.iterator : "@@iterator";

 class MMLIterator {
  constructor(source) {
    this.source = source;

    this._commands = new MMLParser(source).parse();
    this._commandIndex = 0;
    this._processedTime = 0;
    this._iterator = null;
    this._octave = DefaultParams.octave;
    this._noteLength = [ DefaultParams.length ];
    this._velocity = DefaultParams.velocity;
    this._quantize = DefaultParams.quantize;
    this._tempo = DefaultParams.tempo;
    this._infiniteLoopIndex = -1;
    this._loopStack = [];
    this._done = false;
  }

  hasNext() {
    return this._commandIndex < this._commands.length;
  }

  next() {
    if (this._done) {
      return { done: true, value: null };
    }

    if (this._iterator) {
      const iterItem = this._iterator.next();

      if (!iterItem.done) {
        return iterItem;
      }
    }

    const command = this._forward(true);

    if (isNoteEvent(command)) {
      this._iterator = this[command.type](command);
    } else {
      this._done = true;
      return { done: false, value: { type: "end", time: this._processedTime } };
    }

    return this.next();
  }

  [ITERATOR]() {
    return this;
  }

  _forward(forward) {
    while (this.hasNext() && !isNoteEvent(this._commands[this._commandIndex])) {
      const command = this._commands[this._commandIndex++];

      this[command.type](command);
    }

    if (forward && !this.hasNext() && this._infiniteLoopIndex !== -1) {
      this._commandIndex = this._infiniteLoopIndex;

      return this._forward(false);
    }

    return this._commands[this._commandIndex++] || {};
  }

  _calcDuration(noteLength) {
    if (noteLength[0] === null) {
      noteLength = this._noteLength.concat(noteLength.slice(1));
    }

    let prev = null;
    let dotted = 0;

    noteLength = noteLength.map((elem) => {
      switch (elem) {
      case null:
        elem = prev;
        break;
      case 0:
        elem = (dotted *= 2);
        break;
      default:
        prev = dotted = elem;
        break;
      }

      const length = elem !== null ? elem : DefaultParams.length;

      return (60 / this._tempo) * (4 / length);
    });

    return noteLength.reduce((a, b) => a + b, 0);
  }

  _calcNoteNumber(noteNumber) {
    return noteNumber + this._octave * 12 + 12;
  }

  [Syntax.Note](command) {
    const type = "note";
    const time = this._processedTime;
    const duration = this._calcDuration(command.noteLength);
    const noteNumbers = command.noteNumbers.map(noteNumber => this._calcNoteNumber(noteNumber));
    const quantize = this._quantize;
    const velocity = this._velocity;

    this._processedTime = this._processedTime + duration;

    return arrayToIterator(noteNumbers.map((noteNumber) => {
      return { type, time, duration, noteNumber, velocity, quantize };
    }));
  }

  [Syntax.Rest](command) {
    const duration = this._calcDuration(command.noteLength);

    this._processedTime = this._processedTime + duration;
  }

  [Syntax.Octave](command) {
    this._octave = command.value !== null ? command.value : DefaultParams.octave;
  }

  [Syntax.OctaveShift](command) {
    const value = command.value !== null ? command.value : 1;

    this._octave += value * command.direction;
  }

  [Syntax.NoteLength](command) {
    const noteLength = command.noteLength.map(value => value !== null ? value : DefaultParams.length);

    this._noteLength = noteLength;
  }

  [Syntax.NoteVelocity](command) {
    this._velocity = command.value !== null ? command.value : DefaultParams.velocity;
  }

  [Syntax.NoteQuantize](command) {
    this._quantize = command.value !== null ? command.value : DefaultParams.quantize;
  }

  [Syntax.Tempo](command) {
    this._tempo = command.value !== null ? command.value : DefaultParams.tempo;
  }

  [Syntax.InfiniteLoop]() {
    this._infiniteLoopIndex = this._commandIndex;
  }

  [Syntax.LoopBegin](command) {
    const loopCount = command.value !== null ? command.value : DefaultParams.loopCount;
    const loopTopIndex = this._commandIndex;
    const loopOutIndex = -1;

    this._loopStack.push({ loopCount, loopTopIndex, loopOutIndex });
  }

  [Syntax.LoopExit]() {
    const looper = this._loopStack[this._loopStack.length - 1];

    let index = this._commandIndex;

    if (looper.loopCount <= 1 && looper.loopOutIndex !== -1) {
      index = looper.loopOutIndex;
    }

    this._commandIndex = index;
  }

  [Syntax.LoopEnd]() {
    const looper = this._loopStack[this._loopStack.length - 1];

    let index = this._commandIndex;

    if (looper.loopOutIndex === -1) {
      looper.loopOutIndex = this._commandIndex;
    }
    looper.loopCount -= 1;

    if (0 < looper.loopCount) {
      index = looper.loopTopIndex;
    } else {
      this._loopStack.pop();
    }

    this._commandIndex = index;
  }
}

function arrayToIterator(array) {
  let index = 0;

  return {
    next() {
      if (index < array.length) {
        return { done: false, value: array[index++] };
      }
      return { done: true };
    }
  };
}

function isNoteEvent(command) {
  return command.type === Syntax.Note || command.type === Syntax.Rest;
}

module.exports = MMLIterator;
