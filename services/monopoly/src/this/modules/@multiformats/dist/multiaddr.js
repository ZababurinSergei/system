import { isIPv4, isIPv6, isIP } from '../../is-ip/dist/index.js';
import { toString as toString$1 } from '../../uint8arrays/dist/to-string.js';
import { CID } from '../../multiformats/dist/src/cid.js';
import { base32 } from '../../multiformats/dist/src/bases/base32.js';
import { base58btc } from '../../multiformats/dist/src/bases/base58.js';
import * as Digest from '../../multiformats/dist/src/hashes/digest.js';
import varint from '../../varint/dist/index.js';
import { fromString as fromString$1 } from '../../uint8arrays/dist/from-string.js';
import { concat } from '../../uint8arrays/dist/concat.js';
import errCode from '../../err-code/dist/index.js';
import { equals } from '../../uint8arrays/dist/equals.js';

const isV4 = isIPv4;
const isV6 = isIPv6;
// Copied from https://github.com/indutny/node-ip/blob/master/lib/ip.js#L7
// but with buf/offset args removed because we don't use them
const toBytes = function (ip) {
    let offset = 0;
    let result;
    if (isV4(ip)) {
        result = new Uint8Array(offset + 4);
        ip.split(/\./g).forEach((byte) => {
            result[offset++] = parseInt(byte, 10) & 0xff;
        });
    }
    else if (isV6(ip)) {
        const sections = ip.split(':', 8);
        let i;
        for (i = 0; i < sections.length; i++) {
            const isv4 = isV4(sections[i]);
            let v4Buffer;
            if (isv4) {
                v4Buffer = toBytes(sections[i]);
                sections[i] = toString$1(v4Buffer.slice(0, 2), 'base16');
            }
            if (v4Buffer != null && ++i < 8) {
                sections.splice(i, 0, toString$1(v4Buffer.slice(2, 4), 'base16'));
            }
        }
        if (sections[0] === '') {
            while (sections.length < 8)
                sections.unshift('0');
        }
        else if (sections[sections.length - 1] === '') {
            while (sections.length < 8)
                sections.push('0');
        }
        else if (sections.length < 8) {
            for (i = 0; i < sections.length && sections[i] !== ''; i++)
                ;
            const argv = [i, 1];
            for (i = 9 - sections.length; i > 0; i--) {
                argv.push('0');
            }
            sections.splice.apply(sections, argv);
        }
        result = new Uint8Array(offset + 16);
        for (i = 0; i < sections.length; i++) {
            const word = parseInt(sections[i], 16);
            result[offset++] = (word >> 8) & 0xff;
            result[offset++] = word & 0xff;
        }
    }
    if (result == null) {
        throw Error('Invalid ip address: ' + ip);
    }
    return result;
};
// Copied from https://github.com/indutny/node-ip/blob/master/lib/ip.js#L63
const toString = function (buf, offset, length) {
    offset = ~~offset;
    length = length ?? (buf.length - offset);
    const result = [];
    let string = '';
    const view = new DataView(buf.buffer);
    if (length === 4) {
        // IPv4
        for (let i = 0; i < length; i++) {
            result.push(buf[offset + i]);
        }
        string = result.join('.');
    }
    else if (length === 16) {
        // IPv6
        for (let i = 0; i < length; i += 2) {
            result.push(view.getUint16(offset + i).toString(16));
        }
        string = result.join(':');
        string = string.replace(/(^|:)0(:0)*:0(:|$)/, '$1::$3');
        string = string.replace(/:{3,4}/, '::');
    }
    return string;
};

