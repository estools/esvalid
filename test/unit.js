/* global suite test */
"use strict";
var assert = require("assert");

var esvalid = require("..");
var isValid = esvalid.isValid;

suite("unit", function(){

  test("non-nodes", function() {
    assert.ok(!isValid(null));
    assert.ok(!isValid(0));
    assert.ok(!isValid({}));
    assert.ok(!isValid("Program"));
    assert.ok(!isValid({type: null}));
    assert.ok(!isValid({type: false}));
    assert.ok(!isValid({type: ""}));
    assert.ok(!isValid({type: "Node"}));
  });

  test("Node", function() {
    assert.ok(!isValid({type: "EmptyStatement", loc: {}}));
    assert.ok(!isValid({type: "EmptyStatement", loc: {start: null, end: 0}}));
    assert.ok(!isValid({type: "EmptyStatement", loc: {start: {}, end: {}}}));
    assert.ok(!isValid({type: "EmptyStatement", loc: {start: {line: "a", column: "b"}, end: {line: "a", column: "b"}}}));
    assert.ok(!isValid({type: "EmptyStatement", loc: {start: {line: 0, column: 0}, end: {line: 1, column: 0}}}));
    assert.ok(!isValid({type: "EmptyStatement", loc: {start: {line: 1, column: 0}, end: {line: 0, column: 0}}}));
    assert.ok(!isValid({type: "EmptyStatement", loc: {start: {line: 1, column: -1}, end: {line: 1, column: 0}}}));
    assert.ok(!isValid({type: "EmptyStatement", loc: {start: {line: 1, column: 0}, end: {line: 1, column: -1}}}));
    assert.ok(!isValid({type: "EmptyStatement", loc: {source: 0, start: {line: 1, column: 0}, end: {line: 1, column: 0}}}));
    assert.ok(isValid({type: "EmptyStatement", loc: {start: {line: 1, column: 0}, end: {line: 1, column: 0}}}));
    assert.ok(isValid({type: "EmptyStatement", loc: {source: "", start: {line: 1, column: 0}, end: {line: 1, column: 0}}}));
    assert.ok(isValid({type: "EmptyStatement", loc: null}));
  });

  test("Program", function() {
    assert.ok(!isValid({type: "Program"}));
    assert.ok(!isValid({type: "Program", body: null}));
    assert.ok(isValid({type: "Program", body: []}));
    assert.ok(isValid({type: "Program", body: [{type: "EmptyStatement"}]}));
  });

  // TODO: lots more

});
