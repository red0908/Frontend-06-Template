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
}
  function wildCardFind (source, pattern) {
    // 计算有多少个 * 号
    let startCount = 0
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === '*')
        startCount++
    }
    // 如果没有 * 号,严格完美匹配
    if (startCount === 0) {
      for (let i = 0; i < pattern.length; i++) {
        // 如果字符不匹配，且pattern[i]的表达式模式字符不为？则匹配不成功返回false
        if (pattern[i] !== source[i] && pattern[i] !== '?')
          return false
      }
      // 完美匹配返回true
      return true
    }
    // 匹配第一个*号前的字段串段
    let i = 0
    let lastIndex = 0
    for (i = 0; pattern[i] !== '*'; i++) {
      // 如果字符不匹配，且pattern[i]的表达式模式字符不为？则匹配不成功返回false
      if (pattern[i] !== source[i] && pattern[i] !== '?')
          return false
    }
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
        lastIndex = lastIndex + ( result + 1 )
      }
    }
    // 从尾巴向最后一个*的字符串段进行扫描匹配
    for (let j = 0; j <= source.length - lastIndex && pattern[pattern.length - j] !== '*' ; j++) {
      if (pattern[pattern.length - j] !== source[source.length - j] && pattern[pattern.length - j] !== '?')
          return false
    }
    return true
  }
  // console.log(wildCardFind('abcabcabxxaac', 'a*b*bx*c'))
  // console.log(wildCardFind('abcabcabsxxaac', 'a*b*bx*c'))
  console.log(wildCardFind('abcabcabsxxaac', 'a*b*b?x*xa*c'))