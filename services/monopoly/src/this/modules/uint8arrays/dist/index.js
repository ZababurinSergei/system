import require$$0 from '../../multibase/dist/index.js';

/**
 * Can be used with Array.sort to sort and array with Uint8Array entries
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 */
function compare$1 (a, b) {
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] < b[i]) {
      return -1
    }

    if (a[i] > b[i]) {
      return 1
    }
  }

  if (a.byteLength > b.byteLength) {
    return 1
  }

  if (a.byteLength < b.byteLength) {
    return -1
  }

  return 0
}

var compare_1 = compare$1;

/**
 * Returns a new Uint8Array created by concatenating the passed ArrayLikes
 *
 * @param {Array<ArrayLike<number>>} arrays
 * @param {number} [length]
 */
function concat$1 (arrays, length) {
  if (!length) {
    length = arrays.reduce((acc, curr) => acc + curr.length, 0);
  }

  const output = new Uint8Array(length);
  let offset = 0;

  for (const arr of arrays) {
    output.set(arr, offset);
    offset += arr.length;
  }

  return output
}

var concat_1 = concat$1;

/**
 * Returns true if the two passed Uint8Arrays have the same content
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 */
function equals$1 (a, b) {
  if (a === b) {
    return true
  }

  if (a.byteLength !== b.byteLength) {
    return false
  }

  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}

var equals_1 = equals$1;

const { encoding: getCodec$1 } = require$$0;
const utf8Encoder = new TextEncoder();

/**
 * @typedef {import('multibase/src/types').BaseName | 'utf8' | 'utf-8' | 'ascii' | undefined} SupportedEncodings
 */

/**
 * Interprets each character in a string as a byte and
 * returns a Uint8Array of those bytes.
 *
 * @param {string} string - The string to turn into an array
 */
function asciiStringToUint8Array (string) {
  const array = new Uint8Array(string.length);

  for (let i = 0; i < string.length; i++) {
    array[i] = string.charCodeAt(i);
  }

  return array
}

/**
 * Create a `Uint8Array` from the passed string
 *
 * Supports `utf8`, `utf-8` and any encoding supported by the multibase module.
 *
 * Also `ascii` which is similar to node's 'binary' encoding.
 *
 * @param {string} string
 * @param {SupportedEncodings} [encoding=utf8] - utf8, base16, base64, base64urlpad, etc
 * @returns {Uint8Array}
 */
function fromString$1 (string, encoding = 'utf8') {
  if (encoding === 'utf8' || encoding === 'utf-8') {
    return utf8Encoder.encode(string)
  }

  if (encoding === 'ascii') {
    return asciiStringToUint8Array(string)
  }

  return getCodec$1(encoding).decode(string)
}

var fromString_1 = fromString$1;

const { encoding: getCodec } = require$$0;
const utf8Decoder = new TextDecoder('utf8');

/**
 * @typedef {import('multibase/src/types').BaseName | 'utf8' | 'utf-8' | 'ascii' | undefined} SupportedEncodings
 */

/**
 * Turns a Uint8Array of bytes into a string with each
 * character being the char code of the corresponding byte
 *
 * @param {Uint8Array} array - The array to turn into a string
 */
function uint8ArrayToAsciiString (array) {
  let string = '';

  for (let i = 0; i < array.length; i++) {
    string += String.fromCharCode(array[i]);
  }
  return string
}

/**
 * Turns a `Uint8Array` into a string.
 *
 * Supports `utf8`, `utf-8` and any encoding supported by the multibase module.
 *
 * Also `ascii` which is similar to node's 'binary' encoding.
 *
 * @param {Uint8Array} array - The array to turn into a string
 * @param {SupportedEncodings} [encoding=utf8] - The encoding to use
 * @returns {string}
 */
function toString$1 (array, encoding = 'utf8') {
  if (encoding === 'utf8' || encoding === 'utf-8') {
    return utf8Decoder.decode(array)
  }

  if (encoding === 'ascii') {
    return uint8ArrayToAsciiString(array)
  }

  return getCodec(encoding).encode(array)
}

var toString_1 = toString$1;

/**
 * Returns the xor distance between two arrays
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 */
function xor$1 (a, b) {
  if (a.length !== b.length) {
    throw new Error('Inputs should have the same length')
  }

  const result = new Uint8Array(a.length);

  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] ^ b[i];
  }

  return result
}

var xor_1 = xor$1;

const compare = compare_1;
const concat = concat_1;
const equals = equals_1;
const fromString = fromString_1;
const toString = toString_1;
const xor = xor_1;

var uint8arrays = {
  compare,
  concat,
  equals,
  fromString,
  toString,
  xor
};

export { uint8arrays as default };
