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

