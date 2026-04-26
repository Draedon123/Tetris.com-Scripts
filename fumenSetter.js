var Piece = /* @__PURE__ */ ((Piece2) => {
  Piece2[(Piece2["Empty"] = 0)] = "Empty";
  Piece2[(Piece2["I"] = 1)] = "I";
  Piece2[(Piece2["L"] = 2)] = "L";
  Piece2[(Piece2["O"] = 3)] = "O";
  Piece2[(Piece2["Z"] = 4)] = "Z";
  Piece2[(Piece2["T"] = 5)] = "T";
  Piece2[(Piece2["J"] = 6)] = "J";
  Piece2[(Piece2["S"] = 7)] = "S";
  Piece2[(Piece2["Gray"] = 8)] = "Gray";
  return Piece2;
})(Piece || {});
function isMinoPiece(piece) {
  return piece !== 0 && piece !== 8;
}
function parsePieceName(piece) {
  switch (piece) {
    case 1:
      return "I";
    case 2:
      return "L";
    case 3:
      return "O";
    case 4:
      return "Z";
    case 5:
      return "T";
    case 6:
      return "J";
    case 7:
      return "S";
    case 8:
      return "X";
    case 0:
      return "_";
  }
  throw new Error(`Unknown piece: ${piece}`);
}
function parsePiece(piece) {
  switch (piece.toUpperCase()) {
    case "I":
      return 1;
    case "L":
      return 2;
    case "O":
      return 3;
    case "Z":
      return 4;
    case "T":
      return 5;
    case "J":
      return 6;
    case "S":
      return 7;
    case "X":
    case "GRAY":
      return 8;
    case " ":
    case "_":
    case "EMPTY":
      return 0;
  }
  throw new Error(`Unknown piece: ${piece}`);
}
var Rotation = /* @__PURE__ */ ((Rotation2) => {
  Rotation2[(Rotation2["Spawn"] = 0)] = "Spawn";
  Rotation2[(Rotation2["Right"] = 1)] = "Right";
  Rotation2[(Rotation2["Reverse"] = 2)] = "Reverse";
  Rotation2[(Rotation2["Left"] = 3)] = "Left";
  return Rotation2;
})(Rotation || {});
function parseRotationName(rotation) {
  switch (rotation) {
    case 0:
      return "spawn";
    case 3:
      return "left";
    case 1:
      return "right";
    case 2:
      return "reverse";
  }
  throw new Error(`Unknown rotation: ${rotation}`);
}
function parseRotation(rotation) {
  switch (rotation.toLowerCase()) {
    case "spawn":
      return 0;
    case "left":
      return 3;
    case "right":
      return 1;
    case "reverse":
      return 2;
  }
  throw new Error(`Unknown rotation: ${rotation}`);
}
const FieldConstants$1 = {
  Width: 10,
  Height: 23,
  PlayBlocks: 23 * 10,
  // Height * Width
};
function createNewInnerField() {
  return new InnerField({});
}
function createInnerField(field) {
  const innerField = new InnerField({});
  for (let y = -1; y < FieldConstants$1.Height; y += 1) {
    for (let x = 0; x < FieldConstants$1.Width; x += 1) {
      const at = field.at(x, y);
      innerField.setNumberAt(x, y, parsePiece(at));
    }
  }
  return innerField;
}
class InnerField {
  static create(length) {
    return new PlayField({ length });
  }
  constructor({
    field = InnerField.create(FieldConstants$1.PlayBlocks),
    garbage = InnerField.create(FieldConstants$1.Width),
  }) {
    this.field = field;
    this.garbage = garbage;
  }
  fill(operation) {
    this.field.fill(operation);
  }
  fillAll(positions, type) {
    this.field.fillAll(positions, type);
  }
  canFill(piece, rotation, x, y) {
    const positions = getBlockPositions(piece, rotation, x, y);
    return positions.every(([px, py]) => {
      return (
        0 <= px &&
        px < 10 &&
        0 <= py &&
        py < FieldConstants$1.Height &&
        this.getNumberAt(px, py) === Piece.Empty
      );
    });
  }
  canFillAll(positions) {
    return positions.every(({ x, y }) => {
      return (
        0 <= x &&
        x < 10 &&
        0 <= y &&
        y < FieldConstants$1.Height &&
        this.getNumberAt(x, y) === Piece.Empty
      );
    });
  }
  isOnGround(piece, rotation, x, y) {
    return !this.canFill(piece, rotation, x, y - 1);
  }
  clearLine() {
    this.field.clearLine();
  }
  riseGarbage() {
    this.field.up(this.garbage);
    this.garbage.clearAll();
  }
  mirror() {
    this.field.mirror();
  }
  shiftToLeft() {
    this.field.shiftToLeft();
  }
  shiftToRight() {
    this.field.shiftToRight();
  }
  shiftToUp() {
    this.field.shiftToUp();
  }
  shiftToBottom() {
    this.field.shiftToBottom();
  }
  copy() {
    return new InnerField({
      field: this.field.copy(),
      garbage: this.garbage.copy(),
    });
  }
  equals(other) {
    return this.field.equals(other.field) && this.garbage.equals(other.garbage);
  }
  addNumber(x, y, value) {
    if (0 <= y) {
      this.field.addOffset(x, y, value);
    } else {
      this.garbage.addOffset(x, -(y + 1), value);
    }
  }
  setNumberFieldAt(index, value) {
    this.field.setAt(index, value);
  }
  setNumberGarbageAt(index, value) {
    this.garbage.setAt(index, value);
  }
  setNumberAt(x, y, value) {
    return 0 <= y
      ? this.field.set(x, y, value)
      : this.garbage.set(x, -(y + 1), value);
  }
  getNumberAt(x, y) {
    return 0 <= y ? this.field.get(x, y) : this.garbage.get(x, -(y + 1));
  }
  getNumberAtIndex(index, isField) {
    if (isField) {
      return this.getNumberAt(index % 10, Math.floor(index / 10));
    }
    return this.getNumberAt(index % 10, -(Math.floor(index / 10) + 1));
  }
  toFieldNumberArray() {
    return this.field.toArray();
  }
  toGarbageNumberArray() {
    return this.garbage.toArray();
  }
}
class PlayField {
  static load(...lines) {
    const blocks = lines.join("").trim();
    return PlayField.loadInner(blocks);
  }
  static loadMinify(...lines) {
    const blocks = lines.join("").trim();
    return PlayField.loadInner(blocks, blocks.length);
  }
  static loadInner(blocks, length) {
    const len = length !== void 0 ? length : blocks.length;
    if (len % 10 !== 0) {
      throw new Error("Num of blocks in field should be mod 10");
    }
    const field =
      length !== void 0 ? new PlayField({ length }) : new PlayField({});
    for (let index = 0; index < len; index += 1) {
      const block = blocks[index];
      field.set(
        index % 10,
        Math.floor((len - index - 1) / 10),
        parsePiece(block),
      );
    }
    return field;
  }
  constructor({ pieces, length = FieldConstants$1.PlayBlocks }) {
    if (pieces !== void 0) {
      this.pieces = pieces;
    } else {
      this.pieces = Array.from({ length }).map(() => Piece.Empty);
    }
    this.length = length;
  }
  get(x, y) {
    return this.pieces[x + y * FieldConstants$1.Width];
  }
  addOffset(x, y, value) {
    this.pieces[x + y * FieldConstants$1.Width] += value;
  }
  set(x, y, piece) {
    this.setAt(x + y * FieldConstants$1.Width, piece);
  }
  setAt(index, piece) {
    this.pieces[index] = piece;
  }
  fill({ type, rotation, x, y }) {
    const blocks = getBlocks(type, rotation);
    for (const block of blocks) {
      const [nx, ny] = [x + block[0], y + block[1]];
      this.set(nx, ny, type);
    }
  }
  fillAll(positions, type) {
    for (const { x, y } of positions) {
      this.set(x, y, type);
    }
  }
  clearLine() {
    let newField = this.pieces.concat();
    const top = this.pieces.length / FieldConstants$1.Width - 1;
    for (let y = top; 0 <= y; y -= 1) {
      const line = this.pieces.slice(
        y * FieldConstants$1.Width,
        (y + 1) * FieldConstants$1.Width,
      );
      const isFilled = line.every((value) => value !== Piece.Empty);
      if (isFilled) {
        const bottom = newField.slice(0, y * FieldConstants$1.Width);
        const over = newField.slice((y + 1) * FieldConstants$1.Width);
        newField = bottom.concat(
          over,
          Array.from({ length: FieldConstants$1.Width }).map(() => Piece.Empty),
        );
      }
    }
    this.pieces = newField;
  }
  up(blockUp) {
    this.pieces = blockUp.pieces.concat(this.pieces).slice(0, this.length);
  }
  mirror() {
    const newField = [];
    for (let y = 0; y < this.pieces.length; y += 1) {
      const line = this.pieces.slice(
        y * FieldConstants$1.Width,
        (y + 1) * FieldConstants$1.Width,
      );
      line.reverse();
      for (const obj of line) {
        newField.push(obj);
      }
    }
    this.pieces = newField;
  }
  shiftToLeft() {
    const height = this.pieces.length / 10;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < FieldConstants$1.Width - 1; x += 1) {
        this.pieces[x + y * FieldConstants$1.Width] =
          this.pieces[x + 1 + y * FieldConstants$1.Width];
      }
      this.pieces[9 + y * FieldConstants$1.Width] = Piece.Empty;
    }
  }
  shiftToRight() {
    const height = this.pieces.length / 10;
    for (let y = 0; y < height; y += 1) {
      for (let x = FieldConstants$1.Width - 1; 1 <= x; x -= 1) {
        this.pieces[x + y * FieldConstants$1.Width] =
          this.pieces[x - 1 + y * FieldConstants$1.Width];
      }
      this.pieces[y * FieldConstants$1.Width] = Piece.Empty;
    }
  }
  shiftToUp() {
    const blanks = Array.from({ length: 10 }).map(() => Piece.Empty);
    this.pieces = blanks.concat(this.pieces).slice(0, this.length);
  }
  shiftToBottom() {
    const blanks = Array.from({ length: 10 }).map(() => Piece.Empty);
    this.pieces = this.pieces.slice(10, this.length).concat(blanks);
  }
  toArray() {
    return this.pieces.concat();
  }
  get numOfBlocks() {
    return this.pieces.length;
  }
  copy() {
    return new PlayField({ pieces: this.pieces.concat(), length: this.length });
  }
  toShallowArray() {
    return this.pieces;
  }
  clearAll() {
    this.pieces = this.pieces.map(() => Piece.Empty);
  }
  equals(other) {
    if (this.pieces.length !== other.pieces.length) {
      return false;
    }
    for (let index = 0; index < this.pieces.length; index += 1) {
      if (this.pieces[index] !== other.pieces[index]) {
        return false;
      }
    }
    return true;
  }
}
function getBlockPositions(piece, rotation, x, y) {
  return getBlocks(piece, rotation).map((position) => {
    position[0] += x;
    position[1] += y;
    return position;
  });
}
function getBlockXYs(piece, rotation, x, y) {
  return getBlocks(piece, rotation).map((position) => {
    return { x: position[0] + x, y: position[1] + y };
  });
}
function getBlocks(piece, rotation) {
  const blocks = getPieces(piece);
  switch (rotation) {
    case Rotation.Spawn:
      return blocks;
    case Rotation.Left:
      return rotateLeft(blocks);
    case Rotation.Reverse:
      return rotateReverse(blocks);
    case Rotation.Right:
      return rotateRight(blocks);
  }
  throw new Error("Unsupported block");
}
function getPieces(piece) {
  switch (piece) {
    case Piece.I:
      return [
        [0, 0],
        [-1, 0],
        [1, 0],
        [2, 0],
      ];
    case Piece.T:
      return [
        [0, 0],
        [-1, 0],
        [1, 0],
        [0, 1],
      ];
    case Piece.O:
      return [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ];
    case Piece.L:
      return [
        [0, 0],
        [-1, 0],
        [1, 0],
        [1, 1],
      ];
    case Piece.J:
      return [
        [0, 0],
        [-1, 0],
        [1, 0],
        [-1, 1],
      ];
    case Piece.S:
      return [
        [0, 0],
        [-1, 0],
        [0, 1],
        [1, 1],
      ];
    case Piece.Z:
      return [
        [0, 0],
        [1, 0],
        [0, 1],
        [-1, 1],
      ];
  }
  throw new Error("Unsupported rotation");
}
function rotateRight(positions) {
  return positions.map((current) => [current[1], -current[0]]);
}
function rotateLeft(positions) {
  return positions.map((current) => [-current[1], current[0]]);
}
function rotateReverse(positions) {
  return positions.map((current) => [-current[0], -current[1]]);
}
const ENCODE_TABLE =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const _Buffer = class _Buffer {
  constructor(data = "") {
    this.values = data.split("").map(decodeToValue);
  }
  poll(max) {
    let value = 0;
    for (let count = 0; count < max; count += 1) {
      const v = this.values.shift();
      if (v === void 0) {
        throw new Error("Unexpected fumen");
      }
      value += v * Math.pow(_Buffer.tableLength, count);
    }
    return value;
  }
  push(value, splitCount = 1) {
    let current = value;
    for (let count = 0; count < splitCount; count += 1) {
      this.values.push(current % _Buffer.tableLength);
      current = Math.floor(current / _Buffer.tableLength);
    }
  }
  merge(postBuffer) {
    for (const value of postBuffer.values) {
      this.values.push(value);
    }
  }
  isEmpty() {
    return this.values.length === 0;
  }
  get length() {
    return this.values.length;
  }
  get(index) {
    return this.values[index];
  }
  set(index, value) {
    this.values[index] = value;
  }
  toString() {
    return this.values.map(encodeFromValue).join("");
  }
};
_Buffer.tableLength = ENCODE_TABLE.length;
let Buffer = _Buffer;
function decodeToValue(v) {
  return ENCODE_TABLE.indexOf(v);
}
function encodeFromValue(index) {
  return ENCODE_TABLE[index];
}
function decodeBool(n) {
  return n !== 0;
}
const createActionDecoder = (width, fieldTop, garbageLine) => {
  const fieldMaxHeight = fieldTop + garbageLine;
  const numFieldBlocks = fieldMaxHeight * width;
  function decodePiece(n) {
    switch (n) {
      case 0:
        return Piece.Empty;
      case 1:
        return Piece.I;
      case 2:
        return Piece.L;
      case 3:
        return Piece.O;
      case 4:
        return Piece.Z;
      case 5:
        return Piece.T;
      case 6:
        return Piece.J;
      case 7:
        return Piece.S;
      case 8:
        return Piece.Gray;
    }
    throw new Error("Unexpected piece");
  }
  function decodeRotation(n) {
    switch (n) {
      case 0:
        return Rotation.Reverse;
      case 1:
        return Rotation.Right;
      case 2:
        return Rotation.Spawn;
      case 3:
        return Rotation.Left;
    }
    throw new Error("Unexpected rotation");
  }
  function decodeCoordinate(n, piece, rotation) {
    let x = n % width;
    const originY = Math.floor(n / 10);
    let y = fieldTop - originY - 1;
    if (piece === Piece.O && rotation === Rotation.Left) {
      x += 1;
      y -= 1;
    } else if (piece === Piece.O && rotation === Rotation.Reverse) {
      x += 1;
    } else if (piece === Piece.O && rotation === Rotation.Spawn) {
      y -= 1;
    } else if (piece === Piece.I && rotation === Rotation.Reverse) {
      x += 1;
    } else if (piece === Piece.I && rotation === Rotation.Left) {
      y -= 1;
    } else if (piece === Piece.S && rotation === Rotation.Spawn) {
      y -= 1;
    } else if (piece === Piece.S && rotation === Rotation.Right) {
      x -= 1;
    } else if (piece === Piece.Z && rotation === Rotation.Spawn) {
      y -= 1;
    } else if (piece === Piece.Z && rotation === Rotation.Left) {
      x += 1;
    }
    return { x, y };
  }
  return {
    decode: (v) => {
      let value = v;
      const type = decodePiece(value % 8);
      value = Math.floor(value / 8);
      const rotation = decodeRotation(value % 4);
      value = Math.floor(value / 4);
      const coordinate = decodeCoordinate(
        value % numFieldBlocks,
        type,
        rotation,
      );
      value = Math.floor(value / numFieldBlocks);
      const isBlockUp = decodeBool(value % 2);
      value = Math.floor(value / 2);
      const isMirror = decodeBool(value % 2);
      value = Math.floor(value / 2);
      const isColor = decodeBool(value % 2);
      value = Math.floor(value / 2);
      const isComment = decodeBool(value % 2);
      value = Math.floor(value / 2);
      const isLock = !decodeBool(value % 2);
      return {
        rise: isBlockUp,
        mirror: isMirror,
        colorize: isColor,
        comment: isComment,
        lock: isLock,
        piece: {
          ...coordinate,
          type,
          rotation,
        },
      };
    },
  };
};
const COMMENT_TABLE =
  " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
