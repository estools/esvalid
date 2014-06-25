/* global suite test */
"use strict";
var assert = require("assert");

var esvalid = require("..");
function valid(x, msg) { assert.ok(esvalid.isValid(x), msg); }
function notValid(x, msg) { assert.ok(!esvalid.isValid(x), msg); }

var STMT = {type: "EmptyStatement"};
var BLOCK = {type: "BlockStatement", body: []};
var EXPR = {type: "Literal", value: 0};
var ID = {type: "Identifier", name: "a"};
var CATCH = {type: "CatchClause", param: ID, body: BLOCK};

suite("unit", function(){

  test("non-nodes", function() {
    notValid(null);
    notValid(0);
    notValid({});
    notValid("Program");
    notValid({type: null});
    notValid({type: false});
    notValid({type: ""});
    notValid({type: "Node"});
  });

  test("Node", function() {
    notValid({type: "EmptyStatement", loc: {}});
    notValid({type: "EmptyStatement", loc: {start: null, end: 0}});
    notValid({type: "EmptyStatement", loc: {start: {}, end: {}}});
    notValid({type: "EmptyStatement", loc: {start: {line: "a", column: "b"}, end: {line: "a", column: "b"}}});
    notValid({type: "EmptyStatement", loc: {start: {line: 0, column: 0}, end: {line: 1, column: 0}}});
    notValid({type: "EmptyStatement", loc: {start: {line: 1, column: 0}, end: {line: 0, column: 0}}});
    notValid({type: "EmptyStatement", loc: {start: {line: 1, column: -1}, end: {line: 1, column: 0}}});
    notValid({type: "EmptyStatement", loc: {start: {line: 1, column: 0}, end: {line: 1, column: -1}}});
    notValid({type: "EmptyStatement", loc: {source: 0, start: {line: 1, column: 0}, end: {line: 1, column: 0}}});
    valid({type: "EmptyStatement", loc: {start: {line: 1, column: 0}, end: {line: 1, column: 0}}});
    valid({type: "EmptyStatement", loc: {source: "", start: {line: 1, column: 0}, end: {line: 1, column: 0}}});
    valid({type: "EmptyStatement", loc: null});
  });


  test("Program", function() {
    notValid({type: "Program"});
    notValid({type: "Program", body: null});
    valid({type: "Program", body: []});
    valid({type: "Program", body: [STMT]});
    valid({type: "Program", body: [STMT, STMT]});
    notValid({type: "Program", body: [STMT, EXPR, STMT]});
  });

  test("SequenceExpression", function() {
    notValid({type: "SequenceExpression"});
    notValid({type: "SequenceExpression", expressions: null});
    notValid({type: "SequenceExpression", expressions: []});
    notValid({type: "SequenceExpression", expressions: [EXPR]});
    valid({type: "SequenceExpression", expressions: [EXPR, EXPR]});
  });

  test("SwitchStatement", function() {
    notValid({type: "SwitchStatement", discriminant: EXPR});
    notValid({type: "SwitchStatement", discriminant: EXPR, cases: null});
    notValid({type: "SwitchStatement", discriminant: EXPR, cases: []});
    valid({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: EXPR, consequent: []}]});
  });

  test("TryStatement", function() {
    notValid({type: "TryStatement"});
    notValid({type: "TryStatement", block: BLOCK});
    notValid({type: "TryStatement", block: BLOCK, handler: BLOCK});
    notValid({type: "TryStatement", block: BLOCK, handlers: []});
    notValid({type: "TryStatement", block: BLOCK, handlers: [CATCH, null, CATCH]});
    notValid({type: "TryStatement", block: BLOCK, handlers: [CATCH, BLOCK, CATCH]});
    valid({type: "TryStatement", block: BLOCK, handler: CATCH});
    valid({type: "TryStatement", block: BLOCK, finalizer: BLOCK});
    valid({type: "TryStatement", block: BLOCK, handler: CATCH, finalizer: BLOCK});
    valid({type: "TryStatement", block: BLOCK, handlers: [CATCH]});
    valid({type: "TryStatement", block: BLOCK, handlers: [CATCH, CATCH]});
    valid({type: "TryStatement", block: BLOCK, finalizer: BLOCK});
    valid({type: "TryStatement", block: BLOCK, handler: CATCH, finalizer: BLOCK});
  });

  test("VariableDeclaration", function() {
    notValid({type: "VariableDeclaration"});
    notValid({type: "VariableDeclaration", declarations: null});
    notValid({type: "VariableDeclaration", declarations: []});
    valid({type: "VariableDeclaration", declarations: [{type: "VariableDeclarator", id: ID}]});
    valid({type: "VariableDeclaration", declarations: [{type: "VariableDeclarator", id: ID, init: EXPR}]});
    valid({type: "VariableDeclaration", declarations: [{type: "VariableDeclarator", id: ID}, {type: "VariableDeclarator", id: ID}]});
  });

});
