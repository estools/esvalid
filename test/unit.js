/* global suite test */
"use strict";
var assert = require("assert");

var esvalid = require("..");
var isValid = esvalid.isValid;

var STMT = {type: "EmptyStatement"};
var EXPR = {type: "Literal", value: 0};
var ID = {type: "Identifier", name: "a"};

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
    assert.ok(isValid({type: "Program", body: [STMT]}));
  });

  test("SequenceExpression", function() {
    assert.ok(!isValid({type: "SequenceExpression"}));
    assert.ok(!isValid({type: "SequenceExpression", expressions: null}));
    assert.ok(!isValid({type: "SequenceExpression", expressions: []}));
    assert.ok(!isValid({type: "SequenceExpression", expressions: [EXPR]}));
    assert.ok(isValid({type: "SequenceExpression", expressions: [EXPR, EXPR]}));
  });

  test("SwitchStatement", function() {
    assert.ok(!isValid({type: "SwitchStatement", discriminant: EXPR}));
    assert.ok(!isValid({type: "SwitchStatement", discriminant: EXPR, cases: null}));
    assert.ok(!isValid({type: "SwitchStatement", discriminant: EXPR, cases: []}));
    assert.ok(isValid({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: EXPR, consequent: []}]}));
  });

  test("VariableDeclaration", function() {
    assert.ok(!isValid({type: "VariableDeclaration"}));
    assert.ok(!isValid({type: "VariableDeclaration", declarations: null}));
    assert.ok(!isValid({type: "VariableDeclaration", declarations: []}));
    assert.ok(isValid({type: "VariableDeclaration", declarations: [{type: "VariableDeclarator", id: ID}]}));
    assert.ok(isValid({type: "VariableDeclaration", declarations: [{type: "VariableDeclarator", id: ID, init: EXPR}]}));
    assert.ok(isValid({type: "VariableDeclaration", declarations: [{type: "VariableDeclarator", id: ID}, {type: "VariableDeclarator", id: ID}]}));
  });

});