const V = -1;
const names = {};
const codes = {};
const table = [
    [0, V, 'schema'],
    [1, V, 'rule'],
    [2, V, 'manifest'],
    [3, V, 'subject'],
    [4, 32, 'ip4'],
    [5, V, 'domain'],
    [6, 16, 'tcp'],
    [7, V, 'mapping'],
    [8, V, 'mss'],
    [9, V, 'settings'],
    [10, V, 'subscribes'],
    [11, V, 'directory'],
    [33, 16, 'dccp'],
    [41, 128, 'ip6'],
    [42, V, 'ip6zone'],
    [53, V, 'dns', true],
    [54, V, 'dns4', true],
    [55, V, 'dns6', true],
    [56, V, 'dnsaddr', true],
    [132, 16, 'sctp'],
    [273, 16, 'udp'],
    [275, 0, 'p2p-webrtc-star'],
    [276, 0, 'p2p-webrtc-direct'],
    [277, 0, 'p2p-stardust'],
    [290, 0, 'p2p-circuit'],
    [301, 0, 'udt'],
    [302, 0, 'utp'],
    [400, V, 'unix', false, true],
    // `ipfs` is added before `p2p` for legacy support.
    // All text representations will default to `p2p`, but `ipfs` will
    // still be supported
    [421, V, 'ipfs'],
    // `p2p` is the preferred name for 421, and is now the default
    [421, V, 'p2p'],
    [443, 0, 'https'],
    [444, 96, 'onion'],
    [445, 296, 'onion3'],
    [446, V, 'garlic64'],
    [460, 0, 'quic'],
    [477, 0, 'ws'],
    [478, 0, 'wss'],
    [479, 0, 'p2p-websocket-star'],
    [480, 0, 'http'],
    [777, V, 'memory']
];
// populate tables
table.forEach(row => {
    const proto = createProtocol(...row);
    codes[proto.code] = proto;
    names[proto.name] = proto;
});
function createProtocol(code, size, name, resolvable, path) {
    return {
        code,
        size,
        name,
        resolvable: Boolean(resolvable),
        path: Boolean(path)
    };
}
function getProtocol(proto) {
    if (typeof proto === 'number') {
        if (codes[proto] != null) {
            return codes[proto];
        } else {
            return {
                code: 4294967295,
                name: "anonymous",
                path: false,
                resolvable: false,
                size: -1
            }
            // throw new Error(`no protocol with code: ${proto}`);
        }
    }
    else if (typeof proto === 'string') {
        if (names[proto] != null) {
            return names[proto];
        } else {
            return {
                code: 4294967295,
                name: "anonymous",
                path: false,
                resolvable: false,
                size: -1
            }
            // throw new Error(`no protocol with name: ${proto}`);
        }
    }
    throw new Error(`invalid protocol id type: ${typeof proto}`);
}

/**
 * Convert [code,Uint8Array] to string
 */
function convertToString(proto, buf) {
    const protocol = getProtocol(proto);
    switch (protocol.code) {
        case 0: // schema
        case 1: // rule
        case 2: // manifest
        case 3: // subject
        case 5: // domain
        case 7: // mapping
        case 8: // mss
        case 9: //settings
        case 10: //subscribes
        case 11: //directory
        case 4294967295: //anonymous
            return bytes2str(buf);
        case 4: // ipv4
        case 41: // ipv6
            return bytes2ip(buf);
        case 6: // tcp
        case 273: // udp
        case 33: // dccp
        case 132: // sctp
            return bytes2port(buf).toString();
        case 53: // dns
        case 54: // dns4
        case 55: // dns6
        case 56: // dnsaddr
        case 400: // unix
        case 777: // memory
            return bytes2str(buf);
        case 421: // ipfs
            return bytes2mh(buf);
        case 444: // onion
            return bytes2onion(buf);
        case 445: // onion3
            return bytes2onion(buf);
        default:
            return toString$1(buf, 'base16'); // no clue. convert to hex
    }
}
function convertToBytes(proto, str) {
    const protocol = getProtocol(proto);
    console.log()
    switch (protocol.code) {
        case 0: // schema
        case 1: // rule
        case 2: // manifest
        case 3: // subject
        case 5: // domain
        case 7: // mapping
        case 8: // mss
        case 9: //settings
        case 10: //subscribes
        case 11: //directory
        case 4294967295: //anonymous
            return str2bytes(str);
        case 4: // ipv4
            return ip2bytes(str);
        case 41: // ipv6
            return ip2bytes(str);
        case 6: // tcp
        case 273: // udp
        case 33: // dccp
        case 132: // sctp
            return port2bytes(parseInt(str, 10));
        case 53: // dns
        case 54: // dns4
        case 55: // dns6
        case 56: // dnsaddr
        case 400: // unix
        case 777: // memory
            return str2bytes(str);
        case 421: // ipfs
            return mh2bytes(str);
        case 444: // onion
            return onion2bytes(str);
        case 445: // onion3
            return onion32bytes(str);
        default:
            return fromString$1(str, 'base16'); // no clue. convert from hex
    }
}
function ip2bytes(ipString) {
    if (!isIP(ipString)) {
        throw new Error('invalid ip address');
    }
    return toBytes(ipString);
}

function bytes2ip(ipBuff) {
    const ipString = toString(ipBuff, 0, ipBuff.length);
    if (ipString == null || !isIP(ipString)) {
        throw new Error('invalid ip address');
    }
    return ipString;
}
function port2bytes(port) {
    const buf = new ArrayBuffer(2);
    const view = new DataView(buf);
    view.setUint16(0, port);
    return new Uint8Array(buf);
}
function bytes2port(buf) {
    const view = new DataView(buf.buffer);
    return view.getUint16(buf.byteOffset);
}
function str2bytes(str) {
    const buf = fromString$1(str);
    const size = Uint8Array.from(varint.encode(buf.length));
    return concat([size, buf], size.length + buf.length);
}
function bytes2str(buf) {
    const size = varint.decode(buf);
    buf = buf.slice(varint.decode.bytes);
    if (buf.length !== size) {
        throw new Error('inconsistent lengths');
    }
    return toString$1(buf);
}
function mh2bytes(hash) {
    let mh;
    if (hash[0] === 'Q' || hash[0] === '1') {
        mh = Digest.decode(base58btc.decode(`z${hash}`)).bytes;
    }
    else {
        mh = CID.parse(hash).multihash.bytes;
    }
    // the address is a varint prefixed multihash string representation
    const size = Uint8Array.from(varint.encode(mh.length));
    return concat([size, mh], size.length + mh.length);
}
/**
 * Converts bytes to bas58btc string
 */
