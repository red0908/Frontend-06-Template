import { Component, STATE, ATTRIBUTE, createElement } from './Framework'

export class List extends Component{
  constructor () {
    super()
  }
  render () {
    this.childrenContainer = this[ATTRIBUTE].data.map(this.templateFun)
    this.root = (<div>{this.childrenContainer}</div>).render()
    return this.root
  }
  appendChild (child) {
    this.templateFun = child // 代表这花括号下的模板函数
    this.render()
  }
}

