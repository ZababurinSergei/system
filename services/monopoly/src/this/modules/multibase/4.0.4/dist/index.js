import require$$0$1 from '../../../@multiformats/dist/base-x.js';
import require$$0 from '../../../web-encoding/dist/index.js';

var src$1 = {exports: {}};

// @ts-ignore
const { TextEncoder, TextDecoder } = require$$0;

const textDecoder = new TextDecoder();
/**
 * @param {ArrayBufferView|ArrayBuffer} bytes
 * @returns {string}
 */
const decodeText$1 = (bytes) => textDecoder.decode(bytes);

const textEncoder = new TextEncoder();
/**
 * @param {string} text
 * @returns {Uint8Array}
 */
const encodeText$2 = (text) => textEncoder.encode(text);

/**
 * Returns a new Uint8Array created by concatenating the passed Arrays
 *
 * @param {Array<ArrayLike<number>>} arrs
 * @param {number} length
 * @returns {Uint8Array}
 */
function concat (arrs, length) {
  const output = new Uint8Array(length);
  let offset = 0;

  for (const arr of arrs) {
    output.set(arr, offset);
    offset += arr.length;
  }

  return output
}

var util = { decodeText: decodeText$1, encodeText: encodeText$2, concat };

const { encodeText: encodeText$1 } = util;

/** @typedef {import('./types').CodecFactory} CodecFactory */
/** @typedef {import("./types").BaseName} BaseName */
/** @typedef {import("./types").BaseCode} BaseCode */

/**
 * Class to encode/decode in the supported Bases
 *
 */
class Base$1 {
  /**
   * @param {BaseName} name
   * @param {BaseCode} code
   * @param {CodecFactory} factory
   * @param {string} alphabet
   */
  constructor (name, code, factory, alphabet) {
    this.name = name;
    this.code = code;
    this.codeBuf = encodeText$1(this.code);
    this.alphabet = alphabet;
    this.codec = factory(alphabet);
  }

  /**
   * @param {Uint8Array} buf
   * @returns {string}
   */
  encode (buf) {
    return this.codec.encode(buf)
  }

  /**
   * @param {string} string
   * @returns {Uint8Array}
   */
  decode (string) {
    for (const char of string) {
      if (this.alphabet && this.alphabet.indexOf(char) < 0) {
        throw new Error(`invalid character '${char}' in '${string}'`)
      }
    }
    return this.codec.decode(string)
  }
}

var base = Base$1;

/** @typedef {import('./types').CodecFactory} CodecFactory */

/**
 * @param {string} string
 * @param {string} alphabet
 * @param {number} bitsPerChar
 * @returns {Uint8Array}
 */
const decode = (string, alphabet, bitsPerChar) => {
  // Build the character lookup table:
  /** @type {Record<string, number>} */
  const codes = {};
  for (let i = 0; i < alphabet.length; ++i) {
    codes[alphabet[i]] = i;
  }

  // Count the padding bytes:
  let end = string.length;
  while (string[end - 1] === '=') {
    --end;
  }

  // Allocate the output:
  const out = new Uint8Array((end * bitsPerChar / 8) | 0);

  // Parse the data:
  let bits = 0; // Number of bits currently in the buffer
  let buffer = 0; // Bits waiting to be written out, MSB first
  let written = 0; // Next byte to write
  for (let i = 0; i < end; ++i) {
    // Read one character from the string:
    const value = codes[string[i]];
    if (value === undefined) {
      throw new SyntaxError('Invalid character ' + string[i])
    }

    // Append the bits to the buffer:
    buffer = (buffer << bitsPerChar) | value;
    bits += bitsPerChar;

    // Write out some bits if the buffer has a byte's worth:
    if (bits >= 8) {
      bits -= 8;
      out[written++] = 0xff & (buffer >> bits);
    }
  }

  // Verify that we have received just enough bits:
  if (bits >= bitsPerChar || 0xff & (buffer << (8 - bits))) {
    throw new SyntaxError('Unexpected end of data')
  }

  return out
};

/**
 * @param {Uint8Array} data
 * @param {string} alphabet
 * @param {number} bitsPerChar
 * @returns {string}
 */
