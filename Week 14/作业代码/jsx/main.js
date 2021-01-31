import { Component, createElement } from './framework'
class Carousel extends Component {
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
    // let current = 0
    // setInterval(() => {
    //   let children = this.root.children
    //   ++current
    //   current = current % children.length
    //   for (const child of children) {
    //     child.style.transform = `translateX(-${current * 100}%)`
    //   }
    // }, 3000)
    /*自动轮播*/
    /*
    let currentIndex = 0
    setInterval(() => {
      let children = this.root.children
      let nextIndex = (currentIndex + 1) % children.length
      let current = children[currentIndex]
      let next = children[nextIndex]

      // 是当前的位置加上100%
      next.style.transition = 'none'
      next.style.transform = `translateX(${ - nextIndex * 100 + 100 }%)`
      // 16毫秒为浏览器的一帧
      setTimeout(() => {
        next.style.transition = ''
        current.style.transform = `translateX(${ - 100 - currentIndex * 100}%)`
        next.style.transform = `translateX(${ - nextIndex * 100}%)`
        currentIndex = nextIndex
      }, 16)
    }, 3000)*/
    /**鼠标操作手动轮播*/
    let position = 0
    this.root.addEventListener('mousedown', (e) => {
      // console.log('mousedown')
      let children = this.root.children
      let startX = e.clientX
      let move = e => {
        let x = e.clientX - startX
        console.log(x)
        console.log(((x - x % 500) / 500))
        let current = position - ((x - x % 500) / 500)
        for (const offset of [-1, 0, 1]) {
          let pos = current + offset
          pos = (pos + children.length) % children.length
          children[pos].style.transition = 'none'
          children[pos].style.transform = `translateX(${ - pos * 500 + offset * 500 + x % 500 }px)`
        }
        // console.log('mousemove')
      }
      let up = e => {
        let x = e.clientX - startX
        position = position - Math.round(x / 500)
        for (const offset of [0, -Math.sign(Math.round(x / 500) - x + 250 * Math.sign(x))]) {
          let pos = position + offset
          pos = (pos + children.length) % children.length
          children[pos].style.transition = ''
          children[pos].style.transform = `translateX(${ - pos * 500 + offset * 500 }px)`
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
let carImgs = [
  'https://static001.geekbang.org/resource/image/bd/2e/bddfad3dc8fb2f7c4942a0dc1286c92e.jpg',
  'https://static001.geekbang.org/resource/image/9b/74/9b6e9e3ac4415ffc166a8ea277c58d74.jpg',
  'https://static001.geekbang.org/resource/image/13/c7/13b7877ec262155ae5e7e20340a46ac7.jpg',
  'https://static001.geekbang.org/resource/image/73/2a/737fb9f94c18a26a875c27169222b82a.jpg'
]
let a = <Carousel src={carImgs}/>
// document.body.appendChild(a)
a.mountTo(document.body)
