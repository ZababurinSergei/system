// import events from '/static/html/components/manager-board/external/events.mjs'

import dragContainer from './drag_a/dragContainer.mjs'
// import board from './board/index.mjs'
// import isEmpty from '../../../../this/index.mjs'
// export default async (v,p,c,obj,r) => {
//     await board(v,p,c,obj,r)
//
//     let template_script = (!obj.preset.status)
//         ? {}
//         : (await import(`/static/html/components/manager-board/template/${obj.preset.name}/${obj.preset.name}.mjs`))['default']
//
//     if(!isEmpty(template_script)) {
//         await template_script(v,p,c,obj,r)
//     }
//
//     events(v,p,c,obj,r)
// }

export const board = async (v,p,c,obj,r) => {
    let container = await dragContainer(v,p,c,obj,r)
    let items = obj.this.shadowRoot.querySelectorAll('.manager-board__item_td')
    for(let i = 0; i < items.length; i++) {
        new container.drag(items[i], 'swap');
    }
}