const encode = (data, alphabet, bitsPerChar) => {
  const pad = alphabet[alphabet.length - 1] === '=';
  const mask = (1 << bitsPerChar) - 1;
  let out = '';

  let bits = 0; // Number of bits currently in the buffer
  let buffer = 0; // Bits waiting to be written out, MSB first
  for (let i = 0; i < data.length; ++i) {
    // Slurp data into the buffer:
    buffer = (buffer << 8) | data[i];
    bits += 8;

    // Write out as much as we can:
    while (bits > bitsPerChar) {
      bits -= bitsPerChar;
      out += alphabet[mask & (buffer >> bits)];
    }
  }

  // Partial character:
  if (bits) {
    out += alphabet[mask & (buffer << (bitsPerChar - bits))];
  }

  // Add padding characters until we hit a byte boundary:
  if (pad) {
    while ((out.length * bitsPerChar) & 7) {
      out += '=';
    }
  }

  return out
};

/**
 * RFC4648 Factory
 *
 * @param {number} bitsPerChar
 * @returns {CodecFactory}
 */
const rfc4648$1 = (bitsPerChar) => (alphabet) => {
  return {
    /**
     * @param {Uint8Array} input
     * @returns {string}
     */
    encode (input) {
      return encode(input, alphabet, bitsPerChar)
    },
    /**
     * @param {string} input
     * @returns {Uint8Array}
     */
    decode (input) {
      return decode(input, alphabet, bitsPerChar)
    }
  }
};

var rfc4648_1 = { rfc4648: rfc4648$1 };

const baseX = require$$0$1;
const Base = base;
const { rfc4648 } = rfc4648_1;
const { decodeText, encodeText } = util;

/** @typedef {import('./types').CodecFactory} CodecFactory */
/** @typedef {import('./types').Codec} Codec */
/** @typedef {import('./types').BaseName} BaseName */
/** @typedef {import('./types').BaseCode} BaseCode */

/** @type {CodecFactory} */
const identity = () => {
  return {
    encode: decodeText,
    decode: encodeText
  }
};

/**
 *
 * name, code, implementation, alphabet
 *
 * @type {Array<[BaseName, BaseCode, CodecFactory, string]>}
 */
