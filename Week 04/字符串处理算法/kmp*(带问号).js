function kmp (source, pattern) {
  // 计算table
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
  console.log(table)
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
          console.log(`在${source} 中匹配 ${pattern}`)
          console.log('起始索引:', start, '结束索引:', end)
          console.log('-------')
          return true
        }
    }
    return false
  }
}
// console.log(kmp('aaabcdds', 'a?c')) // true
// console.log(kmp('aaabcdds', 'a?')) // true
// console.log(kmp('aa', 'aaaa?')) // false
// console.log(kmp('axc', 'axc?')) // true
// console.log(kmp('axcc', 'axc?')) // true
// console.log(kmp('axcx', 'axc?x')) // true
// console.log(kmp('zzsva', 'xxsva?')) // false
// console.log(kmp('xxsva', 'xxsva?')) // true
// console.log(kmp('bxxsva', 'xxsva?')) // true
// console.log(kmp('bxxsva', 'xxs?va?'))// true
// console.log(kmp('bxxsva', 'xxs?'))// true
console.log(kmp('bxxsvva', 'xxs?va?'))

