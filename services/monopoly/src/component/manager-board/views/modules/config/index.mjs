let config = async (obj, type) => {
    if(obj.preset === undefined) {
        let board = await fetch(`/static/html/components/manager-board/template/index/index.json`)
        board = await board.json()
        return board
    } else {
        if(obj.preset.status) {
            try {
                let board = await fetch(`/config/board/template/index.json`)
                board = await board.json()
                return board
            } catch (e) {
                console.error('произошла ошибка при получении json объекта монополии', e)
                return e
            }
        } else {
            console.warn('не установлен пресет для компонента manager-board (устанавливается <manger-board preset="index"></manger-board>')
            try {
                let board = await fetch(`/config/board/template/index.json`)
                board = await board.json()
                return board
            } catch (e) {
                console.error('произошла ошибка при получении json объекта монополии', e)
                return e
            }
        }
    }
}
let count = -1
function tr(p, obj) {
    let tr = document.createElement('div')
    tr.classList.add('manager-board__item_tr')
    obj.managerBoard.appendChild(tr)
    return tr
}

let trTemp = {}
let tdTemp = {}

/*
if(r === 'empty') {
      //  p.tr.insertAdjacentHTML('beforeend',
      //  `<div class="manager-board__item_td_empty manager-board__item_td_${p.coord.x}:${p.coord.y}"></div>`)
   //     td.classList.add(`manager-board__item_td_empty manager-board__item_td_empty_${p.coord.x}:${p.coord.y}`);
    } else {
      //  p.tr.insertAdjacentHTML('beforeend',
      //  `<div class="manager-board__item_td manager-board__item_td_${p.coord.x}:${p.coord.y}"></div>`)
    }
*/
function td(p, obj, r) {
    let td = document.createElement('div')
    td.classList.add(`${p.coord.y}:${p.coord.x}`);
    td.classList.add('manager-board__item_td');
    td.dataset.item = `${p.coord.y}:${p.coord.x}`;
    if(r === 'empty') {
        td.classList.add(`${p.coord.y}:${p.coord.x}`);
        td.classList.add('manager-board__item_td_empty');
        td.dataset.item = `${p.coord.y}:${p.coord.x}`;
    }

    p.tr.appendChild(td)
    return td
}

function img(p, obj){
    p.td.insertAdjacentHTML('beforeend',
        `<img class="${p.coord.y}:${p.coord.x} manager-board__item_td_img  ${p.class}_${p.coord.y}:${p.coord.x}" data-item="${p.coord.y}:${p.coord.x}" src="/images/monopoly/board/default/images/${p.class}.png">`)
}

function output(p,obj) {
    if(p.index === 0) {
        count++
        trTemp = tr(p,obj)
    }
    tdTemp = td({
        tr: trTemp,
        coord:{
            x: p.index.toString().padStart(2, 0),
            y: count.toString().padStart(2, 0)
        }
    },obj, p.item)
    if(p.item !== 'empty') {
        img({
            td: tdTemp,
            class: p.item,
            coord:{
                x: p.index.toString().padStart(2, 0),
                y: count.toString().padStart(2, 0)
            }
        }, obj)
    }

    console.log('count', count, p.index, p.item)
}

export default async (obj,type) => {
    let image = 11
    let state = 0
    let out = 0
    let board = await config(obj, type)
    console.log('=== board ===', board)
    obj.managerBoard = obj['this']['shadowRoot'].querySelector('.board')
    for(let index=0; index< board.places.length; index++) {
        if(index === image && image !== 40) {
            image = (image !== 29)?image + 2: image + 11
            state = 1
            out = 0
        } else {
            if(image === 11 || image === 40) {
                state = 2
                if(index > 11) {
                    out = index - 29
                } else {
                    out = index
                }
            } else {
                image = (image === 29)?image + 11: image
                out = 10
                state = 3
            }
        }
        output({
            index:out,
            item: board.places[index]
        }, obj)
        // console.log('out:', out, board.places[index])
        if(state === 1) {
            for(let i =1; i < 10;i++){
                output({
                    index: i,
                    item: 'empty'
                }, obj)
                // output(v,'empty',c,obj,r)
                // console.log('out:', i, 'empty')
            }
        }
    }
}