function bytes2mh(buf) {
    const size = varint.decode(buf);
    const address = buf.slice(varint.decode.bytes);
    if (address.length !== size) {
        throw new Error('inconsistent lengths');
    }
    return toString$1(address, 'base58btc');
}
function onion2bytes(str) {
    const addr = str.split(':');
    if (addr.length !== 2) {
        throw new Error(`failed to parse onion addr: ["'${addr.join('", "')}'"]' does not contain a port number`);
    }
    if (addr[0].length !== 16) {
        throw new Error(`failed to parse onion addr: ${addr[0]} not a Tor onion address.`);
    }
    // onion addresses do not include the multibase prefix, add it before decoding
    const buf = base32.decode('b' + addr[0]);
    // onion port number
    const port = parseInt(addr[1], 10);
    if (port < 1 || port > 65536) {
        throw new Error('Port number is not in range(1, 65536)');
    }
    const portBuf = port2bytes(port);
    return concat([buf, portBuf], buf.length + portBuf.length);
}
function onion32bytes(str) {
    const addr = str.split(':');
    if (addr.length !== 2) {
        throw new Error(`failed to parse onion addr: ["'${addr.join('", "')}'"]' does not contain a port number`);
    }
    if (addr[0].length !== 56) {
        throw new Error(`failed to parse onion addr: ${addr[0]} not a Tor onion3 address.`);
    }
    // onion addresses do not include the multibase prefix, add it before decoding
    const buf = base32.decode(`b${addr[0]}`);
    // onion port number
    const port = parseInt(addr[1], 10);
    if (port < 1 || port > 65536) {
        throw new Error('Port number is not in range(1, 65536)');
    }
    const portBuf = port2bytes(port);
    return concat([buf, portBuf], buf.length + portBuf.length);
}
function bytes2onion(buf) {
    const addrBytes = buf.slice(0, buf.length - 2);
    const portBytes = buf.slice(buf.length - 2);
    const addr = toString$1(addrBytes, 'base32');
    const port = bytes2port(portBytes);
    return `${addr}:${port}`;
}

/**
 * string -> [[str name, str addr]... ]
 */
function stringToStringTuples(str) {
    const tuples = [];
    const parts = str.split('/').slice(1); // skip first empty elem

    if (parts.length === 1 && parts[0] === '') {
        return [];
    }
    for (let p = 0; p < parts.length; p++) {
        const part = parts[p];
        const proto = getProtocol(part);
        if (proto.size === 0) {
            tuples.push([part]);
            continue;
        }
        p++; // advance addr part
        if (p > parts.length) {
            throw ParseError('invalid address: ' + str);
        } else if(p === parts.length) {
            parts[1] = undefined
        }
        // 
        // if it's a path proto, take the rest
        if (proto.path === true) {
            tuples.push([
                part,
                // TODO: should we need to check each path part to see if it's a proto?
                // This would allow for other protocols to be added after a unix path,
                // however it would have issues if the path had a protocol name in the path
                cleanPath(parts.slice(p).join('/'))
            ]);
            break;
        }
        tuples.push([part, parts[p]]);
    }
    return tuples;
}
/**
 * [[str name, str addr]... ] -> string
 */
function stringTuplesToString(tuples) {
    const parts = [];
    tuples.map((tup) => {
        const proto = protoFromTuple(tup);
        parts.push(proto.name);
        if (tup.length > 1 && tup[1] != null) {
            parts.push(tup[1]);
        }
        return null;
    });
    return cleanPath(parts.join('/'));
}
/**
 * [[str name, str addr]... ] -> [[int code, Uint8Array]... ]
 */
function stringTuplesToTuples(tuples) {
    return tuples.map((tup) => {
        if (!Array.isArray(tup)) {
            tup = [tup];
        }
        const proto = protoFromTuple(tup);
        if (tup.length > 1) {
            return [proto.code, convertToBytes(proto.code, tup[1])];
        }
        return [proto.code];
    });
}
/**
 * Convert tuples to string tuples
 *
 * [[int code, Uint8Array]... ] -> [[int code, str addr]... ]
 */
function tuplesToStringTuples(tuples) {
    return tuples.map(tup => {
        const proto = protoFromTuple(tup);
        if (tup[1] != null) {
            return [proto.code, convertToString(proto.code, tup[1])];
        }
        return [proto.code];
    });
}
/**
 * [[int code, Uint8Array ]... ] -> Uint8Array
 */
