import { Component } from './framework'
export class Carousel extends Component {
  constructor () {
    super()
    this.attribute = Object.create(null)
  }
  render () {
    this.root = document.createElement('div')
    this.root.classList.add('carousel')
    for (const src of this.attribute.src) {
      let img = document.createElement('div')
      img.style.backgroundImage = `url(${src})`
      this.root.appendChild(img)
    }
    /**鼠标操作手动轮播*/
    let position = 0
    this.root.addEventListener('mousedown', (e) => {
      // console.log('mousedown')
      let children = this.root.children
      let startX = e.clientX
      let move = e => {
        let x = e.clientX - startX
        let current = position - ((x - x % 500) / 500)
        for (const offset of [-1, 0, 1]) {
          let pos = current + offset
          pos = (pos + children.length) % children.length
          children[pos].style.transition = 'none'
          children[pos].style.transform = `translateX(${ - pos * 500 + offset * 500 + x % 500 }px)`
        }
      }
      let up = e => {
        let x = e.clientX - startX
        position = position - Math.round(x / 500)
        for (const offset of [0, -Math.sign(Math.round(x / 500) - x + 250 * Math.sign(x))]) {
          console.log(Math.round(x / 500), '-', x, '+', 250 * Math.sign(x))
          console.log(Math.round(x / 500) - x + 250 * Math.sign(x))
          let pos = position + offset
          pos = (pos + children.length) % children.length
          console.log('pos:',pos)
          console.log('offset:', offset)
          children[pos].style.transition = ''
          children[pos].style.transform = `translateX(${ - pos * 500 + offset * 500 }px)`
          console.log(children[pos].style.transform)
        }
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }
      document.addEventListener('mousemove',move)
      document.addEventListener('mouseup', up)
    })
    return this.root
  }
  setAttribute (name, val) {
    this.attribute[name] = val
  }
  mountTo (parent) {
    parent.appendChild(this.render())
  }
}