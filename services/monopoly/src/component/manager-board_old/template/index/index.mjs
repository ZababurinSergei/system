import dragContainer from '/static/html/components/component_modules/drag_a/dragContainer.mjs'

export default async (v,p,c,obj,r) => { 
  let container = await dragContainer(v,p,c,obj,r)
  let items = obj.this.shadowRoot.querySelectorAll('.manager-board__item_td')
  for(let i = 0; i < items.length; i++) {
    new container.drag(items[i], 'swap');
  }
}