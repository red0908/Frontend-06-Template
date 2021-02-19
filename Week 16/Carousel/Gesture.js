// 监听
export class Linsener {
  constructor (element, recognizer) {
    let contexts = new Map()
    let isListeningMouse = false
    element.addEventListener('mousedown', (event) => {
      let context = Object.create(null)
      contexts.set('mouse' + (1 << event.button), context)
      recognizer.start(event, context)
      let mousemove = (event) => {
        let button = 1
        while (button <= event.buttons) {
          if (button & event.buttons) {
            let key
            if (button === 2)
              key = 4
            else if (button === 4)
              key = 2
            else
              key = button
            let context = contexts.get('mouse' + key)
            recognizer.move(event, context)
          }
          button = button << 1
        }
      }
      let mouseup = (event) => {
        let context = contexts.get('mouse' + (1 << event.button))
        recognizer.end(event, context)
        contexts.delete('mouse' + (1 << event.button))
        if (event.buttons === 0) {
          document.removeEventListener('mousemove', mousemove)
          document.removeEventListener('mouseup', mouseup)
          isListeningMouse = false
        }
      }
      if (!isListeningMouse) {
        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)
        isListeningMouse = true
      }
    })
    // 手势事件
    element.addEventListener('touchstart', event=> {
      for (const touch of event.changedTouches) {
        let context = Object.create(null)
        contexts.set(touch.identifier, context)
        recognizer.start(touch, context)
      }
    })
    element.addEventListener('touchmove', event=> {
      for (const touch of event.changedTouches) {
        let context = contexts.get(touch.identifier)
        recognizer.move(touch, context)
      }
    })
    element.addEventListener('touchend', event=> {
      for (const touch of event.changedTouches) {
        let context = contexts.get(touch.identifier)
        recognizer.end(touch, context)
      }
    })
    element.addEventListener('touchcancel', event=> {
      for (const touch of event.changedTouches) {
        let context = contexts.get(touch.identifier)
        recognizer.cancel(touch, context)
      }
    })
  }
}
// 识别
export class Recognizer {
  constructor (dispatcher) {
    this.dispatcher = dispatcher
  }
  start (point, context) {
    context.startX = point.clientX
    context.startY = point.clientY

    this.dispatcher.dispatch('start', {
      clientX: point.clientX,
      clientY: point.clientY
    })
  
    context.points = [{
      t: Date.now(),
      x: point.clientX,
      y: point.clientY
    }]
  
    context.isPan = false
    context.isPress = false
    context.istap = true
    context.handler = setTimeout(()=> {
      this.dispatcher.dispatch('press', {})
      context.isPan = false
      context.istap = false
      context.isPress = true
      context.handler = null
    }, 500)
  }
  move (point, context) {
    let dx = (point.clientX - context.startX) ** 2 , dy = (point.clientY - context.startY) ** 2
    let distance = dx + dy
  
    if (!context.isPan && distance > 100) {
      context.isPress = false
      context.istap = false
      context.isPan = true
      context.isVertical = Math.abs(dx) < Math.abs(dy)
      this.dispatcher.dispatch('panstart', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical
      })
      clearTimeout(context.handler)
    }
    if (context.isPan) {
      this.dispatcher.dispatch('pan', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical
      })
    }
    context.points = context.points.filter(point => Date.now() - point.t < 500)
    context.points.push({
      t: Date.now(),
      x: point.clientX,
      y: point.clientY
    })
  }
  end (point, context) {
    if (context.istap) {
      this.dispatcher.dispatch('tap', {})
      clearTimeout(context.handler)
    }
    if (context.isPress) {
      this.dispatcher.dispatch('pressend', {})
    }
    context.points = context.points.filter(point => Date.now() - point.t < 500)
    let d, v
    if (!context.points.length) {
      v = 0
    } else {
      d = Math.sqrt((point.clientX - context.points[0].x) **2 + (point.clientY - context.points[0].y) **2)
      v = d / (Date.now() - context.points[0].t)
    }
    if (v > 1.5) {
      context.isFlick = true
      this.dispatcher.dispatch('flick', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
        velocity: v // 速度
      })
    } else {
      context.isFlick = false
    }

    if (context.isPan) {
      this.dispatcher.dispatch('panend', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
        velocity: v // 速度
      })
    }

    this.dispatcher.dispatch('end', {
      startX: context.startX,
      startY: context.startY,
      clientX: point.clientX,
      clientY: point.clientY,
      isVertical: context.isVertical,
      isFlick: context.isFlick,
      velocity: v // 速度
    })
  }
  cancel (point, context) {
    this.dispatcher.dispatch('cancel', {})
    clearTimeout(context.handler)
  }
}
// 分发
export class Dispatcher {
  constructor (element) {
    this.element = element
  }
  dispatch (type, properties) {
    let event = new Event(type)
    for (const name in properties) {
      event[name] = properties[name]
    }
    this.element.dispatchEvent(event)
  }
}
export function enableGesture (element) {
  new Linsener(element, new Recognizer(new Dispatcher(element)))
}
