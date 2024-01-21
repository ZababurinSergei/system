export const className = {
    active: "active"
}

export {loader} from './loader/loader.mjs'

export { toBase64, fromBase64 } from './base64/index.mjs'

export const delay = (ms) =>  new Promise(resolve => setTimeout(resolve, ms));

export const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

export const normalizePathName = (pathname) => {
    pathname = pathname.startsWith('/') ? pathname : `/${pathname}`
    pathname = pathname.endsWith('/') ? pathname : `${pathname}/`
    return pathname
}

export const events = (name, detail) => document.dispatchEvent(new CustomEvent(name, {
    bubbles: true,
    composed: true,
    detail: detail
}));

export { Multiaddr, multiaddr, protocols, resolvers } from './@multiformats/dist/multiaddr.js'

export { animationCount } from './animation/index.mjs'

export default {
    description: 'utilities for this project'
}