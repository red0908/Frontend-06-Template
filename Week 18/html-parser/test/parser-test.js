var assert = require('assert');
import {parseHTML} from '../src/parser'

describe('parse html:', function () {
  it('<a></a>', function() {
    let tree = parseHTML('<a></a>')
    assert.equal(tree.children[0].tagName, 'a');
    assert.equal(tree.children.length, 1);
  });
  it('<a href="//time.geekbang.org"></a>', function() {
    let tree = parseHTML('<a href="//time.geekbang.org"></a>')
    assert.equal(tree.children[0].tagName, 'a');
    assert.equal(tree.children.length, 1);
  });
  it('<a href></a>', function() {
    // 127-135
    let tree = parseHTML('<a href></a>')
    assert.equal(tree.children[0].tagName, 'a');
    assert.equal(tree.children.length, 1);
  });
  it('<a href id></a>', function() {
    // 135-143
    let tree = parseHTML('<a href id></a>')
    assert.equal(tree.children[0].tagName, 'a');
    assert.equal(tree.children.length, 1);
  });
  it('<a id=\'a\'></a>', function() {
    // 168-171
    let tree = parseHTML('<a id=\'a\'></a>')
    assert.equal(tree.children[0].tagName, 'a');
    assert.equal(tree.children.length, 1);
  });
  it('<a id=abc></a>', function() {
    // 171-175
    let tree = parseHTML('<a id=abc></a>')
    assert.equal(tree.children[0].tagName, 'a');
    assert.equal(tree.children.length, 1);
  });
  it('<a id="abc" href></a>', function() {
    // 230
    let tree = parseHTML('<a id="abc" href></a>')
    assert.equal(tree.children[0].tagName, 'a');
    assert.equal(tree.children.length, 1);
  });
  it('<a id=abc href></a>', function() {
    // 209-210
    let tree = parseHTML('<a id=abc href></a>')
    assert.equal(tree.children[0].tagName, 'a');
    assert.equal(tree.children.length, 1);
  });
  it('<a id=\'a\'/>', function() {
    // 
    let tree = parseHTML('<a id=\'a\'/>')
    assert.equal(tree.children[0].tagName, 'a');
    assert.equal(tree.children.length, 1);
  });

  it('<a />', function() {
    // 130
    let tree = parseHTML('<a />')
    assert.equal(tree.children[0].tagName, 'a');
    assert.equal(tree.children.length, 1);
  });
  it('<A /> upper casse', function() {
    // 100
    let tree = parseHTML('<A />')
    assert.equal(tree.children[0].tagName, 'A');
    assert.equal(tree.children.length, 1);
  });
  it('<a/>', function() {
    // 98
    let tree = parseHTML('<a/>')
    assert.equal(tree.children[0].tagName, 'a');
    assert.equal(tree.children.length, 1);
  });
  it('<a id=a/>', function() {
    let tree = parseHTML('<a id=a/>')
    assert.equal(tree.children[0].tagName, 'a');
    assert.equal(tree.children.length, 1);
  });
  it('<>', function() {
    let tree = parseHTML('<>')
    assert.equal(tree.children[0].type, 'text');
    assert.equal(tree.children[0].content, '<>');
  });
})

