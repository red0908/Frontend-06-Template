export function createElement (type, attribute, ...children) {
  let el
  if (typeof type === 'string')
    el = new ElementWrapper(type)
  else
    el = new type
  for (const attr in attribute) {
    el.setAttribute(attr, attribute[attr])
  }
  for (const child of children) {
    if (typeof child === 'string') {
      child = new TextWrapper(child)
    }
    el.appendChild(child)
  }
  return el
}
export class Component {
  constructor () {
  }
  setAttribute (name, val) {
    this.root.setAttribute(name, val)
  }
  appendChild (child) {
    child.mountTo(this.root)
  }
  mountTo (parent) {
    parent.appendChild(this.root)
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
}
