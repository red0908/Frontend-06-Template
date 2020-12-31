



# 浏览器原理（三）

## 浏览器原理总论

浏览器在前端中是很重要的，因此了解浏览器的工作原理是很有必要的。总的来说，我们打开浏览器，最终经过一系列步骤我们会看到一张图片，专业点的说法叫做Bitmap（位图），然后经过显卡转换为我们可以识别的光信号。

而这些转换步骤为：

* 输入url，发送HTTP请求，解析HTTP回应，得到Html文本
* 获取Html，对文本Html进行parse（文本分析，编译初级技术），得到DOM树结构
* 获取DOM树结构，进行css  computing(dom上对应了哪些css规则，哪些css会叠加，哪些会覆盖，将最终结构计算出来)，最后得到了，带css属性的DOM树（带样式的DOM）
* layout（布局、排版），通过这个步骤将DOM树上所有元素产生的盒的位置给计算出来。（获得位置的不是DOM元素本身而是css最后生成的盒）
*  render（渲染），将元素画到一个图片上，最后根据操作系统和硬件驱动提供的API接口，最终展示给用户。

了解了以上步骤之后，我们接下来就跟着这样的步骤，做一个微型模拟浏览器——Toy - Broswer，来帮助我们更好的理解浏览器的工作原理。

## Toy - Broswer——排版（layout）

### 排版三代分类

#### 1.正常流：比较接近于古典排版策略

