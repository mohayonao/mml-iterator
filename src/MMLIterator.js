import Syntax from "./Syntax";
import DefaultConfig from "./DefaultConfig";
import MMLParser from "./MMLParser";
import constrain from "./utils/constrain";
import xtend from "./utils/xtend";

const ITERATOR = typeof Symbol !== "undefined" ? Symbol.iterator : "Symbol(Symbol.iterator)";

export default class MMLIterator {
  constructor(source, config = {}) {
    this.source = source;
    this.config = xtend(DefaultConfig, config);

    this._commands = new MMLParser(source).parse();
    this._commandIndex = 0;
    this._processedTime = 0;
    this._octave = this.config.defaultOctave;
    this._noteLength = [ this.config.defaultNoteLength ];
    this._quantize = this.config.defaultQuantize;
    this._volume = this.config.defaultVolume;
    this._tempo = this.config.defaultTempo;
    this._infiniteLoopIndex = -1;
    this._loopStack = [];
  }

  hasNext() {
    return this._commandIndex < this._commands.length;
  }

  forward() {
    if (!this.hasNext() && this._infiniteLoopIndex !== -1) {
      this._commandIndex = this._infiniteLoopIndex;
    }

    while (this.hasNext() && this._commands[this._commandIndex].type !== Syntax.Note) {
      let command = this._commands[this._commandIndex++];

      this[command.type](command);
    }

    return this._commands[this._commandIndex++] || {};
  }

  next() {
    let command = this.forward();

    if (command.type === Syntax.Note) {
      return { done: false, value: this[command.type](command) };
    } else {
      return { done: true, value: null };
    }
  }

  [ITERATOR]() {
    return this;
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
        elem = dotted = dotted * 2;
        break;
      default:
        prev = dotted = elem;
        break;
      }

      let value = elem !== null ? elem : this.config.defaultNoteLength;
      let length = constrain(value, this.config.minNoteLength, this.config.maxNoteLength);

      return (60 / this._tempo) * (4 / length);
    });

    return noteLength.reduce((a, b) => a + b, 0);
  }

  _calcNoteNumber(noteNumber) {
    return noteNumber + this._octave * 12 + 12;
  }

  [Syntax.Note](command) {
    let time = this._processedTime;
    let duration = this._calcDuration(command.noteLength);
    let gateTime = duration * (this._quantize / this.config.maxQuantize);
    let noteNumbers = command.noteNumbers.map(noteNumber => this._calcNoteNumber(noteNumber));
    let volume = this._volume / this.config.maxVolume;

    this._processedTime = this._processedTime + duration;

    return { time, duration, gateTime, noteNumbers, volume };
  }

  [Syntax.Octave](command) {
    let value = command.value !== null ? command.value : this.config.defaultOctave;
    let octave = constrain(value, this.config.minOctave, this.config.maxOctave);

    this._octave = octave;
  }

  [Syntax.OctaveShift](command) {
    let value = command.value !== null ? command.value : 1;
    let direction = command.direction * this.config.octaveShiftDirection;
    let octave = constrain(this._octave + value * direction, this.config.minOctave, this.config.maxOctave);

    this._octave = octave;
  }

  [Syntax.NoteLength](command) {
    let noteLength = command.noteLength.map((value) => {
      value = value !== null ? value : this.config.defaultNoteLength;

      return constrain(value, this.config.minNoteLength, this.config.maxNoteLength);
    });

    this._noteLength = noteLength;
  }

  [Syntax.NoteQuantize](command) {
    let value = command.value !== null ? command.value : this.config.defaultQuantize;
    let quantize = constrain(value, this.config.minQuantize, this.config.maxQuantize);

    this._quantize = quantize;
  }

  [Syntax.NoteVolume](command) {
    let value = command.value !== null ? command.value : this.config.defaultVolume;
    let volume = constrain(value, this.config.minVolume, this.config.maxVolume);

    this._volume = volume;
  }

  [Syntax.Tempo](command) {
    let value = command.value !== null ? command.value : this.config.defaultTempo;
    let tempo = constrain(value, this.config.minTempo, this.config.maxTempo);

    this._tempo = tempo;
  }

  [Syntax.InfiniteLoop]() {
    this._infiniteLoopIndex = this._commandIndex;
  }

  [Syntax.LoopBegin](command) {
    let value = command.value !== null ? command.value : this.config.defaultLoopCount;
    let loopCount = constrain(value, 1, this.config.maxLoopCount);
    let loopTopIndex = this._commandIndex;
    let loopOutIndex = -1;

    this._loopStack.push({ loopCount, loopTopIndex, loopOutIndex });
  }

  [Syntax.LoopExit]() {
    let looper = this._loopStack[this._loopStack.length - 1];
    let index = this._commandIndex;

    if (looper.loopCount <= 1 && looper.loopOutIndex !== -1) {
      index = looper.loopOutIndex;
    }

    this._commandIndex = index;
  }

  [Syntax.LoopEnd]() {
    let looper = this._loopStack[this._loopStack.length - 1];
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
