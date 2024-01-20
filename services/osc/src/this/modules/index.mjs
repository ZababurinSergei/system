export const classes = {
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

export { Multiaddr, multiaddr, protocols, resolvers } from './@multiformats/dist/multiaddr.js'

export default {
    description: 'utilities for this project'
}