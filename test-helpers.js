"use strict";

var esvalid = require("./");
var assert = require("assert");

var STMT = {type: "EmptyStatement"};
var BLOCK = {type: "BlockStatement", body: []};
var EXPR = {type: "Literal", value: null};
var NUM = {type: "Literal", value: 0};
var STR = {type: "Literal", value: "a"};
var ID = {type: "Identifier", name: "a"};
var CATCH = {type: "CatchClause", param: ID, body: BLOCK};

// wrap a statement in a program
function wrapProgram(n) { return {type: "Program", body: [n]}; }
// wrap a statement in an iteration statement
function wrapIter(n) { return {type: "WhileStatement", test: {type: "Literal", value: true}, body: n}; }
// wrap zero or more statements in a function expression
function FE() { return {type: "FunctionExpression", params: [], body: {type: "BlockStatement", body: arguments}}; }
// wrap zero or more statements in a function declaration
function FD() { return {type: "FunctionDeclaration", id: ID, params: [], body: {type: "BlockStatement", body: arguments}}; }
// wrap a statement in a labeledstatement
function label(l, n) { return {type: "LabeledStatement", label: {type: "Identifier", name: l}, body: n}; }
// wrap an expression in an expressionstatement
function exprStmt(e) { return {type: "ExpressionStatement", expression: e}; }


function validStmt(x, msg, opt) { assert.ok(esvalid.isValid(wrapProgram(x), opt), msg); }
function invalidStmt(n, x, msg, opt) {
  assert.ok(!esvalid.isValid(wrapProgram(x), opt), msg);
  var errors = esvalid.errors(wrapProgram(x), opt);
  errors.forEach(function(e) { assert.notEqual(e.node, null, msg); });
  assert.equal(n, errors.length, msg);
}

function validExpr(x, msg, opt) { assert.ok(esvalid.isValidExpression(x, opt), msg); }
function invalidExpr(n, x, msg, opt) {
  assert.ok(!esvalid.isValidExpression(x, opt), msg);
  var errors = esvalid.errors(wrapProgram(exprStmt(x)), opt);
  errors.forEach(function(e) { assert.notEqual(e.node, null, msg); });
  assert.equal(n, errors.length, msg);
}

exports.STMT = STMT;
exports.BLOCK = BLOCK;
exports.EXPR = EXPR;
exports.NUM = NUM;
exports.STR = STR;
exports.ID = ID;
exports.CATCH = CATCH;

exports.wrapProgram = wrapProgram;
exports.wrapIter = wrapIter;
exports.FE = FE;
exports.FD = FD;
exports.label = label;
exports.exprStmt = exprStmt;

exports.validExpr = validExpr;
exports.invalidExpr = invalidExpr;
exports.validStmt = validStmt;
exports.invalidStmt = invalidStmt;
