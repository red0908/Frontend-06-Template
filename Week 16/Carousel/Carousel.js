import { Component, STATE, ATTRIBUTE } from './Framework'
import { enableGesture } from './Gesture'
import { TimeLine, Animation } from './Animation'
import {ease} from './UnitBezier'

export {STATE, ATTRIBUTE} from './Framework'

export class Carousel extends Component {
  constructor () {
    super()
  }
  render () {
    this.root = document.createElement('div')
    this.root.classList.add('carousel')
    for (const pic of this[ATTRIBUTE].data) {
      let img = document.createElement('div')
      img.style.backgroundImage = `url(${pic.img})`
      this.root.appendChild(img)
    }

    enableGesture(this.root)
    let timeLine = new TimeLine()
    timeLine.start()
    /**鼠标操作手动轮播*/
    this[STATE].position = 0
    let handler = null
    let t = 0
    let ax = 0

    let children = this.root.children
    this.root.addEventListener('start', e => {
      timeLine.pause()
      clearInterval(handler)
      let progress = (Date.now() - t) / 500
      ax = ease(progress) * 500 - 500
    })
    this.root.addEventListener('pan', e => {
      let x = e.clientX - e.startX - ax
      let current = this[STATE].position - ((x - x % 500) / 500)
      for (const offset of [-1, 0, 1]) {
        let pos = current + offset
        pos = (pos % children.length + children.length) % children.length
        children[pos].style.transition = 'none'
        children[pos].style.transform = `translateX(${ - pos * 500 + offset * 500 + x % 500 }px)`
      }      
    })
    this.root.addEventListener('tap', e => {
      this.triggerEvent('click', {
        position: this[STATE].position,
        data: this[ATTRIBUTE].data[this[STATE].position]
      })
    })
    this.root.addEventListener('end', e => {

      timeLine.reset()
      timeLine.start()
      handler = setInterval(nextPic, 3000)

      let x = e.clientX - e.startX - ax
      let current = this[STATE].position - ((x - x % 500) / 500)

      let xCut = x % 500
      let direction = Math.round(xCut / 500)
      if (e.isFlick) {
        if (e.vilocity < 0) {
          direction = Math.ceil((x % 500) / 500)
        } else {
          direction = Math.floor((x % 500) / 500)
        }
      }

      for (const offset of [-1, 0, 1]) {
        let pos = current + offset
        // 算出位置，取整数为正
        pos = (pos % children.length + children.length) % children.length
        children[pos].style.transition = 'none'
        timeLine.addAnimation(new Animation(children[pos].style, 'transform',
          - pos * 500 + offset * 500 + x % 500,
          - pos * 500 + offset * 500 + direction * 500,
          1500, 0, ease, v => `translateX(${v}px)`
        ))
      }
      this[STATE].position = this[STATE].position - ((x - x % 500) / 500) - direction
      // 算出位置，取整数为正
      this[STATE].position = (this[STATE].position % children.length + children.length) % children.length
      this.triggerEvent('change', {position: this[STATE].position})
    })
    let nextPic = () => {
      let children = this.root.children
      let nextIndex = (this[STATE].position + 1) % children.length

      let current = children[this[STATE].position]
      let next = children[nextIndex]
      t = Date.now()
      // 是当前的位置加上100%
      timeLine.addAnimation(new Animation(current.style, 'transform',
       - this[STATE].position * 500, - 500 - this[STATE].position * 500, 500, 0, ease, v => `translateX(${v}px)`))
      timeLine.addAnimation(new Animation(next.style, 'transform',
       500 - nextIndex * 500, - nextIndex * 500, 500, 0, ease, v => `translateX(${v}px)`))

       this[STATE].position = nextIndex
       this.triggerEvent('change', {position: this[STATE].position})

    }
    handler = setInterval(nextPic, 3000)
    return this.root
  }
  mountTo (parent) {
    parent.appendChild(this.render())
  }
}