* [正常布局流(normal flow)](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Introduction#%E6%AD%A3%E5%B8%B8%E5%B8%83%E5%B1%80%E6%B5%81Normal_flow)
* [display属性](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Introduction#display%E5%B1%9E%E6%80%A7)

- [position定位技术](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Introduction#%E5%AE%9A%E4%BD%8D%E6%8A%80%E6%9C%AF)
- [float浮动](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Introduction#%E6%B5%AE%E5%8A%A8)

#### 2.[flex 排版]([弹性盒子(Flexbox)](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Introduction#弹性盒子Flexbox))

flex排版更接近人的自然思维。在flex排版中有的时候要纵排，有的时候要横排，会受到flex属性的限制。以至于我们需要在宽高体系上做一次抽象。

当元素表现为 flex 框时，它们沿着两个轴来布局：

![flex](./img/flex_terms.png)

* **主轴（main axis）**是沿着 flex 元素放置的方向延伸的轴（比如页面上的横向的行、纵向的列）。该轴的开始和结束被称为 **main start** 和 **main end**。

- **交叉轴（cross axis）**是垂直于 flex 元素放置方向的轴。该轴的开始和结束被称为 **cross start** 和 **cross end**。
- 设置了 `display: flex` 的父元素，被称之为 **flex 容器（flex container）。**
- 在 flex 容器中表现为柔性的盒子的元素被称之为 **flex 项**（**flex item**）。

#### 3.[gird排版](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Introduction#Grid%E5%B8%83%E5%B1%80)

#### 4. [css  Hundini](https://developer.mozilla.org/en-US/docs/Web/Houdini)

### 代码实现

#### 根据浏览器属性进行排版(预处理)

这里我们首先要新加一个layout模块，与css computed一样，我们要知道layout事件发生在什么时间，因为flex布局是需要知道子元素的，所以我们可以认为他的子元素一定是发生在标签的结束标签之前。因此在token.type===‘endTag’的时候，我们调用一个外部引入的函数layout模块。

在layout模块中，我们需要做：

* 创建getStyle，获取元素的样式值，将值相关的样式转换为数字，并存入style属性中
* 获取元素的子元素类型为element的，存入items
* 对于元素的样式的flexDirection、alignItems、justifyContent、flexWrap、alignContent进行初始化
* 完成一个准备工作，根据flexDirection的不同取值，设置```mainSize```、```crossSize```等抽象属性的变量，让它们在后面去代替属性做一些计算

具体看以下代码：

```js
// layout.js
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
  var mainSize/*主轴尺寸*/, mainStart/*主轴开始源*/, mainEnd/*主轴结束源*/, mainSign/*主轴计算符号*/, mainBase/*主轴计算基本大小*/,
  crossSize/*交叉轴尺寸*/, crossStart/*交叉轴开始源*/, crossEnd/*交叉轴结束源*/, crossSign/*交叉轴计算符号*/, crossBase/*交叉轴计算基本大小*/
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
  // 反向换行，就需要给交叉轴的开始和结束给互换一下，crossSign置为-1，反之crossBase为0，crossSign为1(交叉轴只受wrap-reverse影响,所以不需要写在主轴里面,变成主轴相关属性)
  if (style.flexWrap === 'wrap-reverse') {
    var tmp = crossStart
    crossStart = crossEnd
    crossEnd = tmp
    crossSign = -1
  } else {
    crossSign = 1
    crossBase = 0
  }
}

module.exports = layout

```

这一步是一些预处理工作，对后面的计算很重要，这项准备工作帮我们处理了flexDirection和wrap相关的属性，将具体width、height、top、left、right、bottom等的属性，抽象成了main和cross相关的属性。

#### 收集元素进行（hang）

这一步为了后面计算元素位置，所做的重要的准备工作。因为flex是允许分行的，它的分行与正常流的算法是相似的。当我们所有子元素的尺寸，超越父元素主轴的尺寸的时候，那么我们就会进行分行。除非它是有属性nowrap进行控制。

具体代码：

```js
// layout.js
// 部分代码省略
// 没有设置父元素尺寸的时候就会进入AutoMainSize
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
```

- 总结

  - 根据主轴的尺寸将元素分进行。
  - 设置了no-wrap就会强行分配进第一行。

#### 计算主轴

上一步对元素完成了分行，接下来我们就可以根据一些flex相关的属性，来计算每一行里面的尺寸以及其他相关信息。

- 思路

  - 在主轴方向呢，有一些元素其实已经有了size。比如如果主轴方向是row的话，那主轴方向对应的属性应该是width。而有些子元素是有width。
  - 接下来找出所有带flex属性的元素，然后把所有其他元素排剩下的空间，让它在flex属性上使它平均分配。
  - 比如这个例子里面带问号的元素是一个flex属性的元素，在这一行还有剩余空间的情况下，我们就会给它把空间填满。

    - flexLine它剩余空间正是我们之前计算出来的mainspace这个变量所代表的空间值。
    - flex它是一个有值的，如果我们有多个flex元素，那么我们就会按比例去分配。比如我们有三个flex元素，分别是112，那我们就按照1/4、1/4、1/2去计算分配空间。
  - 有一个特殊情况，当剩余空间为负数的时候，当我们不是采取自由换行这种形式的模式，我们就把它的宽度置为0，然后剩余元素我们就会等比例压缩。这是web标准上规定的一种情况。
  - 如果没有flex元素则要按照justify-content的属性来计算每个元素的位置。

具体实现代码：

```js
// layout.js
// 部分代码省略
  if (style.flexWrap === 'nowrap' || isAutoMainSize) {
    flexLine[crossSize] = (style[crossSize] === undefined ? style[crossSize] : crossSpace) 
  } else {
    flexLine[crossSize] = crossSpace
  }
  if (mainSpace < 0) {
    // container single line，scale every item（单行情况）
    var scale = style[mainSize] / (style[mainSize] - mainSpace)
    var currentMain = mainBase
    for (let i = 0; i < items.length; i++) {
      var item = items[i]
      var itemStyle = getStyle(item)

      if (itemStyle.flex) {
        itemStyle[mainSize] = 0
      }
      itemStyle[mainSize] = itemStyle[mainSize] * scale

      itemStyle[mainStart] = currentMain
      itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
      currentMain = itemStyle[mainEnd]
    }
  } else {
    // process each flex line（多行情况）
    flexLines.forEach(function (items) {
      var mainSpace = items.mainSpace
      var flexTotal = 0
      for (let i = 0; i < items.length; i++) {
        var item = items[i]
        var itemStyle = getStyle(item)

        if ((itemStyle.flex !== null) && (itemStyle.flex !== (void 0))) {
          flexTotal += itemStyle.flex
          continue
        }
      }
      if (flexTotal > 0) {
        // There is flexible flex item（有flex属性的元素）
        var currentMain = mainBase
        for (let i = 0; i < items.length; i++) {
          var item = items[i]
          var itemStyle = getStyle(item)
          if (itemStyle.flex) {
            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex 
          }
          itemStyle[mainStart] = currentMain
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
          currentMain = itemStyle[mainEnd]
        }
      } else {
        // There is *No* flexible flex item, justifyContent should work（没有有flex属性的元素，根据justifyContent元素计算排版信息）
        if (style.justifyContent === 'flex-start') {
          var currentMain = mainBase
          var step = 0
        }
        if (style.justifyContent === 'flex-end') {
          var currentMain = mainBase + mainSpace * mainSign
          var step = 0
        }
        if (style.justifyContent === 'center') {
          var currentMain = mainBase + mainSpace / 2 * mainSign
          var step = 0
        }
        if (style.justifyContent === 'space-between') {
          var step = mainBase + [items.length - 1] * mainSign
          var currentMain = mainBase
        }
        if (style.justifyContent === 'space-around') {
          var step = mainBase + items.length * mainSign
          var currentMain = step / 2 + mainBase
        }
        for (let i = 0; i < items.length; i++) {
          var item = items[i]
          itemStyle[mainStart] = currentMain
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
          currentMain = itemStyle[mainEnd] + step
        }
      }
    })
  }
```

#### 计算交叉轴

如果是row方向的主轴，我们已经在主轴上计算了with、left、right，那我们就要在交叉轴上计算它的height、top、bottom

具体实现代码：

```js
// layout.js
// 部分代码省略
// compute the cross axis sizes
// align-items align-self
  var crossSpace

  if(!style[crossSize]) { // auto sizing
    crossSpace = 0
    elementStyle[crossSize] = 0
    for (let i = 0; i < flexLines.length; i++) {
      elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace
    }
  } else {
    crossSpace = style[crossSize]
    for (let i = 0; i < flexLines.length; i++) {
      crossSpace -= flexLines[i].crossSpace
    }
  }
  if (style.flexWrap === 'wrap-reverse') {
    crossBase = style[crossSize]
  } else {
    crossBase = 0
  }
  // var lineSize = style[crossSize] / flexLines.length
  var step
  if (style.alignContent === 'flex-start') {
    crossBase += 0
    step = 0
  }
  if (style.alignContent === 'flex-end') {
    crossBase += crossSign * crossSpace
    step = 0
  }
  if (style.alignContent === 'center') {
    crossBase += crossSign * crossSpace / 2
    step = 0
  }
  if (style.alignContent === 'space-between') {
    crossBase += 0
    step = crossSpace / (flexLines.length - 1)
  }
  if (style.alignContent === 'space-around') {
    step = crossSpace / flexLines.length
    crossBase += crossSign * step / 2
  }
  if (style.alignContent === 'stretch') {
    step = 0
    crossBase += 0
  }
  flexLines.forEach(function(items) {
    var lineCrossSize = style.alignContent === 'stretch' ? items.crossSpace + crossSpace / flexLines.length :
    items.crossSpace
    for (let i = 0; i < items.length; i++) {
      var item = items[i]
      var itemStyle = getStyle(item)

      var align = itemStyle.alignSelf || style.alignItems
      if (item === null) {
        itemStyle[crossSize] = (align === 'stretch') ? lineCrossSize : 0
      }
      if (align === 'flex-start') {
        itemStyle[crossStart] = crossBase
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
      }
      if (align === 'flex-end') {
        itemStyle[crossStart] = itemStyle[crossStart] - crossSign * itemStyle[crossSize]
        itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize
      }
      if (align === 'center') {
        itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
      }
      if (align === 'stretch') {
        itemStyle[crossStart] = crossBase
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * ((itemStyle[crossSize] !== 0 && itemStyle[crossSize] !== (void 0)) ? itemStyle[crossSize]: lineCrossSize)
        itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart])
      }
    }
    crossBase += crossSign * (lineCrossSize + step)
  })
```

## Toy - Broswer——渲染（render）

### 环境准备

将绘制图形变为绘制环境，这里准备了一个npm包[images](https://www.npmjs.com/package/images)

```
npm install images
```

### 绘制单个元素

这里实现的是单个元素的渲染。我们在元素渲染的属性里只选择```background-color```属性，其余属性忽略。

```js
// client.js
// 部分代码省略
  let response = await request.send()
  console.log(response)
  let dom = parser.parseHTML(response.body)
  let viewport = images(800, 600)
  render(viewport, dom.children[0].children[3].children[1].children[3])
  viewport.save("Week 10/viewport1.jpg")
```

```js
// render.js
const images = require('images')

function render (viewport, element) {
  if (element.style) {
    var img = images(element.style.width, element.style.height)

    if (element.style['background-color']) {
      let color = element.style['background-color'] || 'rgb(0, 0, 0)'
      color.match(/rgb\((\d+),(\d+),(\d+)\)/)
      img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3))
      viewport.draw(img, element.style.left || 0, element.style.top || 0)
    }
  }
}
module.exports = render

```

实现效果：

<img src="../Week 10/viewport1.jpg" alt="效果1" style="zoom:50%;" />

### 绘制DOM树

这里的实现是在上一步的基础上进行递归调用。

```js
// client.js
// 部分代码省略
  let response = await request.send()
  console.log(response)
  let dom = parser.parseHTML(response.body)
  let viewport = images(800, 600)
  render(viewport, dom.children[0].children[3].children[1].children[3])
  viewport.save("Week 10/viewport2.jpg")
```

```js
const images = require('images')

function render (viewport, element) {
  if (element.style) {
    var img = images(element.style.width, element.style.height)

    if (element.style['background-color']) {
      let color = element.style['background-color'] || 'rgb(0, 0, 0)'
      color.match(/rgb\((\d+),(\d+),(\d+)\)/)
      img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3))
      viewport.draw(img, element.style.left || 0, element.style.top || 0)
    }
  }
  if (element.children) {
    for (const child of element.children) {
      render(viewport, child)
    }
  }
}
module.exports = render

```

实现效果：

<img src="../Week 10/viewport2.jpg" alt="效果2" style="zoom:50%;" />