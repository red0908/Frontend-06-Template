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
    return false
  }
}
// console.log(kmp('aaabaaacx', 'aabaaac'))
// console.log(kmp('Hellow', 'll'))
// console.log(kmp('abc', 'abc'))
console.log(kmp('aaa', 'aa'))
