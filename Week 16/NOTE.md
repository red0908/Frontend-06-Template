# 组件化

## 手势动画应用

我们完成了手势组件和动画组件，然后我们要将动画组件的功能和手势组件的功能整合到Carousel组件中。

这里我们将Gestrue和Animation都导入到Carousel中。

##### 1. 手势

* 将 Carousel 组件的 安装手势组件的功能 ```enableGesture(this.root)```
* 在root的手势pan事件上改变它的child的位置变换
* 在root的手势end事件上计算调整位置

##### 2.动画

* 初始化时间线，打开动画。
* 制定一个nextPic函数，给时间线添加关键帧动画，制定setInterval每3秒执行一次。
* 在root的手势start事件上，暂停时间线，记录动画位移
* 在root的手势end事件上，打开重置时间线，开始动画。

##### 3.重要代码

```js
// Carousel.js
// 部分代码省略
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
```

## 为组件添加更多属性

### 1. 轮播组件的完善

#### 1.1 组件属性的私有化管理

为了保证组件属性的私有化，我们在Framework中添加两个Symble类型的变量，来实现组件的状态管理。

```js
// Framework.js
// 部分代码省略
export const STATE = Symbol('state')
export const ATTRIBUTE = Symbol('attribute')
export class Component {
  constructor () {
    this[ATTRIBUTE] = Object.create(null)
    this[STATE] = Object.create(null)
  }
  setAttribute (name, val) {
    this[ATTRIBUTE][name] = val
  }
  appendChild (child) {
    child.mountTo(this.root)
  }
  mountTo (parent) {
    if (!this.root)
      this.render()
    parent.appendChild(this.root)
  }
  render () {
    return this.root
  }
}
```

把ATTRIBUTE和STATE导入Carousel，将Carousel组件中的属性相关变量用this[ATTRIBUTE]替代，将Carousel中类似于positon的变量存储在this[STATE]对象中。

#### 1.2 为轮播组件添加事件

组件还有一个重要的特性就是需要开放事件接口，给组件的使用者调用，以完成具体业务功能。这里我们为Carousel组件添加一个change和click事件。

* Component class 的改造：为其添加一个triggerEvent函数

```js
export class Component {
// 部分代码省略
  triggerEvent (type, args) {
    this[ATTRIBUTE]['on' + type.replace(/^[\s\S]/, s => s.toUpperCase())](new CustomEvent(type, {detail: args}))
  }
}
```

* 在Carousel中寻找合适的位置调用

```js
// Carousel.js
// 部分代码省略
class Carousel extends Component {
  render () {
    // ...
   this.root.addEventListener('tap', e => {
      this.triggerEvent('click', {
        position: this[STATE].position,
        data: this[ATTRIBUTE].data[this[STATE].position]
      })
    })
    
   this.root.addEventListener('end', e => {
			// ...
    
       this.triggerEvent('change', {position: this[STATE].position})
			// ...
    }
    let nextPic = () => {

       this.triggerEvent('change', {position: this[STATE].position})
				// ...
    }                          
    // ...
  }
}
```

```js
// main.js
// 部分代码省略
let a = <Carousel 
  data={carImgs}
  onChange={event => console.log(event.detail.position)}
  onClick={event => location.href = event.detail.data.url}/>
a.mountTo(document.body)
```

### 2. 组件的Children实例

#### 2.1 Button —— 普通内容型Children

```js
// Button.js
import { Component, STATE, ATTRIBUTE, createElement } from './Framework'

export class Button extends Component{
  constructor () {
    super()
  }
  render () {
    this.childrenContainer = <span></span>
    this.root = (<div>{this.childrenContainer}</div>).render()
    return this.root
  }
  appendChild (child) {
    if (!this.childrenContainer)
      this.render()
    this.childrenContainer.appendChild(child)
  }
}
// main.js
/**Button组件，普通的内容型Children*/
let button = <Button>button</Button>

button.mountTo(document.body)
```



#### 2.2 List —— 模板型Children

```js
// List.js
import { Component, STATE, ATTRIBUTE, createElement } from './Framework'

export class List extends Component{
  constructor () {
    super()
  }
  render () {
    this.childrenContainer = this[ATTRIBUTE].data.map(this.templateFun) // 循环渲染模板
    this.root = (<div>{this.childrenContainer}</div>).render()
    return this.root
  }
  appendChild (child) {
    this.templateFun = child // 代表这花括号下的模板函数
    this.render()
  }
}
// main.js
/**List组件，模板型Children*/
let list = <List data={carImgs}>
  {
    (record) => 
      <div class="list-item">
        <img src={record.img}/>
        <a href={record.url}>{record.title}</a>
      </div>
  }
</List>

```

#### 2.3 Framework

```js
// Framework.js
export function createElement (type, attribute, ...children) {
  let el
  if (typeof type === 'string')
    el = new ElementWrapper(type)
  else
    el = new type
  for (const attr in attribute) {
    el.setAttribute(attr, attribute[attr])
  }
  let processChildren = (children) => {
    for (const child of children) {
      if (typeof child === 'object' && (child instanceof Array)) {
        processChildren(child)
        continue
      }
      if (typeof child === 'string') {
        child = new TextWrapper(child)
      }
      el.appendChild(child)
    }
  }
  processChildren(children)
  return el
}

export const STATE = Symbol('state')
export const ATTRIBUTE = Symbol('attribute')

export class Component {
  constructor () {
    this[ATTRIBUTE] = Object.create(null)
    this[STATE] = Object.create(null)
  }
  setAttribute (name, val) {
    this[ATTRIBUTE][name] = val
  }
  appendChild (child) {
    // 调用child的挂在函数添加child
    child.mountTo(this.root)
  }
  mountTo (parent) {
    if (!this.root)
      this.render()
    parent.appendChild(this.root)
  }
  render () {
    return this.root
  }
  triggerEvent (type, args) {
    // 事件
    this[ATTRIBUTE]['on' + type.replace(/^[\s\S]/, s => s.toUpperCase())](new CustomEvent(type, {detail: args}))
  }
}
class TextWrapper extends Component{
  constructor (text) {
    super()
    this.root = document.createTextNode(text)
  }
}
class ElementWrapper extends Component {
  constructor (type) {
    super()
    this.root = document.createElement(type)
  }
  setAttribute (name, val) {
    this.root.setAttribute(name, val)
  }
}

```