const MAX_COMMENT_CHAR_VALUE = COMMENT_TABLE.length + 1;
const createCommentParser = () => {
  return {
    decode: (v) => {
      let str = "";
      let value = v;
      for (let count = 0; count < 4; count += 1) {
        const index = value % MAX_COMMENT_CHAR_VALUE;
        str += COMMENT_TABLE[index];
        value = Math.floor(value / MAX_COMMENT_CHAR_VALUE);
      }
      return str;
    },
    encode: (ch, count) => {
      return (
        COMMENT_TABLE.indexOf(ch) * Math.pow(MAX_COMMENT_CHAR_VALUE, count)
      );
    },
  };
};
class Quiz {
  get next() {
    const index = this.quiz.indexOf(")") + 1;
    const name = this.quiz[index];
    if (name === void 0 || name === ";") {
      return "";
    }
    return name;
  }
  static isQuizComment(comment) {
    return comment.startsWith("#Q=");
  }
  static create(first, second) {
    const create = (hold, other) => {
      const parse = (s) => (s ? s : "");
      return new Quiz(
        `#Q=[${parse(hold)}](${parse(other[0])})${parse(other.substring(1))}`,
      );
    };
    return second !== void 0 ? create(first, second) : create(void 0, first);
  }
  static trim(quiz) {
    return quiz.trim().replace(/\s+/g, "");
  }
  constructor(quiz) {
    this.quiz = Quiz.verify(quiz);
  }
  get least() {
    const index = this.quiz.indexOf(")");
    return this.quiz.substr(index + 1);
  }
  get current() {
    const index = this.quiz.indexOf("(") + 1;
    const name = this.quiz[index];
    if (name === ")") {
      return "";
    }
    return name;
  }
  get hold() {
    const index = this.quiz.indexOf("[") + 1;
    const name = this.quiz[index];
    if (name === "]") {
      return "";
    }
    return name;
  }
  get leastAfterNext2() {
    const index = this.quiz.indexOf(")");
    if (this.quiz[index + 1] === ";") {
      return this.quiz.substr(index + 1);
    }
    return this.quiz.substr(index + 2);
  }
  getOperation(used) {
    const usedName = parsePieceName(used);
    const current = this.current;
    if (usedName === current) {
      return "direct";
    }
    const hold = this.hold;
    if (usedName === hold) {
      return "swap";
    }
    if (hold === "") {
      if (usedName === this.next) {
        return "stock";
      }
    } else {
      if (current === "" && usedName === this.next) {
        return "direct";
      }
    }
    throw new Error(`Unexpected hold piece in quiz: ${this.quiz}`);
  }
  get leastInActiveBag() {
    const separateIndex = this.quiz.indexOf(";");
    const quiz =
      0 <= separateIndex ? this.quiz.substring(0, separateIndex) : this.quiz;
    const index = quiz.indexOf(")");
    if (quiz[index + 1] === ";") {
      return quiz.substr(index + 1);
    }
    return quiz.substr(index + 2);
  }
  static verify(quiz) {
    const replaced = this.trim(quiz);
    if (
      replaced.length === 0 ||
      quiz === "#Q=[]()" ||
      !quiz.startsWith("#Q=")
    ) {
      return quiz;
    }
    if (!replaced.match(/^#Q=\[[TIOSZJL]?]\([TIOSZJL]?\)[TIOSZJL]*;?.*$/i)) {
      throw new Error(
        `Current piece doesn't exist, however next pieces exist: ${quiz}`,
      );
    }
    return replaced;
  }
  direct() {
    if (this.current === "") {
      const least = this.leastAfterNext2;
      return new Quiz(`#Q=[${this.hold}](${least[0]})${least.substr(1)}`);
    }
    return new Quiz(`#Q=[${this.hold}](${this.next})${this.leastAfterNext2}`);
  }
  swap() {
    if (this.hold === "") {
      throw new Error(`Cannot find hold piece: ${this.quiz}`);
    }
    const next = this.next;
    return new Quiz(`#Q=[${this.current}](${next})${this.leastAfterNext2}`);
  }
  stock() {
    if (this.hold !== "" || this.next === "") {
      throw new Error(`Cannot stock: ${this.quiz}`);
    }
    const least = this.leastAfterNext2;
    const head = least[0] !== void 0 ? least[0] : "";
    if (1 < least.length) {
      return new Quiz(`#Q=[${this.current}](${head})${least.substr(1)}`);
    }
    return new Quiz(`#Q=[${this.current}](${head})`);
  }
  operate(operation) {
    switch (operation) {
      case "direct":
        return this.direct();
      case "swap":
        return this.swap();
      case "stock":
        return this.stock();
    }
    throw new Error("Unexpected operation");
  }
  format() {
    const quiz = this.nextIfEnd();
    if (quiz.quiz === "#Q=[]()") {
      return new Quiz("");
    }
    const current = quiz.current;
    const hold = quiz.hold;
    if (current === "" && hold !== "") {
      return new Quiz(`#Q=[](${hold})${quiz.least}`);
    }
    if (current === "") {
      const least = quiz.least;
      const head = least[0];
      if (head === void 0) {
        return new Quiz("");
      }
      if (head === ";") {
        return new Quiz(least.substr(1));
      }
      return new Quiz(`#Q=[](${head})${least.substr(1)}`);
    }
    return quiz;
  }
  getHoldPiece() {
    if (!this.canOperate()) {
      return Piece.Empty;
    }
    const name = this.hold;
    if (name === void 0 || name === "" || name === ";") {
      return Piece.Empty;
    }
    return parsePiece(name);
  }
  getNextPieces(max) {
    if (!this.canOperate()) {
      return max !== void 0
        ? Array.from({ length: max }).map(() => Piece.Empty)
        : [];
    }
    let names = (this.current + this.next + this.leastInActiveBag).substr(
      0,
      max,
    );
    if (max !== void 0 && names.length < max) {
      names += " ".repeat(max - names.length);
    }
    return names.split("").map((name) => {
      if (name === void 0 || name === " " || name === ";") {
        return Piece.Empty;
      }
      return parsePiece(name);
    });
  }
  toString() {
    return this.quiz;
  }
  canOperate() {
    let quiz = this.quiz;
    if (quiz.startsWith("#Q=[]();")) {
      quiz = this.quiz.substr(8);
    }
    return quiz.startsWith("#Q=") && quiz !== "#Q=[]()";
  }
  nextIfEnd() {
    if (this.quiz.startsWith("#Q=[]();")) {
      return new Quiz(this.quiz.substr(8));
    }
    return this;
  }
}
function toMino(operationOrMino) {
  return operationOrMino instanceof Mino
    ? operationOrMino.copy()
    : Mino.from(operationOrMino);
}
class Field {
  constructor(field) {
    this.field = field;
  }
  static create(field, garbage) {
    return new Field(
      new InnerField({
        field: field !== void 0 ? PlayField.load(field) : void 0,
        garbage: garbage !== void 0 ? PlayField.loadMinify(garbage) : void 0,
      }),
    );
  }
  canFill(operation) {
    if (operation === void 0) {
      return true;
    }
    const mino = toMino(operation);
    return this.field.canFillAll(mino.positions());
  }
  canLock(operation) {
    if (operation === void 0) {
      return true;
    }
    if (!this.canFill(operation)) {
      return false;
    }
    return !this.canFill({ ...operation, y: operation.y - 1 });
  }
  fill(operation, force = false) {
    if (operation === void 0) {
      return void 0;
    }
    const mino = toMino(operation);
    if (!force && !this.canFill(mino)) {
      throw Error("Cannot fill piece on field");
    }
    this.field.fillAll(mino.positions(), parsePiece(mino.type));
    return mino;
  }
  put(operation) {
    if (operation === void 0) {
      return void 0;
    }
    const mino = toMino(operation);
    for (; 0 <= mino.y; mino.y -= 1) {
      if (!this.canLock(mino)) {
        continue;
      }
      this.fill(mino);
      return mino;
    }
    throw Error("Cannot put piece on field");
  }
  clearLine() {
    this.field.clearLine();
  }
  at(x, y) {
    return parsePieceName(this.field.getNumberAt(x, y));
  }
  set(x, y, type) {
    this.field.setNumberAt(x, y, parsePiece(type));
  }
  copy() {
    return new Field(this.field.copy());
  }
  str(option = {}) {
    let skip = option.reduced !== void 0 ? option.reduced : true;
    const separator = option.separator !== void 0 ? option.separator : "\n";
    const minY = option.garbage === void 0 || option.garbage ? -1 : 0;
    let output = "";
    for (let y = 22; minY <= y; y -= 1) {
      let line = "";
      for (let x = 0; x < 10; x += 1) {
        line += this.at(x, y);
      }
      if (skip && line === "__________") {
        continue;
      }
      skip = false;
      output += line;
      if (y !== minY) {
        output += separator;
      }
    }
    return output;
  }
}
class Mino {
  constructor(type, rotation, x, y) {
    this.type = type;
    this.rotation = rotation;
    this.x = x;
    this.y = y;
  }
  static from(operation) {
    return new Mino(
      operation.type,
      operation.rotation,
      operation.x,
      operation.y,
    );
  }
  positions() {
    return getBlockXYs(
      parsePiece(this.type),
      parseRotation(this.rotation),
      this.x,
      this.y,
    ).sort((a, b) => {
      if (a.y === b.y) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });
  }
  operation() {
    return {
      type: this.type,
      rotation: this.rotation,
      x: this.x,
      y: this.y,
    };
  }
  isValid() {
    try {
      parsePiece(this.type);
      parseRotation(this.rotation);
    } catch (e) {
      return false;
    }
    return this.positions().every(({ x, y }) => {
      return 0 <= x && x < 10 && 0 <= y && y < 23;
    });
  }
  copy() {
    return new Mino(this.type, this.rotation, this.x, this.y);
  }
}
class Page {
  constructor(index, field, operation, comment, flags, refs) {
    this.index = index;
    this.operation = operation;
    this.comment = comment;
    this.flags = flags;
    this.refs = refs;
    this._field = field.copy();
  }
  get field() {
    return new Field(this._field.copy());
  }
  set field(field) {
    this._field = createInnerField(field);
  }
  mino() {
    return Mino.from(this.operation);
  }
}
const FieldConstants = {
  GarbageLine: 1,
  Width: 10,
};
function extract(str) {
  const format = (version, data2) => {
    const trim = data2.trim().replace(/[?\s]+/g, "");
    return { version, data: trim };
  };
  let data = str;
  const paramIndex = data.indexOf("&");
  if (0 <= paramIndex) {
    data = data.substring(0, paramIndex);
  }
  {
    const match = str.match(/[vmd]115@/);
    if (match !== void 0 && match !== null && match.index !== void 0) {
      const sub = data.substr(match.index + 5);
      return format("115", sub);
    }
  }
  {
    const match = str.match(/[vmd]110@/);
    if (match !== void 0 && match !== null && match.index !== void 0) {
      const sub = data.substr(match.index + 5);
      return format("110", sub);
    }
  }
  throw new Error("Unsupported fumen version");
}
function decode(fumen) {
  const { version, data } = extract(fumen);
  switch (version) {
    case "115":
      return innerDecode(data, 23);
    case "110":
      return innerDecode(data, 21);
  }
  throw new Error("Unsupported fumen version");
}
function innerDecode(data, fieldTop) {
  const fieldMaxHeight = fieldTop + FieldConstants.GarbageLine;
  const numFieldBlocks = fieldMaxHeight * FieldConstants.Width;
  const buffer = new Buffer(data);
  const updateField = (prev) => {
    const result = {
      changed: true,
      field: prev,
    };
    let index = 0;
    while (index < numFieldBlocks) {
      const diffBlock = buffer.poll(2);
      const diff = Math.floor(diffBlock / numFieldBlocks);
      const numOfBlocks = diffBlock % numFieldBlocks;
      if (diff === 8 && numOfBlocks === numFieldBlocks - 1) {
        result.changed = false;
      }
      for (let block = 0; block < numOfBlocks + 1; block += 1) {
        const x = index % FieldConstants.Width;
        const y = fieldTop - Math.floor(index / FieldConstants.Width) - 1;
        result.field.addNumber(x, y, diff - 8);
        index += 1;
      }
    }
    return result;
  };
  let pageIndex = 0;
  let prevField = createNewInnerField();
  const store = {
    repeatCount: -1,
    refIndex: {
      comment: 0,
      field: 0,
    },
    quiz: void 0,
    lastCommentText: "",
  };
  const pages = [];
  const actionDecoder = createActionDecoder(
    FieldConstants.Width,
    fieldTop,
    FieldConstants.GarbageLine,
  );
  const commentDecoder = createCommentParser();
  while (!buffer.isEmpty()) {
    let currentFieldObj;
    if (0 < store.repeatCount) {
      currentFieldObj = {
        field: prevField,
        changed: false,
      };
      store.repeatCount -= 1;
    } else {
      currentFieldObj = updateField(prevField.copy());
      if (!currentFieldObj.changed) {
        store.repeatCount = buffer.poll(1);
      }
    }
    const actionValue = buffer.poll(3);
    const action = actionDecoder.decode(actionValue);
    let comment;
    if (action.comment) {
      const commentValues = [];
      const commentLength = buffer.poll(2);
      for (
        let commentCounter = 0;
        commentCounter < Math.floor((commentLength + 3) / 4);
        commentCounter += 1
      ) {
        const commentValue = buffer.poll(5);
        commentValues.push(commentValue);
      }
      let flatten = "";
      for (const value of commentValues) {
        flatten += commentDecoder.decode(value);
      }
      const commentText = unescape(flatten.slice(0, commentLength));
      store.lastCommentText = commentText;
      comment = { text: commentText };
      store.refIndex.comment = pageIndex;
      const text = comment.text;
      if (Quiz.isQuizComment(text)) {
        try {
          store.quiz = new Quiz(text);
        } catch (e) {
          store.quiz = void 0;
        }
      } else {
        store.quiz = void 0;
      }
    } else if (pageIndex === 0) {
      comment = { text: "" };
    } else {
      comment = {
        text: store.quiz !== void 0 ? store.quiz.format().toString() : void 0,
        ref: store.refIndex.comment,
      };
    }
    let quiz = false;
    if (store.quiz !== void 0) {
      quiz = true;
      if (store.quiz.canOperate() && action.lock) {
        if (isMinoPiece(action.piece.type)) {
          try {
            const nextQuiz = store.quiz.nextIfEnd();
            const operation = nextQuiz.getOperation(action.piece.type);
            store.quiz = nextQuiz.operate(operation);
          } catch (e) {
            store.quiz = store.quiz.format();
          }
        } else {
          store.quiz = store.quiz.format();
        }
      }
    }
    let currentPiece;
    if (action.piece.type !== Piece.Empty) {
      currentPiece = action.piece;
    }
    let field;
    if (currentFieldObj.changed || pageIndex === 0) {
      field = {};
      store.refIndex.field = pageIndex;
    } else {
      field = { ref: store.refIndex.field };
    }
    pages.push(
      new Page(
        pageIndex,
        currentFieldObj.field,
        currentPiece !== void 0
          ? Mino.from({
              type: parsePieceName(currentPiece.type),
              rotation: parseRotationName(currentPiece.rotation),
              x: currentPiece.x,
              y: currentPiece.y,
            })
          : void 0,
        comment.text !== void 0 ? comment.text : store.lastCommentText,
        {
          quiz,
          lock: action.lock,
          mirror: action.mirror,
          colorize: action.colorize,
          rise: action.rise,
        },
        {
          field: field.ref,
          comment: comment.ref,
        },
      ),
    );
    pageIndex += 1;
    if (action.lock) {
      if (isMinoPiece(action.piece.type)) {
        currentFieldObj.field.fill(action.piece);
      }
      currentFieldObj.field.clearLine();
      if (action.rise) {
        currentFieldObj.field.riseGarbage();
      }
      if (action.mirror) {
        currentFieldObj.field.mirror();
      }
    }
    prevField = currentFieldObj.field;
  }
  return pages;
}

const app = document.querySelector("iframe[title='Tetris Game'], #gameIFrame")
  .contentWindow.mBPSApp;
const gameScene = app.mSceneMgr.getManagedScene("game");
const pieceIndexMap = [1, 3, 4, 7, 6, 2, 5];
const promptMessage = "Enter fumen string (leave empty for empty field)";
const emptyFumen = "v115@vhAAgH";
let fumen = "";
setFumen();

function setField() {
  const game = gameScene.mGameMgr.mGame.mPlayers.mObjects[0];
  const field = decode(fumen)[0].field.field.field.pieces;

  for (let i = 0; i < field.length; i++) {
    if (field[i] === 0) {
      continue;
    }

    const pieceIndex = pieceIndexMap[field[i] - 1];
    const method = (
      game.mPieceFactory.x1870197110890883719x ??
      game.mPieceFactory.x3045176153931957276x
    )?.bind(game.mPieceFactory);
    const mino = method(pieceIndex).mMinos.mObjects[0];

    game.mMatrix.insertMinoAt(mino, i % 10, Math.floor(i / 10));
  }
}

function setFumen() {
  const response = prompt(promptMessage);
  fumen = response === "" ? emptyFumen : response;
}

let gameManager = null;
let timeout = null;
delete gameScene.mGameMgr;

Object.defineProperty(gameScene, "mGameMgr", {
  get() {
    return gameManager;
  },
  set(newValue) {
    gameManager = newValue;
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    if (newValue === null) {
      return;
    }
    timeout = setTimeout(setField, 500);
  },
  configurable: true,
});
