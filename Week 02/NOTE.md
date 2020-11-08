# 寻路算法

## 1.寻路算法

### 广度优先搜索算法

广度优先搜索是最简便的图的搜索算法之一，它属于一种盲目搜寻法，目的是系统地展开并检查图中的所有节点，以找寻结果。换句话说，它并不考虑结果的可能位置，彻底地搜索整张图，直到找到结果为止。

### 目的

1. 地图编辑器实现中有关于UI方面的知识
2. 与Javascript相结合的算法知识
3. 同时会引入异步编程相关的代码
4. 地图寻路算法的可视化实现

### 地图编辑器

- 保存
- 编辑

## 2.寻路问题实现

### 地图编辑器

- 保存

  localStorage.setItem(),localStorage.getItem()

- 编辑

地图的定义

- 在一张地图上（100*100 = 10000格地图）
- 一维数组代表二维数组，每个点的坐标(x, y)为数组坐标的[100* y + x]

```js
    let map = localStorage.getItem('map') ? JSON.parse(localStorage.getItem('map')) : Array(10000).fill(0)
    let container = document.getElementById('container')
    let mouseDown = false
    let clear = false
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < 100; x++) {
        let cell = document.createElement('div')
        cell.classList.add('cell')
        if (map[100 * y + x] === 1)
          cell.style.backgroundColor = 'black'
        cell.addEventListener('mousemove', e => {
          if (mouseDown) {
            if (clear) {
              cell.style.backgroundColor = ''
              map[100 * y + x] = 0
            } else {
              cell.style.backgroundColor = 'black'
              map[100 * y + x] = 1
            }
          }
        })
        container.appendChild(cell)
      }
    }
    document.addEventListener('mousedown', e => {
      mouseDown = true
      clear = (e.which === 3)// 右键点击clear为true，清除
    })
    document.addEventListener('mouseup', e => mouseDown = false)
    document.addEventListener('contextmenu', e => e.preventDefault())

```



### 广度优先搜索

用while循环，用push()和shift()相结合实现简单的队列操作。

```js
    function path (map, start, end) {
      var queue = [start]
      function insert (x, y) {
        if (x < 0 || x >= 100 || y < 0 || y >= 100) {
          return
        }
        if (map[y * 100 + x])
          return
        map[y * 100 + x] = 2
        queue.push([x, y])
      }
      while (queue.length) {
        let [x,y] = queue.shift()
        if (x === end[0] && y === end[1]) {
          return true
        }
        insert(x - 1, y)
        insert(x, y - 1)
        insert(x + 1, y)
        insert(x, y + 1)
      }
      return false
    }
```



### 通过异步编程可视化寻路算法

使用异步编程中的async和await加入到之前的代码中实现可视化寻路的功能

```js
    function wait (time) {
      return new Promise((resolve, reject)=>{
        setTimeout(resolve, time);
      })
    }
    async function path (map, start, end) {
      var queue = [start]
      async function insert (x, y) {
        if (x < 0 || x >= 100 || y < 0 || y >= 100) {
          return
        }
        if (map[y * 100 + x])
          return
        await wait(30)
        container.children[y * 100 + x].style.backgroundColor = 'pink'
        map[y * 100 + x] = 2
        queue.push([x, y])
      }
      while (queue.length) {
        let [x,y] = queue.shift()
        if (x === end[0] && y === end[1]) {
          return true
        }
        await insert(x - 1, y)
        await insert(x, y - 1)
        await insert(x + 1, y)
        await insert(x, y + 1)
      }
      return false
    }
```



### 处理路径问题

每次寻路，传入前驱点，用copy一个map的数组table记录地图上每个走过的点的先驱点

