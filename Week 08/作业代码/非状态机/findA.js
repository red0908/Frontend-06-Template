function findA (str) {
  for (const c of str) {
    if (c === 'a')
      return true
  }
  return false
}
console.log(findA('This'))
console.log(findA('This is an apple'))
