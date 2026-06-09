/**
 * Generates bags of pieces using tetris.com's PRNG system.
 */

// Although any seed is technically valid, they will all be mapped into the
// range of integers [-2^31, 2^31-1] by x -> 0xffffffff & (0x7fffffff * x)
const seed = 0;
// e60 has bagSize = 1
const bagSize = 7;
const numBags = 5;
const printBagsOnNewLines = true;

// Side note: tetris.com uses the MT19937 for (pseudo) random number generation
class MersenneTwister {
  static WORD_SIZE = 32;
  static RECURSION_DEGREE = 624;
  static MIDDLE_WORD = 397;
  static ONE_WORD_SEPARATION_POINT = 31;
  static MATRIX_A_BOTTOM_ROW = 0x9908b0df;
  static TEMPERING_BIT_SHIFT_1 = 11;
  static TEMPERING_BIT_SHIFT_2 = 7;
  static TEMPERING_BIT_SHIFT_3 = 15;
  static TEMPERING_BIT_SHIFT_4 = 18;
  static TEMPERING_MASK_1 = 0x9d2c5680;
  static TEMPERING_MASK_2 = 0xefc60000;
  static UPPER_MASK = 0x80000000;
  static LOWER_MASK = 0x7fffffff;
  static f = 1812433253;

  state;
  stateIndex;

  constructor(seed) {
    this.state = new Int32Array(MersenneTwister.RECURSION_DEGREE);
    this.stateIndex = 0;

    this.setSeed(seed);
  }

  setSeed(seed) {
    this.state[0] = 0xffffffff & (0x7fffffff * seed);

    for (
      this.stateIndex = 1;
      this.stateIndex < MersenneTwister.RECURSION_DEGREE;
      this.stateIndex++
    ) {
      this.state[this.stateIndex] =
        MersenneTwister.f *
          (this.state[this.stateIndex - 1] ^
            (this.state[this.stateIndex - 1] >>>
              (MersenneTwister.WORD_SIZE - 2))) +
        this.stateIndex;
      this.state[this.stateIndex] &= 0xffffffff;
    }
  }

  twist() {
    let i = 0;
    let temp;

    for (
      ;
      i < MersenneTwister.RECURSION_DEGREE - MersenneTwister.MIDDLE_WORD;
      i++
    ) {
      temp =
        (this.state[i] & MersenneTwister.UPPER_MASK) |
        (this.state[i + 1] & MersenneTwister.LOWER_MASK);
      this.state[i] =
        this.state[i + MersenneTwister.MIDDLE_WORD] ^
        (temp >>> 1) ^
        (~~(1 & temp) === 0 ? 0 : MersenneTwister.MATRIX_A_BOTTOM_ROW);
    }

    for (; i < MersenneTwister.RECURSION_DEGREE - 1; i++) {
      temp =
        (this.state[i] & MersenneTwister.UPPER_MASK) |
        (this.state[i + 1] & MersenneTwister.LOWER_MASK);
      this.state[i] =
        this.state[
          i + (MersenneTwister.MIDDLE_WORD - MersenneTwister.RECURSION_DEGREE)
        ] ^
        (temp >>> 1) ^
        (~~(1 & temp) === 0 ? 0 : MersenneTwister.MATRIX_A_BOTTOM_ROW);
    }

    temp =
      (this.state[MersenneTwister.RECURSION_DEGREE - 1] &
        MersenneTwister.UPPER_MASK) |
      (this.state[0] & MersenneTwister.LOWER_MASK);
    this.state[MersenneTwister.RECURSION_DEGREE - 1] =
      this.state[MersenneTwister.MIDDLE_WORD - 1] ^
      (temp >>> 1) ^
      (~~(1 & temp) === 0 ? 0 : MersenneTwister.MATRIX_A_BOTTOM_ROW);
    this.stateIndex = 0;
  }

  temper(value) {
    value ^= value >>> MersenneTwister.TEMPERING_BIT_SHIFT_1;
    value ^=
      (value << MersenneTwister.TEMPERING_BIT_SHIFT_2) &
      MersenneTwister.TEMPERING_MASK_1;
    value ^=
      (value << MersenneTwister.TEMPERING_BIT_SHIFT_3) &
      MersenneTwister.TEMPERING_MASK_2;
    value ^= value >>> MersenneTwister.TEMPERING_BIT_SHIFT_4;

    return value;
  }

  nextInt() {
    if (this.stateIndex >= MersenneTwister.RECURSION_DEGREE) {
      this.twist();
    }

    let value = this.state[this.stateIndex++];

    return 0xffffffff & this.temper(value);
  }

  // static stateFromSequence(sequence) {
  //   const state = new Int32Array(MersenneTwister.RECURSION_DEGREE);

  //   for (let i = 0; i < MersenneTwister.RECURSION_DEGREE; i++) {
  //     state[i] = this.unTemper(sequence[i]);
  //   }

  //   return state;
  // }

  // static unTemper(sample) {
  //   let state = sample;

  //   state = this.unRightTransform(state, this.TEMPERING_BIT_SHIFT_4);
  //   state = this.unLeftTransform(
  //     state,
  //     this.TEMPERING_BIT_SHIFT_3,
  //     this.TEMPERING_MASK_2,
  //   );
  //   state = this.unLeftTransform(
  //     state,
  //     this.TEMPERING_BIT_SHIFT_2,
  //     this.TEMPERING_MASK_1,
  //   );
  //   state = this.unRightTransform(state, this.TEMPERING_BIT_SHIFT_1);

  //   return state;
  // }

  // static unRightTransform(value, shift) {
  //   let result = value;

  //   for (let i = 0; i < MersenneTwister.WORD_SIZE; i++) {
  //     result = value ^ (result >>> shift);
  //   }

  //   return result;
  // }

  // static unLeftTransform(value, shift, mask) {
  //   let result = 0;

  //   for (let i = 0; i < MersenneTwister.WORD_SIZE; i++) {
  //     result = value ^ ((result << shift) & mask);
  //   }

  //   return result;
  // }
}

class BagGenerator {
  static PIECES = ["I", "J", "L", "O", "S", "T", "Z"];
  bagIndices;
  prng;
  bagSize;

  constructor(seed, bagSize) {
    this.bagIndices = [];
    this.prng = new MersenneTwister(seed);
    this.bagSize = bagSize;
  }

  getBags(numBags = 1) {
    let bag = "";

    for (let i = 0; i < numBags; i++) {
      for (let j = 0; j < this.bagSize; j++) {
        if (
          this.bagIndices.length === 0 ||
          BagGenerator.PIECES.length - this.bagIndices.length === this.bagSize
        ) {
          this.bagIndices = [6, 5, 4, 3, 2, 1, 0];
        }

        bag += this._generatePiece();
      }

      if (printBagsOnNewLines) {
        bag += "\n";
      }
    }

    return bag;
  }

  _generatePiece() {
    const random = 0x7fffffff & this.prng.nextInt();
    const index = random % this.bagIndices.length;
    const piece = BagGenerator.PIECES[this.bagIndices[index]];

    this.bagIndices.splice(index, 1);

    return piece;
  }
}

console.log(new BagGenerator(seed, bagSize).getBags(numBags));
