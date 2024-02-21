import { config, dragContainer} from '../../views/index.mjs'

export default async (self, actions) => {
    return {
        init: async () => {
            await config({
                this: self,
                preset: {
                    status: true
                }
            }, 'default')

            let container = await dragContainer({
                this: self
            })

            let items = self.shadowRoot.querySelectorAll('.manager-board__item_td')
            for(let i = 0; i < items.length; i++) {
                new container.drag(items[i], 'swap');
            }
        },
        terminate: () => {

        }
    }
}