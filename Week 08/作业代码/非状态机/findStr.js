function findStr (string) {
  let flag = ''
  for (const char of string) {
    if (char === 'a')
      flag = 'a'
    else if (char === 'b' && flag === 'a')
      flag = 'ab'
    else if (char === 'c' && flag === 'ab')
      flag = 'abc'
    else if (char === 'd' && flag === 'abc')
      flag = 'abcd'
    else if (char === 'e' && flag === 'abcd')
      flag = 'abcde'
    else if (char === 'f' && flag === 'abcde') {
      flag = 'abcdef'
      break
    }
    else
      flag = ''
  }
  return flag === 'abcdef'
}
console.log(findStr('This is abcdef ab'))
console.log(findStr('This is abcaef'))