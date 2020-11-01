# 前端训练营第一周笔记
## TicTacToe实现

### 代码思路

#### 基本游戏逻辑

- 棋盘：3x3方格
- 双方分别持有⭕️和❌两种棋子
- 双方交替落子
- 率先连城三子直线的一方获胜

#### AI策略

- 第一层策略：赢
- 第二层策略：别输
- 第三层策略：......
- 棋谱

### 基本游戏规则实现方法

#### 1.棋盘数据结构：3x3的二维数组。状态有三种：空（0）、⭕️（1）、❌（2）

#### 2.棋盘的绘制 函数show()

#### 3.事件监听（落子）

#### 4.判断胜负

- 每次落子前调用check函数判断
- check函数行的判断
- check函数列的判断
- check函数斜行的判断

#### 5. 落子之后检查是否要赢了（基础AI功能）

- 落下一子之后，判断是否有胜负预告
- 做一个副本，对没落子的地方做检查

### 代码：

```js
    // 1.棋盘数据结构：3x3的二维数组。状态有三种：空（0）、⭕️（1）、❌（2）
    let pattern = [
      [0,0,0],
      [0,0,0],
      [0,0,0]
    ]
    let color = 1
    // 2.棋盘的绘制
    function show () {
      let board = document.getElementById('board')
      board.innerHTML = ''
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          let cell = document.createElement('div')
          cell.classList.add('cell')
          cell.innerText = pattern[i][j] === 1 ? '⭕️' : pattern[i][j] === 2 ? '❌' : ''
          cell.addEventListener('click', () => { move(j,i) })
          board.appendChild(cell)
        }
      }
    }
    // 3.落子的事件监听
    function move (x, y) {
      pattern[y][x] = color
      if (check(pattern, color)) {
        alert(color === 2 ? '❌ is winner !' : '⭕️ is winner !')
      }
      show(pattern)
      color = 3 - color
      if (willWin(pattern, color)) {
        console.log(color === 2 ? '❌ will win !' : '⭕️ will win !')
      }
    }
    // 4. 判断胜负的函数
    function check (pattern, color) {
      for (let i = 0; i < 3; i++) {
        // 行扫描
        let win = true
        for (let j = 0; j < 3; j++) {
          if (pattern[i][j] !== color) {
            win = false
            break
          }
        }
        if (win)
          return true
      }
      for (let i = 0; i < 3; i++) {
        // 列扫描
        let win = true
        for (let j = 0; j < 3; j++) {
          if (pattern[j][i] !== color) {
            win = false
            break
          }
        }
        if (win)
          return true
      }
      {
        // 右上到左下斜扫描
        let win = true
        for (let j = 0; j < 3; j++) {
          if (pattern[j][2-j] !== color) {
            win = false
          }
        }
        if (win)
          return true
      }
      {
        // 左上到右下斜扫描
        let win = true
        for (let j = 0; j < 3; j++) {
          if (pattern[j][j] !== color) {
            win = false
          }
        }
        if (win)
          return true
      }
      return false
    }
    // 5.AI判断
    function clone (pattern) {
      return JSON.parse(JSON.stringify(pattern))
    }
    function willWin (pattern, color) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (pattern[i][j])
            continue
          let tmp = clone(pattern)
          tmp[i][j] = color
          if (check(tmp, color)) {
            return true
          }
        }
      }
      return false
    }
    show()
```



### 智能AI实现方案

#### 1. 将willWin函数改造，让它将要赢得点返回，如果没有则返回null

#### 根据策略实现bestChoice()最佳落子选择的递归调用

- 进入首先判断下一步是否要赢了，如果是返回那个point,以及result返回1
- 然后依次遍历所有此时没有下过的点，并假设我们下一步就走当前遍历的这个点，并对这对方下一步落子进行bestChoice的递归判断。
- 得到走这一步之后对方最佳的结果r与当前循环记录的result进行比较。
- 如果-r(对方的结果对于我们来说是相反的，所以加负号)大于result，则表示这个点是当前循环状态下记录的最优点

#### 3.二维数组变成了一维数组

- i为行，j为列，每个点就为i*3+j
- 使用Object.create构建pattern的副本

### 人机对战

#### cell的点击事件换成userMove

#### computerMove()是每次电脑的落子的步骤，都是有bestChoice()函数获得的最优落子。

### 代码

