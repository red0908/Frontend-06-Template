const TICK = Symbol('tick')
const TICK_HANDLER = Symbol('tick_handler')
const ANIMATION = Symbol('animation')
const START_TIME = Symbol('start_time')
const PAUSE_START = Symbol('pause_start')
const PAUSE_TIME = Symbol('pause_time')
export class TimeLine {
  constructor () {
    this.state = 'inited'
    this[ANIMATION] = new Set()
    this[START_TIME] = new Map()
    this[PAUSE_TIME] = 0
  }
  start () {
    if (this.state !== 'inited')
      return
    this.state = 'started'
    let startTime = Date.now()
    this[TICK] = () => {
      let now = Date.now()
      for (const animation of this[ANIMATION]) {
        let t
        if (this[START_TIME].get(animation) < startTime)
          t = now - startTime - this[PAUSE_TIME] - animation.delay
        else
          t = now - this[START_TIME].get(animation) - this[PAUSE_TIME] - animation.delay
        if (animation.duration < t) {
          this[ANIMATION].delete(animation)
          t = animation.duration
        }
        if (t > 0)
          animation.receiveTime(t)
      }
      this[TICK_HANDLER] = requestAnimationFrame(this[TICK])
    }
    this[TICK]()
  }
  pause () {
    if (this.state !== 'started')
      return
    this.state = 'paused'
    this[PAUSE_START] = Date.now()
    cancelAnimationFrame(this[TICK_HANDLER])
  }
  resume () {
    if (this.state !== 'paused')
      return
    this.state = 'started'
    this[PAUSE_TIME] = Date.now() - this[PAUSE_START]
    this[TICK]()
  }
  reset () {
    this.pause()
    this.state = 'inited'
    this[PAUSE_TIME] = 0
    this[ANIMATION] = new Set()
    this[START_TIME] = new Map()
    this[PAUSE_START] = 0
    this[TICK_HANDLER] = null
  }
  addAnimation (animation, startTime) {
    if (arguments.length < 2) {
      startTime = Date.now()
    }
    this[START_TIME].set(animation, startTime)
    this[ANIMATION].add(animation)
  }
}
export class Animation {
  constructor (object, property, startVal, endVal, duration, delay, timingFun, template) {
    timingFun = timingFun || (v => v)
    template = template || (v => v)
    this.object = object
    this.property = property
    this.startVal = startVal
    this.endVal = endVal
    this.duration = duration
    this.timingFun = timingFun
    this.delay = delay
    this.template = template
  }
  receiveTime (time) {
    let range = this.endVal - this.startVal
    let progress = this.timingFun(time / this.duration)
    this.object[this.property] = this.template(this.startVal + progress * range)
  }
}
