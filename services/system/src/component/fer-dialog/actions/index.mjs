export const actions = (self) => {
    return new Promise(async (resolve, reject) => {
        const ferNotificetion = document.querySelector('fer-notification');

        resolve({
            closeButtonClick: (event) => {
                ferNotificetion.closeToasts();
                self.open = false
            },
            clickFerSelect: (event) => {
                const ferSelect = self.shadowRoot.querySelectorAll('fer-select')
                if(ferSelect.length !== 0) {
                    for(let item of ferSelect) {
                        const withinBoundaries = event.composedPath().includes(item);
                        if(!withinBoundaries) {
                            item.open = false
                        }
                    }
                }
            },
            executorValidators: async (payload) => models.post.executor.validators(),
            click: (event) => {
                event.stopPropagation();
                let isClose= true
                event.composedPath().forEach(item => {
                    if(item.classList?.contains('content')) {
                        isClose = false
                    }
                })

                const title = event.currentTarget.shadowRoot.querySelector('.title')

                if(isClose && !title.textContent.includes('описание ошибки')) {
                    self.open = false

                    ferNotificetion.closeToasts();
                }
            }
        })
    })
}

export default {
    description: 'actions fer-dialog'
}