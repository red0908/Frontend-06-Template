# 字符串分析算法

## 概述

### 字典树

* 字典树，称为Trie树，称单词查找树或键树，是一种树形结构，是一种哈希树的变种。
* 例如我们查字典的步骤一样，先查第一个字母为n的字符节点集合，在这个集合中查找下一个字母的节点集合。

* 典型应用是用于统计和排序大量的字符串（但不仅限于字符串），所以经常被搜索引擎系统用于文本词频统计。它的优点是：最大限度地减少无谓的字符串比较。

* Trie的核心思想是空间换时间。利用字符串的公共前缀来降低查询时间的开销以达到提高效率的目的。

### KMP

* KMP(Knuth-Morris-Pratt 字符串查找算法)，可在一个主文本字符串S内查找一个词W的出现位置。

* 它跟字典树最大的区别就是字典树是检查两个字符串是否完全匹配，而 KMP 是两个字符串中，一个字符串是两一个字符串的一部分，但是这个就会出现一个更为复杂的问题。
* 如果我们有一个长度为m的字符串和一个长度为n的字符串，然后让他们两个互相匹配，这个时候我们有两种匹配方法。
* 第一种就是暴力破解法，它可能是m乘以n的时间复杂度，显然这个算法的性能在大量的搜索字符的时候是不行的。
* 所以后面几位计算机专家研究出了KMP算法，而 KMP 就是三个人的名字的首字母，K 是高德纳，一个著名的写计算机程序设计的老爷子。加上另外两个计算机专家共同发明了 KMP 算法。这个算法就是在一个长字符串里面匹配一个短字符串，这个匹配算法的复杂度可以降到 m + n。

### Wildcard

* 在 KMP 的基础上加了通配符的字符串模式

* 通配符包括?表示匹配任意字符，* 表示匹配任意数量的任意字符
* 我们也可以理解它为一个弱一点的正则表达式，因为相比正则它只有两种通配符，并且这些通配符与正则有一个显著的区别，就是 Wildcard 其实也是可以在 O(n)或者 O(m+n)的时间复杂度内去处理的。这个现象是因为Wildcard当中有一个贪心算法，也是它非常神奇的原因。

### 正则

- 正则一般来说都是需要用到回溯的一个系统
- 正则是字符串通用模式匹配的终极版本

### 状态机

- 通用的字符串分析
- 与正则表达式相比，状态机会更强大
- 正则表达式与有限状态机在理论上是完全等价的两种东西
- 但是有限状态机不同的是，我们还可以往里面嵌代码，还可以给字符串做而外的处理
- 另外就是正则写起来很方便，有限状态机写起来成本比较高

### LL ,LR

- 在简单的匹配和分析的基础上，如果我们要对字符串建立多层级的结构，就会使用 LL 和 LR 这样的语法分析的算法

## 字典树实现

#### 实现方案

* 首先构建一个数组
* 数组中的每一个项的key构成一个逐层向下的枝叶，进而形成一棵树
* 每一个最终叶子节点用Symbol('$')标志结束
* 并用每一个节点叶子节点记录这个字符片段的重复次数

## KMP字符串模式匹配算法

#### 计算table

用table数组标识，在每个字符串索引之前，有多个重复的字符串。当匹配不相等时，则让pattern的索引指针j回到table[j]记录的索引。
因为它本身自重复性，在j回到table[j]索引之前，j前面的字符是正好与table[j]索引之前的字符具有一定的重复性，所以不需要重新匹配。即重头匹配。

例如：

```js
// a b c d a b c e pattern
// 0 0 0 0 0 1 2 3 table

//     abcdabce 
// abcdabcdabcenc
```

代码实现：

```js
  // 用table记录pattern字符串是否有自重复段
  let table = new Array(pattern.length).fill(0)
  {
    let i = 1, j = 0
    // 从头开始搜索，i记录源pattrn搜寻的索引
    // j记录当前匹配到的pattrn下标索引
    while(i < pattern.length) {
      if (pattern[i] === pattern[j]) {
        // 如果相等，则将j索引匹配给tabel[i],以记录源字符串i - 1位置与j - 1位置相同
        i++, j++
        table[i] = j
      } else {
        // 如果不相等
        if (j > 0) 
        // j > 0，只需要让j回到 table[j]索引，继续下一轮匹配
          j = table[j]
        else
        // 如果j = 0，即之前没有移动多j指针，还没有遇到pattern字符源自重复的相等字符，于是i++，继续下一轮匹配
          i++
      }
    }
  }
```