const constants = [
  ['identity', '\x00', identity, ''],
  ['base2', '0', rfc4648(1), '01'],
  ['base8', '7', rfc4648(3), '01234567'],
  ['base10', '9', baseX, '0123456789'],
  ['base16', 'f', rfc4648(4), '0123456789abcdef'],
  ['base16upper', 'F', rfc4648(4), '0123456789ABCDEF'],
  ['base32hex', 'v', rfc4648(5), '0123456789abcdefghijklmnopqrstuv'],
  ['base32hexupper', 'V', rfc4648(5), '0123456789ABCDEFGHIJKLMNOPQRSTUV'],
  ['base32hexpad', 't', rfc4648(5), '0123456789abcdefghijklmnopqrstuv='],
  ['base32hexpadupper', 'T', rfc4648(5), '0123456789ABCDEFGHIJKLMNOPQRSTUV='],
  ['base32', 'b', rfc4648(5), 'abcdefghijklmnopqrstuvwxyz234567'],
  ['base32upper', 'B', rfc4648(5), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'],
  ['base32pad', 'c', rfc4648(5), 'abcdefghijklmnopqrstuvwxyz234567='],
  ['base32padupper', 'C', rfc4648(5), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567='],
  ['base32z', 'h', rfc4648(5), 'ybndrfg8ejkmcpqxot1uwisza345h769'],
  ['base36', 'k', baseX, '0123456789abcdefghijklmnopqrstuvwxyz'],
  ['base36upper', 'K', baseX, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
  ['base58btc', 'z', baseX, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'],
  ['base58flickr', 'Z', baseX, '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'],
  ['base64', 'm', rfc4648(6), 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'],
  ['base64pad', 'M', rfc4648(6), 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='],
  ['base64url', 'u', rfc4648(6), 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'],
  ['base64urlpad', 'U', rfc4648(6), 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=']
];

/** @type {Record<BaseName,Base>} */
const names = constants.reduce((prev, tupple) => {
  prev[tupple[0]] = new Base(tupple[0], tupple[1], tupple[2], tupple[3]);
  return prev
}, /** @type {Record<BaseName,Base>} */({}));

/** @type {Record<BaseCode,Base>} */
const codes = constants.reduce((prev, tupple) => {
  prev[tupple[1]] = names[tupple[0]];
  return prev
}, /** @type {Record<BaseCode,Base>} */({}));

var constants_1 = {
  names,
  codes
};

/**
 * Implementation of the [multibase](https://github.com/multiformats/multibase) specification.
 *
 */

(function (module, exports) {

	const constants = constants_1;
	const { encodeText, decodeText, concat } = util;

	/** @typedef {import('./base')} Base */
	/** @typedef {import("./types").BaseNameOrCode} BaseNameOrCode */
	/** @typedef {import("./types").BaseCode} BaseCode */
	/** @typedef {import("./types").BaseName} BaseName */

	/**
	 * Create a new Uint8Array with the multibase varint+code.
	 *
	 * @param {BaseNameOrCode} nameOrCode - The multibase name or code number.
	 * @param {Uint8Array} buf - The data to be prefixed with multibase.
	 * @returns {Uint8Array}
	 * @throws {Error} Will throw if the encoding is not supported
	 */
	function multibase (nameOrCode, buf) {
	  if (!buf) {
	    throw new Error('requires an encoded Uint8Array')
	  }
	  const { name, codeBuf } = encoding(nameOrCode);
	  validEncode(name, buf);

	  return concat([codeBuf, buf], codeBuf.length + buf.length)
	}

	/**
	 * Encode data with the specified base and add the multibase prefix.
	 *
	 * @param {BaseNameOrCode} nameOrCode - The multibase name or code number.
	 * @param {Uint8Array} buf - The data to be encoded.
	 * @returns {Uint8Array}
	 * @throws {Error} Will throw if the encoding is not supported
	 *
	 */
	function encode (nameOrCode, buf) {
	  const enc = encoding(nameOrCode);
	  const data = encodeText(enc.encode(buf));

	  return concat([enc.codeBuf, data], enc.codeBuf.length + data.length)
	}

	/**
	 * Takes a Uint8Array or string encoded with multibase header, decodes it and
	 * returns the decoded buffer
	 *
	 * @param {Uint8Array|string} data
	 * @returns {Uint8Array}
	 * @throws {Error} Will throw if the encoding is not supported
	 *
	 */
	function decode (data) {
	  if (data instanceof Uint8Array) {
	    data = decodeText(data);
	  }
	  const prefix = data[0];

	  // Make all encodings case-insensitive except the ones that include upper and lower chars in the alphabet
	  if (['f', 'F', 'v', 'V', 't', 'T', 'b', 'B', 'c', 'C', 'h', 'k', 'K'].includes(prefix)) {
	    data = data.toLowerCase();
	  }
	  const enc = encoding(/** @type {BaseCode} */(data[0]));
	  return enc.decode(data.substring(1))
	}

	/**
	 * Is the given data multibase encoded?
	 *
	 * @param {Uint8Array|string} data
	 * @returns {false | string}
	 */
	function isEncoded (data) {
	  if (data instanceof Uint8Array) {
	    data = decodeText(data);
	  }

	  // Ensure bufOrString is a string
	  if (Object.prototype.toString.call(data) !== '[object String]') {
	    return false
	  }

	  try {
	    const enc = encoding(/** @type {BaseCode} */(data[0]));
	    return enc.name
	  } catch (err) {
	    return false
	  }
	}

	/**
	 * Validate encoded data
	 *
	 * @param {BaseNameOrCode} name
	 * @param {Uint8Array} buf
	 * @returns {void}
	 * @throws {Error} Will throw if the encoding is not supported
	 */
	function validEncode (name, buf) {
	  const enc = encoding(name);
	  enc.decode(decodeText(buf));
	}

	/**
	 * Get the encoding by name or code
	 *
	 * @param {BaseNameOrCode} nameOrCode
	 * @returns {Base}
	 * @throws {Error} Will throw if the encoding is not supported
	 */
	function encoding (nameOrCode) {
	  if (Object.prototype.hasOwnProperty.call(constants.names, /** @type {BaseName} */(nameOrCode))) {
	    return constants.names[/** @type {BaseName} */(nameOrCode)]
	  } else if (Object.prototype.hasOwnProperty.call(constants.codes, /** @type {BaseCode} */(nameOrCode))) {
	    return constants.codes[/** @type {BaseCode} */(nameOrCode)]
	  } else {
	    throw new Error(`Unsupported encoding: ${nameOrCode}`)
	  }
	}

	/**
	 * Get encoding from data
	 *
	 * @param {string|Uint8Array} data
	 * @returns {Base}
	 * @throws {Error} Will throw if the encoding is not supported
	 */
	function encodingFromData (data) {
	  if (data instanceof Uint8Array) {
	    data = decodeText(data);
	  }

	  return encoding(/** @type {BaseCode} */(data[0]))
	}

	exports = module.exports = multibase;
	exports.encode = encode;
	exports.decode = decode;
	exports.isEncoded = isEncoded;
	exports.encoding = encoding;
	exports.encodingFromData = encodingFromData;
	exports.names = Object.freeze(constants.names);
	exports.codes = Object.freeze(constants.codes);
} (src$1, src$1.exports));

var src = src$1.exports;

export { src as default };
