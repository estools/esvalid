/* global suite test */
"use strict";
var assert = require("assert");

var esvalid = require("..");
function valid(x, msg) { assert.ok(esvalid.isValid(x), msg); }
function notValid(x, msg) { assert.ok(!esvalid.isValid(x), msg); }

var STMT = {type: "EmptyStatement"};
var BLOCK = {type: "BlockStatement", body: []};
var EXPR = {type: "Literal", value: null};
var NUM = {type: "Literal", value: 0};
var STR = {type: "Literal", value: "a"};
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


  test("ArrayExpression", function() {
    valid({type: "ArrayExpression", elements: []});
    valid({type: "ArrayExpression", elements: [null]});
    valid({type: "ArrayExpression", elements: [EXPR]});
    valid({type: "ArrayExpression", elements: [EXPR, EXPR]});
    valid({type: "ArrayExpression", elements: [EXPR, null, EXPR]});
    notValid({type: "ArrayExpression"});
    notValid({type: "ArrayExpression", elements: [STMT]});
  });

  test("IfStatement", function() {
    valid({type: "IfStatement", test: EXPR, consequent: STMT});
    valid({type: "IfStatement", test: EXPR, consequent: BLOCK});
    valid({type: "IfStatement", test: EXPR, consequent: STMT, alternate: STMT});
    valid({type: "IfStatement", test: EXPR, consequent: BLOCK, alternate: BLOCK});
    valid({type: "IfStatement", test: EXPR, consequent: STMT, alternate: BLOCK});
    valid({type: "IfStatement", test: EXPR, consequent: BLOCK, alternate: STMT});
    notValid({type: "IfStatement", test: EXPR});
    notValid({type: "IfStatement", test: STMT, consequent: STMT});
    notValid({type: "IfStatement", test: EXPR, consequent: EXPR});
    notValid({type: "IfStatement", test: EXPR, alternate: STMT});
    notValid({type: "IfStatement", test: EXPR, consequent: {type: "IfStatement", test: EXPR, consequent: STMT}, alternate: STMT});
    notValid({type: "IfStatement", test: EXPR, consequent: {type: "IfStatement", test: EXPR, consequent: STMT, alternate: {type: "IfStatement", test: EXPR, consequent: STMT}}, alternate: STMT});
    notValid({type: "IfStatement", test: EXPR, consequent: {type: "IfStatement", test: EXPR, consequent: {type: "IfStatement", test: EXPR, consequent: STMT}}, alternate: STMT});
  });

  test("ObjectExpression", function() {
    valid({type: "ObjectExpression", properties: []});
    valid({type: "ObjectExpression", properties: [{kind: "init", key: ID, value: EXPR}]});
    valid({type: "ObjectExpression", properties: [{kind: "get", key: ID, value: EXPR}]});
    valid({type: "ObjectExpression", properties: [{kind: "set", key: ID, value: EXPR}]});
    valid({type: "ObjectExpression", properties: [{kind: "init", key: NUM, value: EXPR}]});
    valid({type: "ObjectExpression", properties: [{kind: "init", key: STR, value: EXPR}]});
    notValid({type: "ObjectExpression"});
    notValid({type: "ObjectExpression", properties: [{key: ID, value: EXPR}]});
    notValid({type: "ObjectExpression", properties: [{kind: "-", key: ID, value: EXPR}]});
    notValid({type: "ObjectExpression", properties: [{kind: "init", key: STMT, value: EXPR}]});
    notValid({type: "ObjectExpression", properties: [{kind: "init", key: ID, value: STMT}]});
    notValid({type: "ObjectExpression", properties: [{kind: "init", key: ID, value: BLOCK}]});
    notValid({type: "ObjectExpression", properties: [{kind: "init", key: EXPR, value: EXPR}]});
    notValid({type: "ObjectExpression", properties: [{kind: "init", key: {type: "Literal", value: null}, value: EXPR}]});
    notValid({type: "ObjectExpression", properties: [{kind: "init", key: {type: "Literal", value: /./}, value: EXPR}]});
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
