import {Account} from '../views/index.mjs'

export const actions = (self) => {
    return new Promise(async (resolve, reject) => {
        let account = new Account()
        let objectWallet = {}
        const privateKey = self.shadowRoot.querySelector('#auction-auth__create_private')
        const statusPrivate = self.shadowRoot.querySelector('.auction-auth__create_menu_status')
        const publicKey = self.shadowRoot.querySelector('#auction-auth__create_public')
        const stageKey = self.shadowRoot.querySelector('#auction-auth__create_stage')
        const password = self.shadowRoot.querySelector('#auction-auth__password_item_create')

        let publicFile = undefined
        let privateFile = undefined
        let stageFile = undefined

        let sys = {
            wallet: {
                data: {
                    private: undefined,
                    public: undefined,
                    stage: undefined,
                }
            }
        }

        // let wallet = await account.create('welcomebook', '12Fd44g735', 'T')
        resolve({
            change: async (event) => {
                // console.log('dddddddddddddddddddddddddddddddddddddd', event.currentTarget)
                const file = event.currentTarget.files[0]
                privateFile = file
                statusPrivate.textContent = ''
                statusPrivate.textContent = 'upload'
                event.currentTarget.value = ""
                // const pass = event.currentTarget.value
                // let name = 'welcomebook'
                // let type = 'W'
                try {
                    sys.wallet.data.private = await account.open(privateFile, '12Fd44g735')
                    if (account.address(sys.wallet.data.private.seed) === '3PDkQJtrbwtU5vt5V365YDRAL7QwLECGRLX') {
                        sys.wallet.data.private = ''
                        window.dispatchEvent(new CustomEvent('login', {
                            bubbles: true,
                            composed: true,
                            detail: {
                                login: true
                            }
                        }));
                    }
                } catch (e) {
                    console.error(e)
                }
            },
            input: async (event) => {
                /*

                sys.wallet.data.stage = await account.open(sys.wallet.html.stage.files[0])

                obj['this'].shadowRoot.querySelector('#form-password').value = ''
                let wallet = Object.assign(sys.wallet.data.public, sys.wallet.data.private, sys.wallet.data.stage);
                let balance = await waves['balance'](wallet['address'], wallet['type'])
                console.log(utils)
                window.utils = utils
                // console.log(utils.base58Decode(wallet.seed))
                // console.log(utils.base58Encode(wallet.seed))
                console.assert(false, wallet)
                let template = await walletTemplate(true, '', '3', {
                    type: wallet['type'],
                    date: wallet['date']['GMT'],
                    address: wallet['address'],
                    publicKey: wallet['key'],
                    privateKey: 'не подключен',
                    seed: wallet.seed,
                    balance: balance['message']['balance'],
                }, 'template-wallet')
                obj['this'].shadowRoot.querySelector('#wallet').innerHTML = ''
                obj['this'].shadowRoot.querySelector('#wallet').classList.add("active")
                obj['this'].shadowRoot.querySelector('#wallet').insertAdjacentHTML('beforeend', template)
                let button = ['wallet-address',
                    'wallet-publicKey',
                    'wallet-privateKey',
                    'wallet-seed',
                    'wallet-balance']
                // task.set(true, `change status`, '5', wallet ,'/onload/wallet');
                obj['this'].shadowRoot.querySelector('div.connecting-cycle').style.background = '#f21818de'
                obj['this'].shadowRoot.querySelector('div.connecting-cycle').style.color = '#93fff5'
                obj['this'].shadowRoot.querySelector('div.connecting-cycle').innerHTML = 'ON AIR'
                for (let item of button) {
                    obj['this'].shadowRoot.querySelector(`div.${item}`).addEventListener('click', async (event) => {
                        event.currentTarget.style.background = '#faf671'
                        let object = event.currentTarget
                        let value = object.querySelector('p.value').innerHTML
                        await navigator.clipboard.writeText(value)
                        let timer = setTimeout((event) => {
                            object.style.background = '#4c6499de'
                            clearTimeout(timer);
                        }, 250);
                    })
                }
                 */
                console.log('sssssss CHANGE sssssssssss', pass)
            }
        })
    })
}

export default {
    description: 'action'
}