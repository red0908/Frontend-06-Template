import { createElement } from './framework'
import { Carousel } from './carousel'
import { TimeLine, Animation } from './timeLine'

let carImgs = [
  'https://static001.geekbang.org/resource/image/bd/2e/bddfad3dc8fb2f7c4942a0dc1286c92e.jpg',
  'https://static001.geekbang.org/resource/image/9b/74/9b6e9e3ac4415ffc166a8ea277c58d74.jpg',
  'https://static001.geekbang.org/resource/image/13/c7/13b7877ec262155ae5e7e20340a46ac7.jpg',
  'https://static001.geekbang.org/resource/image/73/2a/737fb9f94c18a26a875c27169222b82a.jpg'
]
// let a = <Carousel src={carImgs}/>
// a.mountTo(document.body)

let tl = new TimeLine()
window.tl = tl
window.animation = new Animation({ set a (t) {console.log(t)}}, 'a', 0, 100, 1000, 0, null)
