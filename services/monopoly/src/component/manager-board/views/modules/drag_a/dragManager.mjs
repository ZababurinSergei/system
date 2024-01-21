export default async (v,p,c,obj,r) => {
    let DragManager = {
        dragContainers: [],
        currentContainer: null,
    
    add: function(dragContainer) {
        this.dragContainers.push(dragContainer);
    },
    handleEvent: function(event) {
        if (event.type == 'dragstart'  || event.type == 'touchstart') {
            if(event.type == 'touchstart') {
                event.preventDefault()
            }
             let containers = this.dragContainers.filter(function(container) {
                return container.contains(event.target);
            });
            if (containers.length > 0) {
                this.currentContainer = containers[0];
                this.currentContainer.activate();
            }
        }
        
        if (this.currentContainer !== null) {
            this.currentContainer.handleEvent(event);
            
           
            if (event.type == 'dragend' || event.type == 'touchend') {
                    this.currentContainer.deactivate();
                    this.currentContainer = null;
                }
            }
        }
    }
    return DragManager
}
