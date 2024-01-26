import { isEmpty } from '../../../../../this/index.mjs'

let object = {
    draggingItem: {},
    touchLocation: {},
    touchEl: {},
    lastMove: {},
    board: {
        self: {},
        width:'',
        height:''
    },
    dragging: {
        conrainer: {},
        image: {}
    },
    active: {
        element: {},
        coord: ''
    }
}
export default async (v,p,c,obj,r) => {
   async function touchstart(event, self, obj) {
    event.preventDefault();
        if(!isEmpty(self.element.querySelector('.manager-board__item_td_img'))) {
            object.dragging.conrainer = await self.item(self.element.querySelector('.manager-board__item_td_img'));
            object.dragging.image = object.dragging.conrainer.querySelector('.manager-board__item_td_img')
        } else {
            object.draggingItem = {}
        }
        // event.dataTransfer.setData('text/html', this.draggingItem.innerHTML);
       // this.classList.add('drag-item--touchmove');
    }
    let scrollDelay = 0;
    let scrollDirection = 1;
    function pageScroll(a, b) {
        window.scrollBy(0,scrollDirection); // horizontal and vertical scroll increments
        scrollDelay = setTimeout(pageScroll,5); // scrolls every 100 milliseconds

        if (a > window.innerHeight - b) { scrollDirection = 1; }
        if (a < 0 + b) { scrollDirection = -1*scrollDirection; }
    }

    var x = 1;
   async function touchmove(event, self, obj) {
       if(!isEmpty(object.dragging.image)) {
        object.touchLocation = event.targetTouches[0]
        object.board.self = obj['this'].shadowRoot.querySelector('.board')
        object.board.width = object.board.self.offsetWidth,
        object.board.height = object.board.self.offsetHeight;
        object.lastMove = event;
        object.touchEl = await self.item(event.target);
        object.dragging.image.style.width = self.element.offsetWidth + 'px';
        object.dragging.image.style.height = self.element.offsetHeight + 'px';
        object.dragging.image.style.position = 'fixed';
        object.dragging.image.style.left = object.touchLocation.clientX - self.element.offsetWidth/2 + 'px';
        object.dragging.image.style.top = object.touchLocation.clientY - self.element.offsetHeight/2 + 'px';
        let element = obj['this']['shadowRoot'].elementsFromPoint(object.touchLocation.clientX - self.element.offsetWidth/12 , object.touchLocation.clientY - self.element.offsetHeight/12 )
        if(!isEmpty(element[1].dataset.item)) {
            if(object.active.coord !== element[1].dataset.item) {
                if(!isEmpty(object.active.element)) {
                    object.active.element.removeAttribute("style");
                }
                object.active.element = await self.item(element[1])
                object.active.coord = element[1].dataset.item
                object.active.element.style.background = 'blue'
            } else {

            }
          } 
       }
    }

    function touchend(event, self, obj) {
        if(!isEmpty(object.dragging.image)) { 
            let swap = {
                self: object.touchEl,
                image: object.dragging.image,
                selfActive: object.active.element,
                active: (isEmpty(object.active.element.querySelector('.manager-board__item_td_img')))
                ?''
                :object.active.element.querySelector('.manager-board__item_td_img').cloneNode(true)
            }
            if(!isEmpty(swap.active) && !isEmpty(swap.image)) {
                swap.active.dataset.item = swap.self.dataset.item 
                swap.image.dataset.item = object.active.element.dataset.item
            } else {
                if(!isEmpty(swap.active)) {
                    swap.active.dataset.item = swap.self.dataset.item
                }
                if(!isEmpty(swap.image)) {
                    swap.image.dataset.item = object.active.element.dataset.item
                }
            }
            object.active.element.removeAttribute("style");
            swap.self.innerHTML = ''
            if(!isEmpty(swap.active)) {
                swap.self.appendChild(swap.active)
                if(swap.self.classList.contains('manager-board__item_td_empty')){
                    swap.self.classList.remove('manager-board__item_td_empty');
                }    
            } else {
                if(!swap.self.classList.contains('manager-board__item_td_empty')){
                    swap.self.classList.add('manager-board__item_td_empty');
                }
            }

            swap.selfActive.innerHTML = ''
            if(!isEmpty(swap.image)) {
                swap.image.removeAttribute("style");
                swap.selfActive.appendChild(swap.image) 
                if(swap.selfActive.classList.contains('manager-board__item_td_empty')){
                    swap.selfActive.classList.remove('manager-board__item_td_empty');
                }            
            } else {
                if(!swap.selfActive.classList.contains('manager-board__item_td_empty')){
                    swap.selfActive.classList.add('manager-board__item_td_empty');
                }
            }

         

            object.draggingItem = {}
            object.touchLocation = {}
            object.touchEl = {}
            object.lastMove = {}
            object.board.self = {}
            object.board.width = ''
            object.board.height = ''
            object.dragging.conrainer = {}
            object.dragging.image = {}
            object.active.element = {}
            object.active.coord = ''
            object.touchEl = {}
        }
    }


    return{
        touchstart:touchstart,
        touchmove: touchmove,
        touchend: touchend,
    }
}