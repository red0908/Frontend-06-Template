import {createElement} from './framework'
let c = <div>1</div>
c.mountTo(document.body)

this.root.addEventLisener('mousedown',(e) => {
  let startX = e.clientX, startY = e.clientY
  let move = e => {
    let x = e.clientX - startX
    let y = e.clientY - startY
  }
  let up = e => {
    let x = e.clientX - startX
    let y = e.clientY - startY
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)
  }
  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
})