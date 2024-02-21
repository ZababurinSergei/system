export default async (self, actions) => {
    const privateKey = self.shadowRoot.querySelector('#auction-auth__create_private')
    const publicKey = self.shadowRoot.querySelector('#auction-auth__create_public')
    const stageKey = self.shadowRoot.querySelector('#auction-auth__create_stage')
    const password = self.shadowRoot.querySelector('#auction-auth__password_item_create')

    return {
        init: () => {
            privateKey?.addEventListener('change', actions.change)
            publicKey?.addEventListener('change', actions.change)
            stageKey?.addEventListener('change', actions.change)
            password?.addEventListener('input', actions.input)

        },
        terminate: () => {
            privateKey?.removeEventListener('change', actions.change)
            publicKey?.removeEventListener('change', actions.change)
            stageKey?.removeEventListener('change', actions.change)
            password?.removeEventListener('input', actions.input)
        }
    }
}