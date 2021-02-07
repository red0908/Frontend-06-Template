import { TimeLine, Animation } from './timeLine.js'
import { ease, easeIn } from './UnitBezier.js'


let tl = new TimeLine()
let animation = new Animation(document.getElementById('el').style, 'transform', 0, 500, 2000, 0, easeIn, v => `translateX(${v}px)`)

tl.start()
tl.addAnimation(animation)
document.querySelector('#el2').style.transition = 'transform ease-in 2s'
document.querySelector('#el2').style.transform = 'translateX(500px)'
document.querySelector('#pause-btn').addEventListener('click', () => tl.pause())
document.querySelector('#remuse-btn').addEventListener('click', () => tl.resume())
