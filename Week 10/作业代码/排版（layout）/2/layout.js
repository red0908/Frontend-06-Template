function getStyle (element) {
  if (!element.style)
    element.style = {}
  for (const prop in element.computedStyle) {
    element.style[prop] = element.computedStyle[prop].value
    if (element.style[prop].toString().match(/px$/)) {
      element.style[prop] = parseInt(element.style[prop].toString().replace(/px$/, ''))
    }
    if (element.style[prop].toString().match(/^[0-9\.]+$/)) {
      element.style[prop] = parseInt(element.style[prop].toString())
    }
  }
  return element.style
}
function layout (element) {
  // body以外的节点
  if (!element.computedStyle)
    return
  var elementStyle = getStyle(element)
  if (elementStyle.display !== 'flex')
    return
  var items = element.children.filter(el => el.type === 'element')
  items.sort(function(a, b) {
    return (a.order || 0) - (b.order || 0)
  })
  var style = elementStyle
  let arr = ['width', 'height']
  arr.forEach(size => {
    if (style[size] === 'auto' || style[size] === '') {
      style[size] = null
    }
  })
  if (!style.flexDirection || style.flexDirection == 'auto') {
    style.flexDirection = 'row'
  }
  if (!style.alignItems || style.alignItems === 'auto') {
    style.alignItems = 'stretch'
  }
  if (!style.justifyContent || style.justifyContent === 'auto') {
    style.justifyContent = 'flex-start'
  }
  if (!style.flexWrap || style.flexWrap === 'auto') {
    style.flexWrap = 'nowrap'
  }
  if (!style.alignContent || style.alignContent === 'auto') {
    style.alignContent = 'stretch'
  }
  var mainSize, mainStart, mainEnd, mainSign, mainBase,
  crossSize, crossStart, crossEnd, crossSign, crossBase
  if (style.flexDirection === 'row') {
    mainSize = 'width'
    mainStart = 'left'
    mainEnd = 'right'
    mainSign = +1
    mainBase = 0

    crossSize = 'height'
    crossStart = 'top'
    crossEnd = 'bottom'
  } else if (style.flexDirection === 'row-reverse') {
    mainSize = 'width'
    mainStart = 'right'
    mainEnd = 'left'
    mainSign = -1
    mainBase = style.width

    crossSize = 'height'
    crossStart = 'top'
    crossEnd = 'bottom'
  } else if (style.flexDirection === 'column') {
    mainSize = 'height'
    mainStart = 'top'
    mainEnd = 'bottom'
    mainSign = +1
    mainBase = 0

    crossSize = 'width'
    crossStart = 'left'
    crossEnd = 'right'
  } else if (style.flexDirection === 'column-reverse') {
    mainSize = 'height'
    mainStart = 'bottom'
    mainEnd = 'top'
    mainSign = -1
    mainBase = style.height

    crossSize = 'width'
    crossStart = 'left'
    crossEnd = 'right'
  }
  if (style.flexWrap === 'wrap-reverse') {
    var tmp = crossStart
    crossStart = crossEnd
    crossEnd = tmp
    crossSign = -1
  } else {
    crossSign = 1
    crossBase = 0
  }
  var isAutoMainSize = false
  if (!style[mainSize]) {//自动主轴定义尺寸
    elementStyle[mainSize] = 0
    for (let i = 0; i < items.length; i++) {
      var itemStyle = getStyle(items[i])
      if (itemStyle[mainSize] !==null || itemStyle[mainSize] !== (void 0)) {
        elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize]
      }
      isAutoMainSize = true
      
    }
  }
  var flexLine = []
  var flexLines = [flexLine]

  var mainSpace = elementStyle[mainSize]// 剩余空间
  var crossSpace = 0

  for (var i = 0; i < items.length; i++) {
    var item = items[i]
    var itemStyle = getStyle(item)
    if (!itemStyle[mainSize]) {
      itemStyle[mainSize] = 0
    }
    if (itemStyle.flex) {
      flexLine.push(item)
    } else if (style.flexWrap === 'nowrap' && isAutoMainSize) {
      mainSpace -= itemStyle[mainSize]
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
        crossSpace = Math.max(crossSpace, itemStyle[mainSize])
      }
      flexLine.push(item)
    } else {
      if (itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize]
      }
      if (mainSpace < itemStyle[mainSize]) {
        flexLine.mainSize = mainSpace
        flexLine.crossSize = crossSpace
        flexLine = [item]
        flexLines.push(flexLine)
        mainSpace = style[mainSize]
        crossSpace = 0
      } else {
        flexLine.push(item)
      }
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
        crossSpace = Math.max(crossSpace, itemStyle[mainSize])
      }
      mainSpace -= itemStyle[mainSize]
    }
  }
  flexLine.mainSpace = mainSpace
  console.log(items)
}

module.exports = layout