```js
 // 1.棋盘数据结构：3x3的二维数组。状态有三种：空（0）、⭕️（1）、❌（2）
    let pattern = [
      0,0,0,
      0,0,0,
      0,0,0
    ]
    let color = 1
    // 2.棋盘的绘制
    function show () {
      let board = document.getElementById('board')
      board.innerHTML = ''
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          let cell = document.createElement('div')
          cell.classList.add('cell')
          cell.innerText = pattern[i * 3 + j] === 1 ? '⭕️' : pattern[i * 3 + j] === 2 ? '❌' : ''
          cell.addEventListener('click', () => { userMove(j,i) })
          board.appendChild(cell)
        }
      }
    }
    // 电脑下
    function computerMove () {
      let choice = bestChoice(pattern, color)
      console.log(choice)
      if (choice.point)
        pattern[choice.point[1] * 3 + choice.point[0]] = color
      if (check(pattern, color))
        alert(color === 2 ? '❌ is winner !' : '⭕️ is winner !')
      color = 3 - color
      show()
    }
    // 用户下
    function userMove (x, y) {
      pattern[y * 3 + x] = color
      if (check(pattern, color)) {
        alert(color === 2 ? '❌ is winner !' : '⭕️ is winner !')
      }
      color = 3 - color
      show()
      computerMove ()
    }
    // 4. 判断胜负的函数
    function check (pattern, color) {
      for (let i = 0; i < 3; i++) {
        // 行扫描
        let win = true
        for (let j = 0; j < 3; j++) {
          if (pattern[i * 3 + j] !== color) {
            win = false
            break
          }
        }
        if (win)
          return true
      }
      for (let i = 0; i < 3; i++) {
        // 列扫描
        let win = true
        for (let j = 0; j < 3; j++) {
          if (pattern[i * 3 + j] !== color) {
            win = false
            break
          }
        }
        if (win)
          return true
      }
      {
        // 右上到左下斜扫描
        let win = true
        for (let j = 0; j < 3; j++) {
          if (pattern[j * 2 + 2] !== color) {
            win = false
          }
        }
        if (win)
          return true
      }
      {
        // 左上到右下斜扫描
        let win = true
        for (let j = 0; j < 3; j++) {
          if (pattern[j * 4] !== color) {
            win = false
          }
        }
        if (win)
          return true
      }
      return false
    }
    // 5.AI判断
    function clone (pattern) {
      return Object.create(pattern)
    }
    function willWin (pattern, color) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (pattern[i * 3 + j])
            continue
          let tmp = clone(pattern)
          tmp[i * 3 + j] = color
          if (check(tmp, color)) {
            return [j, i]
          }
        }
      }
      return null
    }
    // 6.最优落子
    function bestChoice (pattern, color) {
      let point = willWin(pattern, color)
      if (point) {
        return {
          point: point,
          result: 1
        }
      }
      let result = -2
      outer: for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (pattern[i * 3 + j])
            continue
          let tmp = clone(pattern)
          tmp[i * 3 + j] = color
          let oop = bestChoice(tmp, 3 - color)
          // 对方的结果对于我们来说是相反的
          if (-oop.result >= result) {
            result = -oop.result
            point = [j, i]
          }
          if (result === 1)
            break outer
        }
      }
      return {
        point: point,
        result: point ? result : 0
      }
    }
    show()
```



## 异步编程 | async异步编程

### Javacript 的异步机制
* callback 函数的回调能力
* promise
* async/await 
### generator 与异步
* generator模拟async/await
* async generator
for await of 和async generator的配合使用机制

## 直播课程
### 职业规划
####  清楚自身的职业规划是掌握在自己手里
> <em>You</em> are the owner of your career
#### 职业发展
* 成长-> 成就->晋升->成长....
* 成就
  * 业务型成就
  * 工程型成就
  * 技术难题

### 学习方法

#### 前端技能模型

* 领域知识（实践中学习）
* 前端知识 (重学前端：建立**前端知识体系****)
* 编程能力+架构能力+工程能力 （训练营，刻意练习、提升）

三者的目的是为了解决实际问题

#### 学习方法

* 整理法
  * 顺序关系
  * 组合关系
  * 维度关系
  * 分类关系

eg： HTML有多少中标签
整理法具有完备性。

* 追溯法
  * 源头（最早的文档、杂志、案例）
  * 标准文档
  * 大师