function tuplesToBytes(tuples) {
    return fromBytes(concat(tuples.map((tup) => {
        const proto = protoFromTuple(tup);
        let buf = Uint8Array.from(varint.encode(proto.code));
        if (tup.length > 1 && tup[1] != null) {
            buf = concat([buf, tup[1]]); // add address buffer
        }
        return buf;
    })));
}
function sizeForAddr(p, addr) {
    if (p.size > 0) {
        return p.size / 8;
    }
    else if (p.size === 0) {
        return 0;
    }
    else {
        const size = varint.decode(addr);
        return size + varint.decode.bytes;
    }
}
function bytesToTuples(buf) {
    const tuples = [];
    let i = 0;
    while (i < buf.length) {
        const code = varint.decode(buf, i);
        const n = varint.decode.bytes;
        const p = getProtocol(code);
        const size = sizeForAddr(p, buf.slice(i + n));

        if (size === 0) {
            tuples.push([code]);
            i += n;
            continue;
        }
        const addr = buf.slice(i + n, i + n + size);
        i += (size + n);
        if (i > buf.length) { // did not end _exactly_ at buffer.length
            throw ParseError('Invalid address Uint8Array: ' + toString$1(buf, 'base16'));
        }
        // ok, tuple seems good.
        tuples.push([code, addr]);
    }
    return tuples;
}
/**
 * Uint8Array -> String
 */
function bytesToString(buf) {
    const a = bytesToTuples(buf);
    const b = tuplesToStringTuples(a);
    return stringTuplesToString(b);
}
/**
 * String -> Uint8Array
 */
function stringToBytes(str) {
    str = cleanPath(str);
    const a = stringToStringTuples(str);
    const b = stringTuplesToTuples(a);
    return tuplesToBytes(b);
}
/**
 * String -> Uint8Array
 */
function fromString(str) {
    return stringToBytes(str);
}
/**
 * Uint8Array -> Uint8Array
 */
function fromBytes(buf) {
    const err = validateBytes(buf);
    if (err != null) {
        throw err;
    }
    return Uint8Array.from(buf); // copy
}
function validateBytes(buf) {
    try {
        bytesToTuples(buf); // try to parse. will throw if breaks
    }
    catch (err) {
        return err;
    }
}
function cleanPath(str) {
    return '/' + str.trim().split('/').filter((a) => a).join('/');
}
function ParseError(str) {
    return new Error('Error parsing address: ' + str);
}
function protoFromTuple(tup) {
    const proto = getProtocol(tup[0]);
    return proto;
}

const inspect = Symbol.for('nodejs.util.inspect.custom');
const IP_CODES = [
    getProtocol('ip4').code,
    getProtocol('ip6').code
];
const DNS_CODES = [
    getProtocol('dns').code,
    getProtocol('dns4').code,
    getProtocol('dns6').code,
    getProtocol('dnsaddr').code
];
const P2P_CODES = [
    getProtocol('p2p').code,
    getProtocol('ipfs').code
];
const TCP_UDP_CODES = [
    getProtocol('tcp').code,
    getProtocol('udp').code
];

const RULES_CODES = [
    getProtocol('manifest').code,
    getProtocol('schema').code,
    getProtocol('rule').code,
    getProtocol('domain').code,
    getProtocol('subject').code,
    getProtocol('mapping').code
];

const MSS_CODES = [
    getProtocol('directory').code,
    getProtocol('settings').code,
    getProtocol('subscribes').code
];

const SYSTEM_CODES = [
    getProtocol('mss').code,
];

const resolvers = new Map();
const symbol = Symbol.for('@multiformats/js-multiaddr/multiaddr');
/**
 * Creates a [multiaddr](https://github.com/multiformats/multiaddr) from
 * a Uint8Array, String or another Multiaddr instance
 * public key.
 *
 */