```js
    async function findPath (map, start, end) {
      let table = Object.create(map)
      var queue = [start]
      async function insert (x, y, pre) {
        if (x < 0 || x >= 100 || y < 0 || y >= 100) {
          return
        }
        if (table[y * 100 + x])
          return
        // await wait(1)
        container.children[y * 100 + x].style.backgroundColor = 'lightgreen'
        table[y * 100 + x] = pre
        queue.push([x, y])
      }
      while (queue.length) {
        let [x,y] = queue.shift()
        // console.log(x, y)
        if (x === end[0] && y === end[1]) {
          let path = []
          // 终点
          path.push([x, y])
          container.children[y * 100 + x].style.backgroundColor = 'purple'
          while (x != start[0] || y != start[1]) {
            [x, y] = table[y * 100 + x]
            // path.push(map[y * 100 + x])??这个存的是路径么
            path.push([x, y])
            container.children[y * 100 + x].style.backgroundColor = 'pink'
          }
          // 起点
          container.children[start[1] * 100 + start[0]].style.backgroundColor = 'red'
          path = path.reverse()
          // 路径
          console.log(path)
          return path
        }
        // 横向竖向
        await insert(x - 1, y, [x, y])
        await insert(x, y - 1, [x, y])
        await insert(x + 1, y, [x, y])
        await insert(x, y + 1, [x, y])
        // 斜向
        await insert(x - 1, y - 1, [x, y])
        await insert(x + 1, y - 1, [x, y])
        await insert(x - 1, y + 1, [x, y])
        await insert(x + 1, y + 1, [x, y])
      }
      return null
    }
```



### 启发式算法(A*)

####  Sorted数据结构

改造queue数组。构造一个sorted数据结构，有一个data数组以及一个compare的方法，目的是保证每次take()出来的一个点都是通过compare方法运算过的最小点。

```js
	class Sorted {
      constructor (data, compare) {
        this.data = data.slice()
        this.compare = compare || ((a, b) => a - b)
      }
      take () {
        // 保证每次取出更小的
        if (!this.data.length)
          return
        let min = this.data[0]
        let minIndex = 0
        for (let i = 0; i < this.data.length; i++) {
          if (this.compare(this.data[i], min) < 0) {
            min = this.data[i]
            minIndex = i
          }
        }
        this.data[minIndex] = this.data[this.data.length - 1]
        this.data.pop()
        return min
      }
      give (v) {
        this.data.push(v)
      }
    }
```



#### A*启发式寻路算法

* 将queue改造成sorted的实例，传入一个distance函数作为compare函数。意在计算每个点与终点之间的距离。并找出每次距离最小值的点。
* 将queue的shift边为take，push变为give
* 探索：为每个点记录一个分数记为F。用step变量记录走过的步数。
  * f = step
  * 如果这个点已经被table记录过先驱点，就比较之前记录的f数，存入f较为小的先驱节点

```js
// ...      
    async function findPath (map, start, end) {
      let table = Object.create(map)
      let queue = new Sorted([start], (a, b) => distance(a) - distance(b))
      async function insert (x, y, pre, f) {
        if (x < 0 || x >= 100 || y < 0 || y >= 100) {
          return
        }
        // 撞墙了
        if (table[y * 100 + x] === 1)
          return
        if (table[y * 100 + x].point) {// 比较之前存取得先驱节点是否分数更低(存入分数更低的点，即是从起点的最短距离点)
          if (f > table[y * 100 + x].f) return
        } else {
          await wait(3)
          container.children[y * 100 + x].style.backgroundColor = 'lightgreen'
          queue.give([x, y])
        }
        table[y * 100 + x] = {
          prePoint: pre,
          point: [x, y],
          f: f
        }
      }
      function distance (point) {
        return (point[0] - end[0]) ** 2 + (point[1] - end[1]) ** 2
      }
      let step = -1
      let f = 0
      while (queue.data.length) {
        let [x,y] = queue.take()
        // 每take()一次就是走一步
        step ++
        // console.log(x, y)
        if (x === end[0] && y === end[1]) {
          let path = []
          // 终点
          path.push([x, y])
          container.children[y * 100 + x].style.backgroundColor = 'purple'
          while (x != start[0] || y != start[1]) {
            [x, y] = table[y * 100 + x].prePoint
            path.push([x, y])
            await wait(30)
            container.children[y * 100 + x].style.backgroundColor = 'pink'
          }
          // 起点
          container.children[start[1] * 100 + start[0]].style.backgroundColor = 'red'
          path = path.reverse()
          console.log(path.length)
          console.log(step)
          return path
        }
        // 横向竖向

        // 分数(记录走到这个点已经走过的步数)
        f = step
        await insert(x - 1, y, [x, y], f)
        await insert(x, y - 1, [x, y], f)
        await insert(x + 1, y, [x, y], f)
        await insert(x, y + 1, [x, y], f)
        // 斜向
        await insert(x - 1, y - 1, [x, y], f)
        await insert(x + 1, y - 1, [x, y], f)
        await insert(x - 1, y + 1, [x, y], f)
        await insert(x + 1, y + 1, [x, y], f)
      }
      return null
    }
```





















