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
