function match (string) {
  let state = start
  for (const c of string) {
    state = state(c)
  }
  return state === end
}

function start (c) {
  if (c === 'a')
    return state1
  else
    return start
}

function end (c) {
  return end
}

function state1 (c) {
  if (c === 'b')
    return state2
  else
    return start(c)
}

function state2 (c) {
  if (c === 'c')
    return state3
  else
    return start(c)
}

function state3 (c) {
  if (c === 'a')
    return state4
  else
    return start(c)
}
function state4 (c) {
  if (c === 'b')
    return state5
  else
    return start(c)
}

function state5 (c) {
  if (c === 'x')
    return end
  else
    return state2(c)
}
console.log(match('abcabxabca'))
console.log(match('abcabcabx'))
