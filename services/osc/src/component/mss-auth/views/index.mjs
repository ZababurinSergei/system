import html from './html/index.mjs'

export { html }

export {
    Account,
    useAuth,
    getTokenPair,
    getRefreshToken,
    signIn,
    logOut,
    request,
    store,
    jwtDecode
} from './mjs/index.mjs'

export default {
    html: html
}