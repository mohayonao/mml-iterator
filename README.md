# mml-iterator
[![Build Status](http://img.shields.io/travis/mohayonao/mml-iterator.svg?style=flat-square)](https://travis-ci.org/mohayonao/mml-iterator)
[![NPM Version](http://img.shields.io/npm/v/mml-iterator.svg?style=flat-square)](https://www.npmjs.org/package/mml-iterator)
[![License](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://mohayonao.mit-license.org/)

> MML(Music Macro Language) Iterator

## Installation

```
$ npm install mml-iterator
```

## API
### MMLIterator
- `constructor(source: string, config = {})`

#### Instance methods
- `next(): { done: boolean, value: object }`
- `[Symbol.iterator]: self`

## Example

```js
import MMLIterator from "mml-iterator";

let iter = new MMLIterator("t120 ceg<c");

for (let noteEvent of iter) {
  console.log(noteEvent);
}
```

```js
{ time: 0.0, duration: 0.5, gateTime: 0.375, noteNumbers: [ 72 ], volume: 0.75 }
{ time: 0.5, duration: 0.5, gateTime: 0.375, noteNumbers: [ 76 ], volume: 0.75 }
{ time: 1.0, duration: 0.5, gateTime: 0.375, noteNumbers: [ 79 ], volume: 0.75 }
{ time: 1.5, duration: 0.5, gateTime: 0.375, noteNumbers: [ 84 ], volume: 0.75 }
```

## MML Syntax
### NoteEvent
- [__cdefgab__][__-+__]?(\\d+)?\\.*
  - note on (1-64, default: l)
  - e.g. `c e-8. g16`
- __[__ ([__cdefgab__][__-+__]?|[__<>__])+ __]__(\\d+)?\\.*
  - chord (1-64, default: l)
  - e.g. `[ >g<ce ]2 [ >gb<d ]2 [ >g<ce ]1`
- __r__(\\d+)?\\.*
  - rest (1-64, default: l)
  - e.g. `l16 crcc crcc crccr crcc`

### NoteLength
- __l__(\\d+)?\\.*
  - length (1-64, default: 4)
  - e.g. `l8 cc l4 e l2 g`
- __^__(\\d+)?\\.*
  - tie (1-64, default: l)
  - e.g `l16 c^^ e^^ g^`
- __q__(\\d+)?
  - quantize (0-8, default: 6)
  - e.g. `l16 q2 crcc crcc crcc crcc`

### NotePitch
- __o__(\\d+)?
  - octave (0-9, default: 5)
  - e.g. `o4 ceg o5 c`
- __<__(\\d+)?
  - octave up (1-9, default: 1)
  - e.g. `ceg < c`
- __>__(\\d+)?
  - octave down (1-9, default: 1)
  - e.g. `c > gec`

### Control
- __t__(\\d+)?
  - tempo (30-240, default: 120)
  - e.g. `t140 cdefgab<c`
- __v__(\\d+)?
  - volume (0-16, default: 12)
  - e.g. `v8 c v4 e v2 g`
- __$__
  - infinite loop
  - e.g. `l2 $ [fa<ce] [gb<d] [egb<d] [ea<c]`
- __/:__ ... __|__ ... __:/__(\\d+)?
  - loop (1-999, default: 2)
  - commands after __|__ are skipped in the last loop
  - e.g. `l2 /: [fa<ce] [gb<d] [egb<d] | [ea<c] :/4 [eg<c]`

## Configuration
```json
{
  "defaultTempo": 120,
  "minTempo": 30,
  "maxTempo": 240,
  "defaultOctave": 5,
  "minOctave": 0,
  "maxOctave": 9,
  "defaultNoteLength": 4,
  "minNoteLength": 1,
  "maxNoteLength": 64,
  "defaultQuantize": 6,
  "minQuantize": 0,
  "maxQuantize": 8,
  "defaultVolume": 12,
  "minVolume": 0,
  "maxVolume": 16,
  "defaultLoopCount": 2,
  "maxLoopCount": 999,
  "octaveShiftDirection": 1
}
```

## License

MIT