class Multiaddr {
    /**
     * @example
     * ```js
     * new Multiaddr('/ip4/127.0.0.1/tcp/4001')
     * // <Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>
     * ```
     *
     * @param {MultiaddrInput} [addr] - If String or Uint8Array, needs to adhere to the address format of a [multiaddr](https://github.com/multiformats/multiaddr#string-format)
     */
    constructor(addr) {
        // default
        if (addr == null) {
            addr = '';
        }
        // Define symbol
        Object.defineProperty(this, symbol, { value: true });
        if (addr instanceof Uint8Array) {
            this.bytes = fromBytes(addr);
        }
        else if (typeof addr === 'string') {
            if (addr.length > 0 && addr.charAt(0) !== '/') {
                throw new Error(`multiaddr "${addr}" must start with a "/"`);
            }
            this.bytes = fromString(addr);
        }
        else if (Multiaddr.isMultiaddr(addr)) { // Multiaddr
            this.bytes = fromBytes(addr.bytes); // validate + copy buffer
        }
        else {
            throw new Error('addr must be a string, Buffer, or another Multiaddr');
        }
    }
    /**
     * Returns Multiaddr as a String
     *
     * @example
     * ```js
     * new Multiaddr('/ip4/127.0.0.1/tcp/4001').toString()
     * // '/ip4/127.0.0.1/tcp/4001'
     * ```
     */
    toString() {
        return bytesToString(this.bytes);
    }
    /**
     * Returns Multiaddr as a JSON encoded object
     *
     * @example
     * ```js
     * JSON.stringify(new Multiaddr('/ip4/127.0.0.1/tcp/4001'))
     * // '/ip4/127.0.0.1/tcp/4001'
     * ```
     */
    toJSON() {
        return this.toString();
    }
    /**
     * Returns Multiaddr as a convinient options object to be used with net.createConnection
     *
     * @example
     * ```js
     * new Multiaddr('/ip4/127.0.0.1/tcp/4001').toOptions()
     * // { family: 4, host: '127.0.0.1', transport: 'tcp', port: 4001 }
     * ```
     */
    toOptions() {
        const codes = this.protoCodes();
        const parts = this.toString().split('/').slice(1);
        let transport;
        let port;
        if (parts.length > 2) {
            // default to https when protocol & port are omitted from DNS addrs
            if (DNS_CODES.includes(codes[0]) && P2P_CODES.includes(codes[1])) {
                transport = getProtocol('tcp').name;
                port = 443;
            }
            else {
                transport = getProtocol(parts[2]).name;
                port = parseInt(parts[3]);
            }
        }
        else if (DNS_CODES.includes(codes[0])) {
            transport = getProtocol('tcp').name;
            port = 443;
        }
        else {
            throw new Error('multiaddr must have a valid format: "/{ip4, ip6, dns4, dns6, dnsaddr}/{address}/{tcp, udp}/{port}".');
        }
        const opts = {
            family: (codes[0] === 41 || codes[0] === 55) ? 6 : 4,
            host: parts[1],
            transport,
            port
        };
        return opts;
    }
    /**
     * Returns the protocols the Multiaddr is defined with, as an array of objects, in
     * left-to-right order. Each object contains the protocol code, protocol name,
     * and the size of its address space in bits.
     * [See list of protocols](https://github.com/multiformats/multiaddr/blob/master/protocols.csv)
     *
     * @example
     * ```js
     * new Multiaddr('/ip4/127.0.0.1/tcp/4001').protos()
     * // [ { code: 4, size: 32, name: 'ip4' },
     * //   { code: 6, size: 16, name: 'tcp' } ]
     * ```
     */
    protos() {
        return this.protoCodes().map(code => Object.assign({}, getProtocol(code)));
    }
    /**
     * Returns the codes of the protocols in left-to-right order.
     * [See list of protocols](https://github.com/multiformats/multiaddr/blob/master/protocols.csv)
     *
     * @example
     * ```js
     * Multiaddr('/ip4/127.0.0.1/tcp/4001').protoCodes()
     * // [ 4, 6 ]
     * ```
     */
    protoCodes() {
        const codes = [];
        const buf = this.bytes;
        let i = 0;
        while (i < buf.length) {
            const code = varint.decode(buf, i);
            const n = varint.decode.bytes;
            const p = getProtocol(code);
            const size = sizeForAddr(p, buf.slice(i + n));
            i += (size + n);
            codes.push(code);
        }
        return codes;
    }
    /**
     * Returns the names of the protocols in left-to-right order.
     * [See list of protocols](https://github.com/multiformats/multiaddr/blob/master/protocols.csv)
     *
     * @example
     * ```js
     * new Multiaddr('/ip4/127.0.0.1/tcp/4001').protoNames()
     * // [ 'ip4', 'tcp' ]
     * ```
     */
    protoNames() {
        return this.protos().map(proto => proto.name);
    }
    /**
     * Returns a tuple of parts
     *
     * @example
     * ```js
     * new Multiaddr("/ip4/127.0.0.1/tcp/4001").tuples()
     * // [ [ 4, <Buffer 7f 00 00 01> ], [ 6, <Buffer 0f a1> ] ]
     * ```
     */
    tuples() {
        return bytesToTuples(this.bytes);
    }
    /**
     * Returns a tuple of string/number parts
     * - tuples[][0] = code of protocol
     * - tuples[][1] = contents of address
     *
     * @example
     * ```js
     * new Multiaddr("/ip4/127.0.0.1/tcp/4001").stringTuples()
     * // [ [ 4, '127.0.0.1' ], [ 6, '4001' ] ]
     * ```
     */
    stringTuples() {
        const t = bytesToTuples(this.bytes);
        return tuplesToStringTuples(t);
    }
    /**
     * Encapsulates a Multiaddr in another Multiaddr
     *
     * @example
     * ```js
     * const mh1 = new Multiaddr('/ip4/8.8.8.8/tcp/1080')
     * // <Multiaddr 0408080808060438 - /ip4/8.8.8.8/tcp/1080>
     *
     * const mh2 = new Multiaddr('/ip4/127.0.0.1/tcp/4001')
     * // <Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>
     *
     * const mh3 = mh1.encapsulate(mh2)
     * // <Multiaddr 0408080808060438047f000001060fa1 - /ip4/8.8.8.8/tcp/1080/ip4/127.0.0.1/tcp/4001>
     *
     * mh3.toString()
     * // '/ip4/8.8.8.8/tcp/1080/ip4/127.0.0.1/tcp/4001'
     * ```
     *
     * @param {MultiaddrInput} addr - Multiaddr to add into this Multiaddr
     */
    encapsulate(addr) {
        addr = new Multiaddr(addr);
        return new Multiaddr(this.toString() + addr.toString());
    }
    /**
     * Decapsulates a Multiaddr from another Multiaddr
     *
     * @example
     * ```js
     * const mh1 = new Multiaddr('/ip4/8.8.8.8/tcp/1080')
     * // <Multiaddr 0408080808060438 - /ip4/8.8.8.8/tcp/1080>
     *
     * const mh2 = new Multiaddr('/ip4/127.0.0.1/tcp/4001')
     * // <Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>
     *
     * const mh3 = mh1.encapsulate(mh2)
     * // <Multiaddr 0408080808060438047f000001060fa1 - /ip4/8.8.8.8/tcp/1080/ip4/127.0.0.1/tcp/4001>
     *
     * mh3.decapsulate(mh2).toString()
     * // '/ip4/8.8.8.8/tcp/1080'
     * ```
     *
     * @param {Multiaddr | string} addr - Multiaddr to remove from this Multiaddr
     */
    decapsulate(addr) {
        const addrString = addr.toString();
        const s = this.toString();
        const i = s.lastIndexOf(addrString);
        if (i < 0) {
            throw new Error(`Address ${this.toString()} does not contain subaddress: ${addr.toString()}`);
        }
        return new Multiaddr(s.slice(0, i));
    }
    /**
     * A more reliable version of `decapsulate` if you are targeting a
     * specific code, such as 421 (the `p2p` protocol code). The last index of the code
     * will be removed from the `Multiaddr`, and a new instance will be returned.
     * If the code is not present, the original `Multiaddr` is returned.
     *
     * @example
     * ```js
     * const addr = new Multiaddr('/ip4/0.0.0.0/tcp/8080/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSupNKC')
     * // <Multiaddr 0400... - /ip4/0.0.0.0/tcp/8080/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSupNKC>
     *
     * addr.decapsulateCode(421).toString()
     * // '/ip4/0.0.0.0/tcp/8080'
     *
     * new Multiaddr('/ip4/127.0.0.1/tcp/8080').decapsulateCode(421).toString()
     * // '/ip4/127.0.0.1/tcp/8080'
     * ```
     */
    decapsulateCode(code) {
        const tuples = this.tuples();
        for (let i = tuples.length - 1; i >= 0; i--) {
            if (tuples[i][0] === code) {
                return new Multiaddr(tuplesToBytes(tuples.slice(0, i)));
            }
        }
        return this;
    }
    /**
     * Extract the peerId if the multiaddr contains one
     *
     * @example
     * ```js
     * const mh1 = new Multiaddr('/ip4/8.8.8.8/tcp/1080/ipfs/QmValidBase58string')
     * // <Multiaddr 0408080808060438 - /ip4/8.8.8.8/tcp/1080/ipfs/QmValidBase58string>
     *
     * // should return QmValidBase58string or null if the id is missing or invalid
     * const peerId = mh1.getPeerId()
     * ```
     */
    getPeerId() {
        try {
            const tuples = this.stringTuples().filter((tuple) => {
                if (tuple[0] === names.ipfs.code) {
                    return true;
                }
                return false;
            });
            // Get the last ipfs tuple ['ipfs', 'peerid string']
            const tuple = tuples.pop();
            if (tuple?.[1] != null) {
                const peerIdStr = tuple[1];
                // peer id is base58btc encoded string but not multibase encoded so add the `z`
                // prefix so we can validate that it is correctly encoded
                if (peerIdStr[0] === 'Q' || peerIdStr[0] === '1') {
                    return toString$1(base58btc.decode(`z${peerIdStr}`), 'base58btc');
                }
                // try to parse peer id as CID
                return toString$1(CID.parse(peerIdStr).multihash.bytes, 'base58btc');
            }
            return null;
        }
        catch (e) {
            return null;
        }
    }
    /**
     * Extract the path if the multiaddr contains one
     *
     * @example
     * ```js
     * const mh1 = new Multiaddr('/ip4/8.8.8.8/tcp/1080/unix/tmp/p2p.sock')
     * // <Multiaddr 0408080808060438 - /ip4/8.8.8.8/tcp/1080/unix/tmp/p2p.sock>
     *
     * // should return utf8 string or null if the id is missing or invalid
     * const path = mh1.getPath()
     * ```
     */
    getPath() {
        let path = null;
        try {
            path = this.stringTuples().filter((tuple) => {
                const proto = getProtocol(tuple[0]);
                if (proto.path === true) {
                    return true;
                }
                return false;
            })[0][1];
            if (path == null) {
                path = null;
            }
        }
        catch {
            path = null;
        }
        return path;
    }
    /**
     * Checks if two Multiaddrs are the same
     *
     * @example
     * ```js
     * const mh1 = new Multiaddr('/ip4/8.8.8.8/tcp/1080')
     * // <Multiaddr 0408080808060438 - /ip4/8.8.8.8/tcp/1080>
     *
     * const mh2 = new Multiaddr('/ip4/127.0.0.1/tcp/4001')
     * // <Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>
     *
     * mh1.equals(mh1)
     * // true
     *
     * mh1.equals(mh2)
     * // false
     * ```
     */
    equals(addr) {
        return equals(this.bytes, addr.bytes);
    }
    /**
     * Resolve multiaddr if containing resolvable hostname.
     *
     * @example
     * ```js
     * Multiaddr.resolvers.set('dnsaddr', resolverFunction)
     * const mh1 = new Multiaddr('/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb')
     * const resolvedMultiaddrs = await mh1.resolve()
     * // [
     * //   <Multiaddr 04934b5353060fa1a503221220c10f9319dac35c270a6b74cd644cb3acfc1f6efc8c821f8eb282599fd1814f64 - /ip4/147.75.83.83/tcp/4001/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb>,
     * //   <Multiaddr 04934b53530601bbde03a503221220c10f9319dac35c270a6b74cd644cb3acfc1f6efc8c821f8eb282599fd1814f64 - /ip4/147.75.83.83/tcp/443/wss/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb>,
     * //   <Multiaddr 04934b535391020fa1cc03a503221220c10f9319dac35c270a6b74cd644cb3acfc1f6efc8c821f8eb282599fd1814f64 - /ip4/147.75.83.83/udp/4001/quic/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb>
     * // ]
     * ```
     */
    async resolve(options) {
        const resolvableProto = this.protos().find((p) => p.resolvable);
        // Multiaddr is not resolvable?
        if (resolvableProto == null) {
            return [this];
        }
        const resolver = resolvers.get(resolvableProto.name);
        if (resolver == null) {
            throw errCode(new Error(`no available resolver for ${resolvableProto.name}`), 'ERR_NO_AVAILABLE_RESOLVER');
        }
        const addresses = await resolver(this, options);
        return addresses.map((a) => new Multiaddr(a));
    }
    /**
     * Gets a Multiaddrs node-friendly address object. Note that protocol information
     * is left out: in Node (and most network systems) the protocol is unknowable
     * given only the address.
     *
     * Has to be a ThinWaist Address, otherwise throws error
     *
     * @example
     * ```js
     * new Multiaddr('/ip4/127.0.0.1/tcp/4001').nodeAddress()
     * // {family: 4, address: '127.0.0.1', port: 4001}
     * ```
     */
    nodeAddress(props = undefined) {
        if(props) {
            const { type, value } = props
            if(type === 'fer') {

                const codes = this.protoCodes();
                const names = this.protoNames();
                const parts = this.toString().split('/').slice(1);
                return  {
                    names: names[0],
                    codes: codes[0],
                    value: parts[1]
                }
            } else if(type === 'mss') {
                const codes = this.protoCodes();
                const names = this.protoNames();
                const parts = this.toString().split('/').slice(1);

                return  {
                    names: names[0],
                    codes: codes[0],
                    value: value ? value : false,
                    link: parts[1]
                }
            }
        } else {
            const codes = this.protoCodes();
            const names = this.protoNames();
            const parts = this.toString().split('/').slice(1);
            let protocol = getProtocol(parts[2]).code;
            let port = parseInt(parts[3]);
            // default to https when protocol & port are omitted from DNS addrs
            if (DNS_CODES.includes(codes[0]) && P2P_CODES.includes(codes[1])) {
                protocol = getProtocol('tcp').code;
                port = 443;
            }
            if (parts.length < 4) {
                throw new Error('multiaddr must have a valid format: "/{ip4, ip6, dns4, dns6, dnsaddr}/{address}/{tcp, udp}/{port}".');
            }
            else if (!IP_CODES.includes(codes[0]) && !DNS_CODES.includes(codes[0])) {
                throw new Error(`no protocol with name: "'${names[0]}'". Must have a valid family name: "{ip4, ip6, dns, dns4, dns6, dnsaddr}".`);
            }
            else if (!TCP_UDP_CODES.includes(protocol)) {
                throw new Error(`no protocol with name: "'${names[1]}'". Must have a valid transport protocol: "{tcp, udp}".`);
            }
            return {
                family: (codes[0] === 41 || codes[0] === 55) ? 6 : 4,
                address: parts[1],
                port // tcp or udp port
            };
        }
    }
    /**
     * Returns if a Multiaddr is a Thin Waist address or not.
     *
     * Thin Waist is if a Multiaddr adheres to the standard combination of:
     *
     * `{IPv4, IPv6}/{TCP, UDP}`
     *
     * @example
     * ```js
     * const mh1 = new Multiaddr('/ip4/127.0.0.1/tcp/4001')
     * // <Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>
     * const mh2 = new Multiaddr('/ip4/192.168.2.1/tcp/5001')
     * // <Multiaddr 04c0a80201061389 - /ip4/192.168.2.1/tcp/5001>
     * const mh3 = mh1.encapsulate(mh2)
     * // <Multiaddr 047f000001060fa104c0a80201061389 - /ip4/127.0.0.1/tcp/4001/ip4/192.168.2.1/tcp/5001>
     * const mh4 = new Multiaddr('/ip4/127.0.0.1/tcp/2000/wss/p2p-webrtc-star/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo2a')
     * // <Multiaddr 047f0000010607d0de039302a503221220d52ebb89d85b02a284948203a62ff28389c57c9f42beec4ec20db76a64835843 - /ip4/127.0.0.1/tcp/2000/wss/p2p-webrtc-star/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo2a>
     * mh1.isThinWaistAddress()
     * // true
     * mh2.isThinWaistAddress()
     * // true
     * mh3.isThinWaistAddress()
     * // false
     * mh4.isThinWaistAddress()
     * // false
     * ```
     */
    isThinWaistAddress(addr) {
        const protos = (addr ?? this).protos();
        if (protos.length !== 2) {
            return false;
        }
        if (protos[0].code !== 4 && protos[0].code !== 41) {
            return false;
        }
        if (protos[1].code !== 6 && protos[1].code !== 273) {
            return false;
        }
        return true;
    }
    /**
     * Creates a Multiaddr from a node-friendly address object
     *
     * @example
     * ```js
     * Multiaddr.fromNodeAddress({address: '127.0.0.1', port: '4001'}, 'tcp')
     * // <Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>
     * ```
     */
    static fromNodeAddress(addr, transport) {
        if (addr == null) {
            throw new Error('requires node address object');
        }
        if (transport == null) {
            throw new Error('requires transport protocol');
        }
        let ip;
        switch (addr.family) {
            case 4:
                ip = 'ip4';
                break;
            case 6:
                ip = 'ip6';
                break;
            default:
                throw Error('Invalid addr family, should be 4 or 6.');
        }
        return new Multiaddr('/' + [ip, addr.address, transport, addr.port].join('/'));
    }
    /**
     * Returns if something is a Multiaddr that is a name
     */
    static isName(addr) {
        if (!Multiaddr.isMultiaddr(addr)) {
            return false;
        }
        // if a part of the multiaddr is resolvable, then return true
        return addr.protos().some((proto) => proto.resolvable);
    }
    /**
     * Check if object is a CID instance
     */
    static isMultiaddr(value) {
        return Boolean(value?.[symbol]);
    }
    /**
     * Returns Multiaddr as a human-readable string.
     * For post Node.js v10.0.0.
     * https://nodejs.org/api/deprecations.html#deprecations_dep0079_custom_inspection_function_on_objects_via_inspect
     *
     * @example
     * ```js
     * console.log(new Multiaddr('/ip4/127.0.0.1/tcp/4001'))
     * // '<Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>'
     * ```
     */
    [inspect]() {
        return '<Multiaddr ' +
            toString$1(this.bytes, 'base16') + ' - ' +
            bytesToString(this.bytes) + '>';
    }
    /**
     * Returns Multiaddr as a human-readable string.
     * Fallback for pre Node.js v10.0.0.
     * https://nodejs.org/api/deprecations.html#deprecations_dep0079_custom_inspection_function_on_objects_via_inspect
     *
     * @example
     * ```js
     * new Multiaddr('/ip4/127.0.0.1/tcp/4001').inspect()
     * // '<Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>'
     * ```
     */
    inspect() {
        return '<Multiaddr ' +
            toString$1(this.bytes, 'base16') + ' - ' +
            bytesToString(this.bytes) + '>';
    }
}
Multiaddr.resolvers = resolvers;
/**
 * Static factory
 */
function multiaddr(addr) {
    return new Multiaddr(addr);
}

export { Multiaddr, multiaddr, getProtocol as protocols, resolvers };
