import dragContainer from './drag_a/dragContainer.mjs'
import config from './config/index.mjs'
//      modules(true,0,'red',obj,'waves-game-card')

export { config }
export { dragContainer }
// export const board = async (self, type) => {
//     let container = await dragContainer(self, type)
//     let items = self.shadowRoot.querySelectorAll('.manager-board__item_td')
//     for(let i = 0; i < items.length; i++) {
//         new container.drag(items[i], 'swap');
//     }
// }