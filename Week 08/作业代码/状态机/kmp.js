function makeState (pattern) {
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
  return table
}
function match (pattern, source) {
  let stateTable = makeState(pattern)
  let state = 0
  for (const c of source) {
    state = changeState(c, state, stateTable, pattern)
  }
  return state === -1
}
function changeState (c, state, stateTable, pattern) {
  if (state === -1) return state
  if (c === pattern[state]) {
    // 结束
    if (pattern.length - 1 === state)
      return -1
    // 下一个状态
    state++
    return state
  } else {
    if (state === 0)
      return 0
    return changeState(c, stateTable[state], stateTable, pattern)
  }
}
console.log(match('ababax', 'abababaxyyy'));

