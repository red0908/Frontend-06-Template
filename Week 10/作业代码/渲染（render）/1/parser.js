const css = require('css')
const layout = require('./layout')
const EOF = Symbol('EOF')
let currentToken = null
let currentAttribute = null

let stack = [{type: 'document', children: []}]
let currentTextNode = null

// 额外作业2：在 selectorParts 里面去解析复合选择器
function specifity (selector) {
  var p = [0, 0, 0, 0]// [inline, #id, .class, tag]

  var selectParts = selector.split(' ')
  for (var part of selectParts) {
    /**复合选择器:
     * 复合选择器表示简单选择器中“且”的关系,tagName必须在第一位
     */
    let regNotSimple = new RegExp(/^(([.#][a-zA-Z][a-zA-Z\d]*)|([a-zA-Z][a-zA-Z\d]*))([.#][a-zA-Z][a-zA-Z\d]*)+/)
    if (regNotSimple.test(selector)) {
      let regNotTagName = new RegExp(/^[.#]/)
      let selectorArr = selector.match(/[.#]/g)
      if (!regNotTagName.test(selector)) {
          p[3] += 1
      }
      for (let i = 0; i < selectorArr.length; i++) {
        if (selectorArr[i] === '#') {
          p[1] += 1
        } else {
          p[2] += 1        
        }
      }
    } else {
    // 简单选择器
      if (part.charAt(0) === '#') {
        p[1] += 1
      } else if (part.charAt(0) === '.') {
        p[2] += 1
      } else {
        p[3] += 1
      }
    }
  }
  return p
}

function compare (sp1, sp2) {
  if (sp1[0] - sp2[0]) {
    return sp1[0] - sp2[0]
  }
  if (sp1[1] - sp2[1]) {
    return sp1[1] - sp2[1]
  }
  if (sp1[2] - sp2[2]) {
    return sp1[2] - sp2[2]
  }
  return sp1[3] - sp2[3]
}

// 新函数，CSS规则暂存数组中
let rules = []
function addCSSRules (text) {
  var ast = css.parse(text)
  rules.push(...ast.stylesheet.rules)
}

// 额外作业1：实现复合选择器，实现支持空格的 Class 选择器
function matchSelector (element, selector) {
  if (!selector || !element.attributes) {
    return false
  }
  /**复合选择器:
   * 复合选择器表示简单选择器中“且”的关系,tagName必须在第一位
   */
  let regNotSimple = new RegExp(/^(([.#][a-zA-Z][a-zA-Z\d]*)|([a-zA-Z][a-zA-Z\d]*))([.#][a-zA-Z][a-zA-Z\d]*)+/)
  if (regNotSimple.test(selector)) {
    let regNotTagName = new RegExp(/^[.#]/)
    let selectorArr = selector.match(/[.#]/g)
    let selectorVal = selector.split(/[.#]/g)
    if (!regNotTagName.test(selector)) {
      if (selectorVal[0] !== element.tagName)
        return false
    }
    for (let i = 0; i < selectorArr.length; i++) {
      if (selectorArr[i] === '#') {
        var attr = element.attributes.filter(attr => attr.name === 'id')[0]
        if (!attr || attr.value !== selectorVal[i + 1])
          return false
      } else {
        var attr = element.attributes.filter(attr => attr.name === 'class')[0]
        if (!attr || !attr.value.includes(selectorVal[i + 1]))
          return false         
      }
    }
    return true
  }

  // 简单选择器
  if (selector.charAt(0) === '#') {
    var attr = element.attributes.filter(attr => attr.name === 'id')[0]
    if (attr && attr.value === selector.replace('#', ''))
      return true
  } else if (selector.charAt(0) === '.') {
    var attr = element.attributes.filter(attr => attr.name === 'class')[0]
    if (attr && attr.value.includes(selector.replace('.', '')))
      return true
  } else {
    if (element.tagName === selector) {
      return true
    }
  }
  return false
}
function computeCSS (element) {
  var elements = stack.slice().reverse()
  if (!element.computedStyle) {
    element.computedStyle = {}
  }

  for (const rule of rules) {
    var selectParts = rule.selectors[0].split(' ').reverse()

    if (!matchSelector(element, selectParts[0]))
      continue
    let matched = false
    let j = 1
    for (let i = 0; i < elements.length; i++) {
      if (matchSelector(elements[i], selectParts[j]))
        j++
    }
    if (j >= selectParts.length)
      matched = true
    
    if (matched) {
      var sp = specifity(rule.selectors[0])
      var computedStyle = element.computedStyle
      for (const declaration of rule.declarations) {
        if (!computedStyle[declaration.property])
          computedStyle[declaration.property] = {}
        if (!computedStyle[declaration.property].specifity) {
          computedStyle[declaration.property].value = declaration.value
          computedStyle[declaration.property].specifity = sp
        } else if (compare(computedStyle[declaration.property].specifity, sp) < 0) {
          computedStyle[declaration.property].value = declaration.value
          computedStyle[declaration.property].specifity = sp
        }
      }    
      console.log(element.computedStyle)
    }
  }

}


function emit(token) {
  let top = stack[stack.length - 1]
  if (token.type === 'startTag') {
    let element = {
      type: 'element',
      children: [],
      attributes: []
    }
    element.tagName = token.tagName
    for (const p in token) {
      if (p !== 'type' && p !== 'tagName') {
        element.attributes.push({
          name: p,
          value: token[p]
        })
      }
    }
    computeCSS(element)
    top.children.push(element)
    element.parent = top
    if (!token.isSelfClosing)
      stack.push(element)
    currentTextNode = null
  } else if (token.type === 'endTag') {
    if (top.tagName !== token.tagName) {
      throw new Error("Tag start end doesn't match!")
    } else {
      /***********************遇到style标签的时候，执行添加css规则的操作**************************/
      if (top.tagName === 'style') {
        addCSSRules(top.children[0].content)
      }
      layout(top)
      stack.pop()
    }
    currentTextNode = null
  } else if (token.type === 'text') {
    if (currentTextNode === null) {
      currentTextNode = {
        type: 'text',
        content: ''
      }
      top.children.push(currentTextNode)
    }
    currentTextNode.content += token.content
  }
}

function data (c) {
  if (c === '<') {
    return tagOpen
  } else if (c === EOF) {
    emit({
      type: 'EOF'
    })
    return
  } else {
    // 文本
    emit({
      type: 'text',
      content: c
    })
    return data
  }
}

function tagOpen (c) {
  if (c === '/') {
    return endTagOpen
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'startTag',
      tagName: ''
    }
    return tagName(c)
  } else {
    return
  }
}
function endTagOpen (c) {
  if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'endTag',
      tagName: ''
    }
    return tagName(c)
  } else if (c === '>') {
    // 错误
  } else if (c === EOF) {
    // 错误
  } else {
    // 错误。
    return
  }
}
function tagName (c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (c === '/') {
    return selfClosingStartTag
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken.tagName += c
    return tagName
  } else if (c === '>') {
    emit(currentToken)
    return data
  } else {
    return tagName
  }
}

function beforeAttributeName (c) {
  if (c.match(/^[\r\n\f ]$/)) {
    return beforeAttributeName
  } else if (c === '>') {
    return data
  } else if (c === '=') {
    return beforeAttributeName
  } else {
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(c)
  }
}

function afterAttributeName (c) {
  if (c.match(/^[\r\n\f ]$/)) {
    return afterAttributeName
  } else if (c === '/') {
    return selfClosingStartTag
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c === '=') {
    return beforeAttributeValue
  } else {
    currentToken[currentAttribute.name] = currentAttribute.value
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(c)
  }
}

function attributeName (c) {
  if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
    return afterAttributeName(c)
  } else if (c === '=') {
    return beforeAttributeValue
  } else if (c ==='\u0000') {
    // 错误
  } else if (c === '\"' || c === '\'' || c === '<') {
    // 错误
  } else {
    currentAttribute.name += c
    return attributeName
  }
}

function beforeAttributeValue (c) {
  if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
    return beforeAttributeValue
  } else if (c === '\"') {
    // 双引号
    return doubleQuotedAttributeValue
  } else if (c === '\'') {
    // 单引号
    return singleQuotedAttributeValue
  } else if (c === '>') {
    // 错误
    return data
  } else {
    return unquotedAttributeValue(c)
  }
}

function doubleQuotedAttributeValue (c) {
  if (c === '\"') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  } else if (c === '\u0000') {
    // 这是一个意外的空字符解析错误。将U + FFFD替换字符添加到当前属性的值。
  } else if (c === EOF) {
    // 这是eof-in-tag解析错误。发出文件结束令牌。
  } else {
    currentAttribute.value += c
    return doubleQuotedAttributeValue
  }
}

function singleQuotedAttributeValue (c) {
  if (c === '\'') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  } else if (c === '\u0000') {
    // 这是一个意外的空字符解析错误。将U + FFFD替换字符添加到当前属性的值。
  } else if (c === EOF) {
    // 这是eof-in-tag解析错误。发出文件结束令牌。
  } else {
    currentAttribute.value += c
    return singleQuotedAttributeValue
  }
}

function unquotedAttributeValue (c) {
  if (c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  } else if (c === '/') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return selfClosingStartTag
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c === '\"' || c === '\'' || c === '<' || c === '`' || c === '=') {
    // 这是一个意外的未加引号的字符属性值解析错误。请按照下面的“其他”条目进行处理。
  } else if (c === EOF) {
    // 这是eof-in-tag解析错误。发出文件结束令牌。
  } else {
    currentAttribute.value += c
    return unquotedAttributeValue
  }
}

function afterQuotedAttributeValue (c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (c === '/') {
    return selfClosingStartTag
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c === EOF) {
    // 这是eof-in-tag解析错误。发出文件结束令牌。
  } else {
    // 这是缺少空白属性之间的解析错误。重新before attribute name state.
    return beforeAttributeName
  } 
}

function selfClosingStartTag (c) {
  if (c === '>') {
    emit(currentToken)
    currentToken.isSelfClosing = true
    return data
  } else if (c === EOF) {

  } else {

  }
}

module.exports.parseHTML = function parseHTML (html) {
  let state = data
  for (let c of html) {
    state = state(c)
  }
  state = state(EOF)
  console.log(stack)
  return stack[0]
}