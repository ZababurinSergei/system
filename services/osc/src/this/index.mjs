export { store } from './store/index.mjs'
export { Fonts } from './fonts/index.mjs'
export { init, onload } from './init/index.mjs'
export { сonfigRouter, router } from './router/index.mjs'
export { camelToSnakeCase, normalizePathName, Multiaddr, multiaddr, protocols, resolvers } from './modules/index.mjs'

export default {
    description: 'all modules for this',
    store: 'https://github.com/jaywcjlove/store.js',
    swagger: "https://github.com/swagger-api/swagger-ui"
}