// 鼠标事件
let contexts = new Map()
let isListeningMouse = false
let element = document.documentElement
element.addEventListener('mousedown', (event) => {
  let context = Object.create(null)
  contexts.set('mouse' + (1 << event.button), context)
  start(event, context)
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
        move(event, context)
      }
      button = button << 1
    }
  }
  let mouseup = (event) => {
    let context = contexts.get('mouse' + (1 << event.button))
    end(event, context)
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
    start(touch, context)
  }
})
element.addEventListener('touchmove', event=> {
  for (const touch of event.changedTouches) {
    let context = contexts.get(touch.identifier)
    move(touch, context)
  }
})
element.addEventListener('touchend', event=> {
  for (const touch of event.changedTouches) {
    let context = contexts.get(touch.identifier)
    end(touch, context)
  }
})
element.addEventListener('touchcancel', event=> {
  for (const touch of event.changedTouches) {
    let context = contexts.get(touch.identifier)
    cancel(touch, context)
  }
})
// 统一抽象
let start = (point, context) => {
  context.startX = point.clientX
  context.startY = point.clientY

  context.points = [{
    t: Date.now(),
    x: point.clientX,
    y: point.clientY
  }]

  context.isPan = false
  context.isPress = false
  context.istap = true
  context.handler = setTimeout(()=> {
    console.log('press')
    context.isPan = false
    context.istap = false
    context.isPress = true
    context.handler = null
  }, 500)
}
let move = (point, context) => {
  let dx = (point.clientX - context.startX) ** 2 , dy = (point.clientY - context.startY) ** 2
  let distance = dx + dy

  if (!contexts.isPan && distance > 100) {
    context.isPress = false
    context.istap = false
    context.isPan = true
    console.log('pan start')
    clearTimeout(context.handler)
  }
  if (context.isPan) {
    console.log(dx, dy)
    console.log('pan')
  }
  contexts.points = context.points.filter(point => Date.now() - point.t < 500)
  context.points.push({
    t: Date.now(),
    x: point.clientX,
    y: point.clientY
  })
}
let end = (point, context) => {
  if (context.istap) {
    console.log('tap')
    dispatch('tap')
    clearTimeout(context.handler)
  }
  if (context.isPan) {
    console.log('pan end')
  }
  if (context.isPress) {
    console.log('press end')
  }
  contexts.points = context.points.filter(point => Date.now() - point.t < 500)
  let d, v
  if (!context.points.length) {
    v = 0
  } else {
    d = Math.sqrt((point.clientX - context.points[0].x) **2 + (point.clientY - context.points[0].y) **2)
    v = d / (Date.now() - context.points[0].t)
  }
  if (v > 1.5) {
    console.log('flick')
    context.isFlick = true
  } else {
    context.isFlick = false
  }
}
let cancel = (point, context) => {
  console.log('cancel', point.clientX, point.clientY)
  clearTimeout(context.handler)
}

function dispatch (type, properties) {
  let event = new Event(type)
  for (const name in properties) {
    event[name] = properties[name]
  }
  element.dispatchEvent(event)
}
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

  }
  start (point, context) {
    context.startX = point.clientX
    context.startY = point.clientY
  
    context.points = [{
      t: Date.now(),
      x: point.clientX,
      y: point.clientY
    }]
  
    context.isPan = false
    context.isPress = false
    context.istap = true
    context.handler = setTimeout(()=> {
      console.log('press')
      context.isPan = false
      context.istap = false
      context.isPress = true
      context.handler = null
    }, 500)
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
