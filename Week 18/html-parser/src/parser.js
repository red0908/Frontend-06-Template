const EOF = Symbol('EOF')
let stack
let currentToken = null
let currentAttribute = null
let currentTextNode = null

function emit(token) {
  let top = stack[stack.length - 1]
  if (token.type === 'startTag') {
    let element = {
      type: 'element',
      children: [],
      attributes: [],
      isSelfClosing: token.isSelfClosing || false
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
    top.children.push(element)
    element.parent = top
    if (!token.isSelfClosing)
      stack.push(element)
    currentTextNode = null
  } else if (token.type === 'endTag') {
    if (top.tagName !== token.tagName) {
      throw new Error("Tag start end doesn't match!")
    } else {
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
  } else if ('>') {
    return data('<' + c)
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
  } 
  // else if (c === '>') {
  //   // 错误
  //   throw new Error("error")
  // } else if (c === EOF) {
  //   // 错误
  //   throw new Error("error")
  // } 
  else {
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
    // throw new Error('unexpected charater \"' + c + '\"')
    return beforeAttributeName
  } 
}

function selfClosingStartTag (c) {
  if (c === '>') {
    currentToken.isSelfClosing = true
    emit(currentToken)
    return data
  } else if (c === EOF) {

  } else {

  }
}

export function parseHTML (html) {

  stack = [{type: 'document', children: []}]
  currentToken = null
  currentAttribute = null
  currentTextNode = null

  let state = data
  for (let c of html) {
    state = state(c)
  }
  state = state(EOF)
  return stack[0]
}