#### 匹配

用i表示source字符串的匹配索引，用j表示模式字符串pattern的匹配索引。依次循环source的每一个字符，进行匹配。

代码实现：

```js
  {
    let i = 0 , j = 0
    // start为匹配的起始索引，end为匹配的结束索引
    let start = 0, end = -1
    while(i < source.length) {
      if (pattern[j] === source[i]) {
        i++, j++
      } else {
        // 如果不相等则让j回到当前table[j]记录的索引
        if (j > 0) 
          j = table[j]
        else
          {
            i++
            // 重新记录source匹配开头索引
            start = i
          }
      }
      if (j === pattern.length)
        { 
          end = i - 1
          console.log('-------')
          console.log(`在${source} 中匹配 ${pattern}`)
          console.log('起始索引:', start, '结束索引:', end)
          console.log('-------')
          return true
        }
    }
```

## Wildcard

### 两种通配符

wildcard与kmp算法不一样的地方是，它加入了两种通配符。

星号（*）表示匹配任意数量的任意字符串

问号（？）表示匹配任意数量的任意字符

### 实现

- 从头扫描看有多少个*号
- 如果从头没有星号的情况，从头匹配到第一个* 之前，用lastIndex记录此时的索引
- 然后依次按照*号分段匹配分段进行匹配，匹配的方式分为两种
  - 使用正则表达式，替换pattern段中的？,然后用正则表达式的exec进行匹配，每次将正则的lastIndex记录。
  - 重写kmp，将？的匹配逻辑：表示匹配任意数量的任意字符，加入代码，并找出匹配的下标。

匹配包含？通配符的KMP代码逻辑：

```js
  // 匹配
  {
    let i = 0 , j = 0
    let start = 0, end = -1
    while(i < source.length) {
      if (pattern[j] === source[i]) {
        i++, j++
        if (pattern[j] === '?' && i === source.length){
          // 如果？号前的所有的pattern都匹配完全，且？在最后一个,i已经扫描完毕。
          // ？等于所有字符集，所以证明匹配成功，j++标识parrtern匹配完毕
          j++
        }
      } else if (pattern[j] === '?' && pattern[j] !== source[i]) {
        if (j < pattern.length - 1 && i < source.length - 1) {
          // 1. ？= \S
          if (pattern[j + 1] === source[i + 1]) {
            j = j + 2
            i = i + 2
          } else if (pattern[j + 1] === source[i] && pattern[j + 1] !== source[i + 1]) {
          // 2. ? = \s
            j = j + 2
            i++
          } else {
            // 问号匹配不成功，j要回到table[j]标记去重新匹配，i之后的source字符串
            j = table[j]
            i++
            // 重新记录其实索引
            start = i
          }
        } else if (j === pattern.length - 1) {
          // pattern最后一项为？，即为匹配成功
          j++
          i++
        } else if (i === source.length - 1 && j < pattern.length - 1) {
          // source已经完结，且j不为最后一项，即匹配失败的情况,这里把pattern从j到结尾都为？的情况也定义为匹配不成功
          i++
          j++
        }
      } else {
        // 如果不相等则让j回到当前table[j]记录的索引
        if (j > 0) 
          j = table[j]
        else
          {
            i++
            // 重新记录source匹配开头索引
            start = i
          }
      }
      if (j >= pattern.length)
        { 
          end = i - 1
          console.log(`在${source} 中匹配 ${pattern} 成功`)
          console.log('起始索引:', start, '结束索引:', end)
          console.log('-------')
          return end
        }
    }
    console.log(`在${source} 中匹配 ${pattern} 失败`)
    return end
  }
```

用匹配包含？通配符的KMP代码代替正则表达式的逻辑代码：

```js
    // 标记第一个*号的位置，开始
    lastIndex = i
    // 开始匹配第一个*号到最后一个*号之间的字符段
    for (let p = 0; p < startCount - 1; p++) {
      i++
      // 记录每一个*号后的字符段
      let subPattern = ''
      while(pattern[i] !== '*') {
        subPattern += pattern[i]
        i++
      }
      let subSource = source.substring(lastIndex) 
      let result = kmp(subSource, subPattern)
      if (result === -1) {
        return false
      } else {
        // 找到上一次匹配的索引
        lastIndex = lastIndex + ( result + 1 )
      }
    }
```













