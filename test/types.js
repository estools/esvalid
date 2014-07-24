/* global suite test */
"use strict";

var assert = require("assert");

var esvalid = require("..");

var helpers = require("../test-helpers");
var STMT = helpers.STMT, BLOCK = helpers.BLOCK, EXPR = helpers.EXPR,
    NUM = helpers.NUM, STR = helpers.STR, ID = helpers.ID, CATCH = helpers.CATCH;
var wrapProgram = helpers.wrapProgram, wrapIter = helpers.wrapIter,
    FE = helpers.FE, FD = helpers.FD, label = helpers.label, exprStmt = helpers.exprStmt;
var validExpr = helpers.validExpr, invalidExpr = helpers.invalidExpr,
    validStmt = helpers.validStmt, invalidStmt = helpers.invalidStmt;

suite("type checks", function() {

  test("Node", function() {
    invalidStmt(2, {type: "EmptyStatement", loc: {}});
    invalidStmt(3, {type: "EmptyStatement", loc: {start: null, end: 0}});
    invalidStmt(4, {type: "EmptyStatement", loc: {start: {}, end: {}}});
    invalidStmt(4, {type: "EmptyStatement", loc: {start: {line: "a", column: "b"}, end: {line: "a", column: "b"}}});
    invalidStmt(1, {type: "EmptyStatement", loc: {start: {line: 0, column: 0}, end: {line: 1, column: 0}}});
    invalidStmt(1, {type: "EmptyStatement", loc: {start: {line: 1, column: 0}, end: {line: 0, column: 0}}});
    invalidStmt(1, {type: "EmptyStatement", loc: {start: {line: 1, column: -1}, end: {line: 1, column: 0}}});
    invalidStmt(1, {type: "EmptyStatement", loc: {start: {line: 1, column: 0}, end: {line: 1, column: -1}}});
    invalidStmt(1, {type: "EmptyStatement", loc: {source: 0, start: {line: 1, column: 0}, end: {line: 1, column: 0}}});
    validStmt({type: "EmptyStatement", loc: {start: {line: 1, column: 0}, end: {line: 1, column: 0}}});
    validStmt({type: "EmptyStatement", loc: {source: "", start: {line: 1, column: 0}, end: {line: 1, column: 0}}});
    validStmt({type: "EmptyStatement", loc: null});
  });


  test("ArrayExpression", function() {
    validExpr({type: "ArrayExpression", elements: []});
    validExpr({type: "ArrayExpression", elements: [null]});
    validExpr({type: "ArrayExpression", elements: [EXPR]});
    validExpr({type: "ArrayExpression", elements: [EXPR, EXPR]});
    validExpr({type: "ArrayExpression", elements: [EXPR, null, EXPR]});
    invalidExpr(1, {type: "ArrayExpression"});
    invalidExpr(1, {type: "ArrayExpression", elements: [STMT]});
  });

  test("AssignmentExpression", function() {
    validExpr({type: "AssignmentExpression", operator: "=", left: EXPR, right: EXPR});
    validExpr({type: "AssignmentExpression", operator: "+=", left: EXPR, right: EXPR});
    invalidExpr(3, {type: "AssignmentExpression"});
    invalidExpr(1, {type: "AssignmentExpression", left: EXPR, right: EXPR});
    invalidExpr(1, {type: "AssignmentExpression", operator: "=", left: EXPR});
    invalidExpr(1, {type: "AssignmentExpression", operator: "=", right: EXPR});
    invalidExpr(1, {type: "AssignmentExpression", left: EXPR, right: EXPR});
    invalidExpr(2, {type: "AssignmentExpression", operator: "="});
    invalidExpr(2, {type: "AssignmentExpression", left: EXPR});
    invalidExpr(2, {type: "AssignmentExpression", right: EXPR});
    invalidExpr(1, {type: "AssignmentExpression", operator: "||=", left: EXPR, right: EXPR});
    invalidExpr(1, {type: "AssignmentExpression", operator: "=", left: STMT, right: EXPR});
    invalidExpr(1, {type: "AssignmentExpression", operator: "=", left: EXPR, right: STMT});
  });

  test("BinaryExpression", function() {
    validExpr({type: "BinaryExpression", operator: "+", left: EXPR, right: EXPR});
    validExpr({type: "BinaryExpression", operator: "&", left: EXPR, right: EXPR});
    invalidExpr(3, {type: "BinaryExpression"});
    invalidExpr(1, {type: "BinaryExpression", left: EXPR, right: EXPR});
    invalidExpr(1, {type: "BinaryExpression", operator: "+", left: EXPR});
    invalidExpr(1, {type: "BinaryExpression", operator: "+", right: EXPR});
    invalidExpr(1, {type: "BinaryExpression", left: EXPR, right: EXPR});
    invalidExpr(2, {type: "BinaryExpression", operator: "+"});
    invalidExpr(2, {type: "BinaryExpression", left: EXPR});
    invalidExpr(2, {type: "BinaryExpression", right: EXPR});
    invalidExpr(1, {type: "BinaryExpression", operator: "=", left: EXPR, right: EXPR});
    invalidExpr(1, {type: "BinaryExpression", operator: "||", left: EXPR, right: EXPR});
    invalidExpr(1, {type: "BinaryExpression", operator: "+", left: STMT, right: EXPR});
    invalidExpr(1, {type: "BinaryExpression", operator: "+", left: EXPR, right: STMT});
  });

  test("Blocktatement", function() {
    validStmt({type: "BlockStatement", body: []});
    validStmt({type: "BlockStatement", body: [STMT]});
    validStmt({type: "BlockStatement", body: [STMT, STMT]});
    invalidStmt(1, {type: "BlockStatement"});
    invalidStmt(1, {type: "BlockStatement", body: null});
    invalidStmt(1, {type: "BlockStatement", body: [null]});
    invalidStmt(1, {type: "BlockStatement", body: [EXPR]});
    invalidStmt(1, {type: "BlockStatement", body: [FD(STMT)]});
  });

  test("BreakStatement", function() {
    validStmt(wrapIter({type: "BreakStatement"}));
    validStmt(wrapIter({type: "BreakStatement", label: null}));
    validStmt(label(ID.name, wrapIter({type: "BreakStatement", label: ID})));
    validStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: null, consequent: [{type: "BreakStatement"}]}]});
    invalidStmt(1, label(ID.name, wrapIter({type: "BreakStatement", label: STMT})));
    invalidStmt(1, {type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: null, consequent: [{type: "BreakStatement", label: STMT}]}]});
    invalidStmt(1, {type: "BreakStatement"});
  });

  test("CallExpression", function() {
    validExpr({type: "CallExpression", callee: EXPR, arguments: []});
    validExpr({type: "CallExpression", callee: EXPR, arguments: [EXPR]});
    validExpr({type: "CallExpression", callee: EXPR, arguments: [EXPR, EXPR, EXPR]});
    invalidExpr(2, {type: "CallExpression"});
    invalidExpr(1, {type: "CallExpression", callee: EXPR});
    invalidExpr(1, {type: "CallExpression", arguments: []});
    invalidExpr(1, {type: "CallExpression", callee: EXPR, arguments: [null]});
    invalidExpr(1, {type: "CallExpression", callee: EXPR, arguments: [STMT]});
    invalidExpr(1, {type: "CallExpression", callee: EXPR, arguments: [EXPR, STMT, EXPR]});
  });

  test("CatchClause", function() {
    function wrapTry(x) { return {type: "TryStatement", block: BLOCK, handler: x}; }
    validStmt(wrapTry({type: "CatchClause", param: ID, body: BLOCK}));
    validStmt(wrapTry({type: "CatchClause", param: EXPR, body: BLOCK}));
    invalidStmt(2, wrapTry({type: "CatchClause"}));
    invalidStmt(1, wrapTry({type: "CatchClause", param: ID}));
    invalidStmt(1, wrapTry({type: "CatchClause", body: BLOCK}));
    invalidStmt(1, wrapTry({type: "CatchClause", param: ID, body: {type: "EmptyStatement"}}));
    invalidStmt(1, wrapTry({type: "CatchClause", param: STMT, body: BLOCK}));
  });

  test("ConditionalExpression", function() {
    validExpr({type: "ConditionalExpression", test: EXPR, alternate: EXPR, consequent: EXPR});
    invalidExpr(3, {type: "ConditionalExpression"});
    invalidExpr(1, {type: "ConditionalExpression", alternate: EXPR, consequent: EXPR});
    invalidExpr(1, {type: "ConditionalExpression", test: EXPR, consequent: EXPR});
    invalidExpr(1, {type: "ConditionalExpression", test: EXPR, alternate: EXPR});
    invalidExpr(1, {type: "ConditionalExpression", test: STMT, alternate: EXPR, consequent: EXPR});
    invalidExpr(1, {type: "ConditionalExpression", test: EXPR, alternate: STMT, consequent: EXPR});
    invalidExpr(1, {type: "ConditionalExpression", test: EXPR, alternate: EXPR, consequent: STMT});
    invalidExpr(1, {type: "ConditionalExpression", test: null, alternate: EXPR, consequent: EXPR});
    invalidExpr(1, {type: "ConditionalExpression", test: EXPR, alternate: null, consequent: EXPR});
    invalidExpr(1, {type: "ConditionalExpression", test: EXPR, alternate: EXPR, consequent: null});
  });

  test("ContinueStatement", function() {
    validStmt(wrapIter({type: "ContinueStatement"}));
    validStmt(wrapIter({type: "ContinueStatement", label: null}));
    validStmt(label(ID.name, wrapIter({type: "ContinueStatement", label: ID})));
    invalidStmt(1, label(ID.name, wrapIter({type: "ContinueStatement", label: STMT})));
    invalidStmt(1, {type: "ContinueStatement"});
  });

  test("DebuggerStatement", function() {
    validStmt({type: "DebuggerStatement"});
  });

  test("DoWhileStatement", function() {
    validStmt({type: "DoWhileStatement", body: STMT, test: EXPR});
    invalidStmt(2, {type: "DoWhileStatement"});
    invalidStmt(1, {type: "DoWhileStatement", body: STMT});
    invalidStmt(1, {type: "DoWhileStatement", test: EXPR});
    invalidStmt(1, {type: "DoWhileStatement", body: EXPR, test: EXPR});
    invalidStmt(1, {type: "DoWhileStatement", body: STMT, test: STMT});
  });

  test("EmptyStatement", function() {
    validStmt({type: "EmptyStatement"});
  });

  test("ExpressionStatement", function() {
    validStmt({type: "ExpressionStatement", expression: EXPR});
    invalidStmt(1, {type: "ExpressionStatement"});
    invalidStmt(1, {type: "ExpressionStatement", expression: STMT});
    invalidStmt(1, {type: "ExpressionStatement", expression: FD(STMT)});
  });

  test("ForInStatement", function() {
    validStmt({type: "ForInStatement", left: EXPR, right: EXPR, body: STMT});
    validStmt({type: "ForInStatement", left: {type: "VariableDeclaration", kind: "var", declarations: [{type: "VariableDeclarator", id: ID}]}, right: EXPR, body: STMT});
    invalidStmt(3, {type: "ForInStatement"});
    invalidStmt(2, {type: "ForInStatement", left: EXPR});
    invalidStmt(2, {type: "ForInStatement", right: EXPR});
    invalidStmt(1, {type: "ForInStatement", left: EXPR, right: EXPR});
    invalidStmt(1, {type: "ForInStatement", left: EXPR, body: STMT});
    invalidStmt(1, {type: "ForInStatement", right: EXPR, body: STMT});
    invalidStmt(1, {type: "ForInStatement", left: EXPR, right: EXPR, body: EXPR});
    invalidStmt(1, {type: "ForInStatement", left: STMT, right: EXPR, body: STMT});
    invalidStmt(1, {type: "ForInStatement", left: EXPR, right: STMT, body: STMT});
  });

  test("ForStatement", function() {
    validStmt({type: "ForStatement", init: EXPR, test: EXPR, update: EXPR, body: STMT});
    validStmt({type: "ForStatement", init: {type: "VariableDeclaration", kind: "var", declarations: [{type: "VariableDeclarator", id: ID}]}, test: EXPR, update: EXPR, body: STMT});
    validStmt({type: "ForStatement", init: EXPR, body: STMT});
    validStmt({type: "ForStatement", init: {type: "VariableDeclaration", kind: "var", declarations: [{type: "VariableDeclarator", id: ID}]}, body: STMT});
    validStmt({type: "ForStatement", test: EXPR, body: STMT});
    validStmt({type: "ForStatement", update: EXPR, body: STMT});
    validStmt({type: "ForStatement", body: STMT});
    invalidStmt(1, {type: "ForStatement"});
    invalidStmt(1, {type: "ForStatement", init: EXPR});
    invalidStmt(1, {type: "ForStatement", test: EXPR});
    invalidStmt(1, {type: "ForStatement", update: EXPR});
    invalidStmt(1, {type: "ForStatement", init: EXPR, test: EXPR});
    invalidStmt(1, {type: "ForStatement", test: EXPR, update: EXPR});
    invalidStmt(1, {type: "ForStatement", init: EXPR, update: EXPR});
    invalidStmt(1, {type: "ForStatement", init: EXPR, test: EXPR, update: EXPR});
    invalidStmt(1, {type: "ForStatement", body: EXPR});
    invalidStmt(1, {type: "ForStatement", init: STMT, body: STMT});
    invalidStmt(1, {type: "ForStatement", test: STMT, body: STMT});
    invalidStmt(1, {type: "ForStatement", update: STMT, body: STMT});
  });

  test("FunctionDeclaration", function() {
    validStmt({type: "FunctionDeclaration", id: ID, params: [], body: BLOCK});
    validStmt({type: "FunctionDeclaration", id: ID, params: [ID], body: BLOCK});
    validStmt({type: "FunctionDeclaration", id: ID, params: [{type: "Identifier", name: "a"}, {type: "Identifier", name: "b"}], body: BLOCK});
    validStmt({type: "FunctionDeclaration", id: ID, params: [], body: {type: "BlockStatement", body: [FD(STMT)]}});
    invalidStmt(3, {type: "FunctionDeclaration"});
    invalidStmt(1, {type: "FunctionDeclaration", params: [], body: BLOCK});
    invalidStmt(1, {type: "FunctionDeclaration", id: ID, params: [], body: EXPR});
    invalidStmt(1, {type: "FunctionDeclaration", id: null, params: [], body: BLOCK});
    invalidStmt(1, {type: "FunctionDeclaration", id: ID, params: []});
    invalidStmt(1, {type: "FunctionDeclaration", id: STMT, params: [], body: BLOCK});
    invalidStmt(1, {type: "FunctionDeclaration", id: ID, body: BLOCK});
    invalidStmt(1, {type: "FunctionDeclaration", id: ID, params: [null], body: BLOCK});
    invalidStmt(1, {type: "FunctionDeclaration", id: ID, params: [STMT], body: BLOCK});
  });

  test("FunctionExpression", function() {
    validExpr({type: "FunctionExpression", params: [], body: BLOCK});
    validExpr({type: "FunctionExpression", id: null, params: [], body: BLOCK});
    validExpr({type: "FunctionExpression", id: ID, params: [], body: BLOCK});
    validExpr({type: "FunctionExpression", id: ID, params: [ID], body: BLOCK});
    validExpr({type: "FunctionExpression", id: ID, params: [{type: "Identifier", name: "a"}, {type: "Identifier", name: "b"}], body: BLOCK});
    validExpr({type: "FunctionExpression", params: [], body: {type: "BlockStatement", body: [FD(STMT)]}});
    invalidExpr(2, {type: "FunctionExpression"});
    invalidExpr(1, {type: "FunctionExpression", params: []});
    invalidExpr(1, {type: "FunctionExpression", body: BLOCK});
    invalidExpr(1, {type: "FunctionExpression", params: [null], body: BLOCK});
    invalidExpr(1, {type: "FunctionExpression", params: [], body: EXPR});
    invalidExpr(1, {type: "FunctionExpression", id: STMT, params: [], body: BLOCK});
    invalidExpr(1, {type: "FunctionExpression", id: ID, params: [STMT], body: BLOCK});
  });

  test("Identifier", function() {
    validExpr({type: "Identifier", name: "x"});
    invalidExpr(1, {type: "Identifier"});
    invalidExpr(1, {type: "Identifier", name: null});
  });

  test("IfStatement", function() {
    validStmt({type: "IfStatement", test: EXPR, consequent: STMT});
    validStmt({type: "IfStatement", test: EXPR, consequent: BLOCK});
    validStmt({type: "IfStatement", test: EXPR, consequent: STMT, alternate: STMT});
    validStmt({type: "IfStatement", test: EXPR, consequent: BLOCK, alternate: BLOCK});
    validStmt({type: "IfStatement", test: EXPR, consequent: STMT, alternate: BLOCK});
    validStmt({type: "IfStatement", test: EXPR, consequent: BLOCK, alternate: STMT});
    invalidStmt(2, {type: "IfStatement"});
    invalidStmt(1, {type: "IfStatement", test: EXPR});
    invalidStmt(1, {type: "IfStatement", test: STMT, consequent: STMT});
    invalidStmt(1, {type: "IfStatement", test: EXPR, consequent: EXPR});
    invalidStmt(1, {type: "IfStatement", test: EXPR, alternate: STMT});
    invalidStmt(1, {type: "IfStatement", test: EXPR, consequent: STMT, alternate: EXPR});
  });

  test("LabeledStatement", function() {
    validStmt({type: "LabeledStatement", label: ID, body: STMT});
    invalidStmt(2, {type: "LabeledStatement"});
    invalidStmt(1, {type: "LabeledStatement", label: null, body: STMT});
    invalidStmt(2, {type: "LabeledStatement", label: 0, body: STMT});
    invalidStmt(1, {type: "LabeledStatement", label: ID, body: null});
    invalidStmt(2, {type: "LabeledStatement", label: ID, body: false});
  });

  test("Literal", function() {
    validExpr({type: "Literal", value: null});
    validExpr({type: "Literal", value: "string"});
    validExpr({type: "Literal", value: ""});
    validExpr({type: "Literal", value: 0});
    validExpr({type: "Literal", value: 1});
    validExpr({type: "Literal", value: 1e308});
    validExpr({type: "Literal", value: 1e-308});
    validExpr({type: "Literal", value: /./i});
    validExpr({type: "Literal", value: new RegExp});
    validExpr({type: "Literal", value: true});
    validExpr({type: "Literal", value: false});
    invalidExpr(1, {type: "Literal"});
    invalidExpr(1, {type: "Literal", value: void 0});
    invalidExpr(1, {type: "Literal", value: new Date});
    invalidExpr(1, {type: "Literal", value: arguments});
    invalidExpr(1, {type: "Literal", value: {}});
    invalidExpr(1, {type: "Literal", value: []});
    invalidExpr(1, {type: "Literal", value: [0]});
    invalidExpr(1, {type: "Literal", value: ["x"]});
  });

  test("LogicalExpression", function() {
    validExpr({type: "LogicalExpression", operator: "||", left: EXPR, right: EXPR});
    validExpr({type: "LogicalExpression", operator: "&&", left: EXPR, right: EXPR});
    invalidExpr(3, {type: "LogicalExpression"});
    invalidExpr(1, {type: "LogicalExpression", left: EXPR, right: EXPR});
    invalidExpr(1, {type: "LogicalExpression", operator: "||", left: EXPR});
    invalidExpr(1, {type: "LogicalExpression", operator: "||", right: EXPR});
    invalidExpr(1, {type: "LogicalExpression", left: EXPR, right: EXPR});
    invalidExpr(2, {type: "LogicalExpression", operator: "||"});
    invalidExpr(2, {type: "LogicalExpression", left: EXPR});
    invalidExpr(2, {type: "LogicalExpression", right: EXPR});
    invalidExpr(1, {type: "LogicalExpression", operator: "=", left: EXPR, right: EXPR});
    invalidExpr(1, {type: "LogicalExpression", operator: "+", left: EXPR, right: EXPR});
    invalidExpr(1, {type: "LogicalExpression", operator: "||", left: STMT, right: EXPR});
    invalidExpr(1, {type: "LogicalExpression", operator: "||", left: EXPR, right: STMT});
  });

  test("MemberExpression", function() {
    validExpr({type: "MemberExpression", computed: true, object: EXPR, property: EXPR});
    validExpr({type: "MemberExpression", computed: true, object: EXPR, property: ID});
    validExpr({type: "MemberExpression", computed: true, object: EXPR, property: NUM});
    validExpr({type: "MemberExpression", computed: false, object: EXPR, property: ID});
    validExpr({type: "MemberExpression", object: EXPR, property: ID});
    invalidExpr(2, {type: "MemberExpression"});
    invalidExpr(1, {type: "MemberExpression", computed: true, object: EXPR});
    invalidExpr(1, {type: "MemberExpression", computed: true, property: EXPR});
    invalidExpr(1, {type: "MemberExpression", computed: false, object: EXPR, property: NUM});
    invalidExpr(1, {type: "MemberExpression", computed: true, object: STMT, property: EXPR});
    invalidExpr(1, {type: "MemberExpression", computed: false, object: STMT, property: ID});
    invalidExpr(1, {type: "MemberExpression", computed: true, object: EXPR, property: STMT});
    invalidExpr(1, {type: "MemberExpression", computed: false, object: EXPR, property: EXPR});
  });

  test("NewExpression", function() {
    validExpr({type: "NewExpression", callee: EXPR, arguments: []});
    validExpr({type: "NewExpression", callee: EXPR, arguments: [EXPR]});
    validExpr({type: "NewExpression", callee: EXPR, arguments: [EXPR, EXPR, EXPR]});
    invalidExpr(2, {type: "NewExpression"});
    invalidExpr(1, {type: "NewExpression", callee: EXPR});
    invalidExpr(1, {type: "NewExpression", arguments: []});
    invalidExpr(1, {type: "NewExpression", callee: EXPR, arguments: [null]});
    invalidExpr(1, {type: "NewExpression", callee: EXPR, arguments: [STMT]});
    invalidExpr(1, {type: "NewExpression", callee: EXPR, arguments: [EXPR, STMT, EXPR]});
  });

  test("ObjectExpression", function() {
    validExpr({type: "ObjectExpression", properties: []});
    validExpr({type: "ObjectExpression", properties: [{kind: "init", key: ID, value: EXPR}]});
    validExpr({type: "ObjectExpression", properties: [{kind: "init", key: NUM, value: EXPR}]});
    validExpr({type: "ObjectExpression", properties: [{kind: "init", key: STR, value: EXPR}]});
    validExpr({type: "ObjectExpression", properties: [{kind: "init", key: {type: "Identifier", name: "var"}, value: EXPR}]});
    invalidExpr(1, {type: "ObjectExpression"});
    invalidExpr(1, {type: "ObjectExpression", properties: [null]});
    invalidExpr(3, {type: "ObjectExpression", properties: [{}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{key: ID, value: EXPR}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "init", key: ID}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "-", key: ID, value: EXPR}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "init", value: EXPR}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "init", key: STMT, value: EXPR}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "init", key: ID, value: STMT}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "init", key: ID, value: BLOCK}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "init", key: EXPR, value: EXPR}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "init", key: {type: "Identifier", name: null}, value: EXPR}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "init", key: {type: "Identifier", name: ""}, value: EXPR}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "init", key: {type: "Identifier", name: "a-b"}, value: EXPR}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "init", key: {type: "Literal", value: null}, value: EXPR}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "init", key: {type: "Literal", value: /./}, value: EXPR}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "get", key: ID, value: null}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "set", key: ID, value: null}]});
  });

  test("Program", function() {
    function valid(x, msg) { assert.ok(esvalid.isValid(x), msg); }
    function invalid(x, msg) { assert.ok(!esvalid.isValid(x), msg); }
    invalid({type: "Program"});
    invalid({type: "Program", body: null});
    valid({type: "Program", body: []});
    valid({type: "Program", body: [STMT]});
    valid({type: "Program", body: [FD(STMT)]});
    valid({type: "Program", body: [STMT, STMT]});
    valid({type: "Program", body: [STMT, FD(STMT), STMT]});
    invalid({type: "Program", body: [STMT, EXPR, STMT]});
    invalid({type: "Program", body: [{type: "Node"}]});
  });

  test("ReturnStatement", function() {
    validExpr(FE({type: "ReturnStatement"}));
    validExpr(FE({type: "ReturnStatement", argument: null}));
    validExpr(FE({type: "ReturnStatement", argument: ID}));
    validExpr(FE({type: "ReturnStatement", argument: EXPR}));
    invalidExpr(1, FE({type: "ReturnStatement", argument: STMT}));
  });

  test("SequenceExpression", function() {
    invalidExpr(1, {type: "SequenceExpression"});
    invalidExpr(1, {type: "SequenceExpression", expressions: null});
    invalidExpr(1, {type: "SequenceExpression", expressions: [EXPR, STMT]});
    invalidExpr(1, {type: "SequenceExpression", expressions: [EXPR, null]});
    invalidExpr(2, {type: "SequenceExpression", expressions: [null, null]});
    validExpr({type: "SequenceExpression", expressions: [EXPR, EXPR]});
    validExpr({type: "SequenceExpression", expressions: [EXPR, EXPR, EXPR]});
    validExpr({type: "SequenceExpression", expressions: [EXPR, EXPR, EXPR, EXPR]});
  });

  test("SwitchCase", function() {
    function wrapSwitch(x) { return {type: "SwitchStatement", discriminant: EXPR, cases: [x]}; }
    validStmt(wrapSwitch({type: "SwitchCase", test: EXPR, consequent: []}));
    validStmt(wrapSwitch({type: "SwitchCase", consequent: []}));
    validStmt(wrapSwitch({type: "SwitchCase", test: EXPR, consequent: [STMT]}));
    validStmt(wrapSwitch({type: "SwitchCase", test: EXPR, consequent: [STMT, STMT, STMT]}));
    invalidStmt(1, wrapSwitch({type: "SwitchCase"}));
    invalidStmt(1, wrapSwitch({type: "SwitchCase", test: EXPR}));
    invalidStmt(1, wrapSwitch({type: "SwitchCase", test: STMT, consequent: []}));
    invalidStmt(1, wrapSwitch({type: "SwitchCase", test: EXPR, consequent: [null]}));
    invalidStmt(1, wrapSwitch({type: "SwitchCase", test: EXPR, consequent: [EXPR]}));
    invalidStmt(1, wrapSwitch({type: "SwitchCase", test: EXPR, consequent: [STMT, EXPR, STMT]}));
  });

  test("SwitchStatement", function() {
    validStmt({type: "SwitchStatement", discriminant: EXPR, cases: []});
    validStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: null, consequent: []}]});
    validStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: EXPR, consequent: []}]});
    validStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: null, consequent: [STMT]}]});
    validStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: EXPR, consequent: [STMT]}]});
    validStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: EXPR, consequent: [STMT]}, {type: "SwitchCase", test: null, consequent: [STMT]}]});
    invalidStmt(2, {type: "SwitchStatement"});
    invalidStmt(1, {type: "SwitchStatement", discriminant: EXPR});
    invalidStmt(1, {type: "SwitchStatement", discriminant: EXPR, cases: null});
    invalidStmt(1, {type: "SwitchStatement", discriminant: EXPR, cases: [null]});
    invalidStmt(1, {type: "SwitchStatement", discriminant: EXPR, cases: [ID]});
    invalidStmt(1, {type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: STMT, consequent: []}]});
    invalidStmt(1, {type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: EXPR, consequent: [EXPR]}]});
    invalidStmt(1, {type: "SwitchStatement", discriminant: STMT, cases: [{type: "SwitchCase", test: EXPR, consequent: [STMT]}]});
  });

  test("ThisExpression", function() {
    validExpr({type: "ThisExpression"});
  });

  test("ThrowStatement", function() {
    validStmt({type: "ThrowStatement", argument: ID});
    validStmt({type: "ThrowStatement", argument: EXPR});
    invalidStmt(1, {type: "ThrowStatement"});
    invalidStmt(1, {type: "ThrowStatement", argument: null});
    invalidStmt(1, {type: "ThrowStatement", argument: STMT});
  });

  test("TryStatement", function() {
    validStmt({type: "TryStatement", block: BLOCK, handler: CATCH});
    validStmt({type: "TryStatement", block: BLOCK, finalizer: BLOCK});
    validStmt({type: "TryStatement", block: BLOCK, handler: CATCH, finalizer: BLOCK});
    validStmt({type: "TryStatement", block: BLOCK, handlers: [CATCH]});
    validStmt({type: "TryStatement", block: BLOCK, handlers: [CATCH, CATCH]});
    validStmt({type: "TryStatement", block: BLOCK, finalizer: BLOCK});
    validStmt({type: "TryStatement", block: BLOCK, handler: CATCH, finalizer: BLOCK});
    invalidStmt(2, {type: "TryStatement"});
    invalidStmt(1, {type: "TryStatement", block: BLOCK});
    invalidStmt(1, {type: "TryStatement", handler: CATCH});
    invalidStmt(1, {type: "TryStatement", handlers: [CATCH]});
    invalidStmt(1, {type: "TryStatement", block: EXPR, handler: CATCH});
    invalidStmt(1, {type: "TryStatement", block: BLOCK, finalizer: EXPR});
    invalidStmt(1, {type: "TryStatement", block: BLOCK, handler: BLOCK});
    invalidStmt(1, {type: "TryStatement", block: BLOCK, handlers: []});
    invalidStmt(1, {type: "TryStatement", block: BLOCK, handlers: [CATCH, null, CATCH]});
    invalidStmt(1, {type: "TryStatement", block: BLOCK, handlers: [CATCH, BLOCK, CATCH]});
  });

  test("UnaryExpression", function() {
    validExpr({type: "UnaryExpression", operator: "+", argument: EXPR});
    validExpr({type: "UnaryExpression", operator: "!", argument: EXPR});
    invalidExpr(1, {type: "UnaryExpression", operator: "/", argument: EXPR});
    invalidExpr(1, {type: "UnaryExpression", operator: "+", argument: STMT});
    invalidExpr(1, {type: "UnaryExpression", operator: "+"});
    invalidExpr(1, {type: "UnaryExpression", argument: EXPR});
    invalidExpr(2, {type: "UnaryExpression"});
  });

  test("UpdateExpression", function() {
    validExpr({type: "UpdateExpression", operator: "++", argument: EXPR, prefix: true});
    validExpr({type: "UpdateExpression", operator: "++", argument: EXPR});
    validExpr({type: "UpdateExpression", operator: "--", argument: EXPR, prefix: false});
    invalidExpr(1, {type: "UpdateExpression", operator: "+", argument: EXPR, prefix: true});
    invalidExpr(1, {type: "UpdateExpression", operator: "++", argument: STMT});
    invalidExpr(1, {type: "UpdateExpression", operator: "++"});
    invalidExpr(1, {type: "UpdateExpression", argument: EXPR});
    invalidExpr(2, {type: "UpdateExpression"});
  });

  test("VariableDeclaration", function() {
    validStmt({type: "VariableDeclaration", kind: "var", declarations: [{type: "VariableDeclarator", id: ID}]});
    validStmt({type: "VariableDeclaration", kind: "var", declarations: [{type: "VariableDeclarator", id: ID, init: EXPR}]});
    validStmt({type: "VariableDeclaration", kind: "var", declarations: [{type: "VariableDeclarator", id: ID}, {type: "VariableDeclarator", id: ID}]});
    validStmt({type: "VariableDeclaration", kind: "let", declarations: [{type: "VariableDeclarator", id: ID}]});
    validStmt({type: "VariableDeclaration", kind: "const", declarations: [{type: "VariableDeclarator", id: ID}]});
    invalidStmt(1, {type: "VariableDeclaration"});
    invalidStmt(1, {type: "VariableDeclaration", declarations: null});
    invalidStmt(1, {type: "VariableDeclaration", kind: "var", declarations: null});
    invalidStmt(1, {type: "VariableDeclaration", kind: "var", declarations: [null]});
    invalidStmt(1, {type: "VariableDeclaration", kind: "var", declarations: [ID]});
    invalidStmt(1, {type: "VariableDeclaration", declarations: [{type: "VariableDeclarator", id: ID}]});
    invalidStmt(1, {type: "VariableDeclaration", kind: "ng", declarations: [{type: "VariableDeclarator", id: ID}]});
  });

  test("VariableDeclarator", function() {
    function wrapVar(x) { return {type: "VariableDeclaration", kind: "var", declarations: [x]}; }
    validStmt(wrapVar({type: "VariableDeclarator", id: ID, init: EXPR}));
    validStmt(wrapVar({type: "VariableDeclarator", id: EXPR, init: EXPR}));
    validStmt(wrapVar({type: "VariableDeclarator", id: ID}));
    invalidStmt(1, wrapVar({type: "VariableDeclarator"}));
    invalidStmt(1, wrapVar({type: "VariableDeclarator", init: EXPR}));
    invalidStmt(1, wrapVar({type: "VariableDeclarator", id: STMT, init: EXPR}));
    invalidStmt(1, wrapVar({type: "VariableDeclarator", id: ID, init: STMT}));
  });

  test("WhileStatement", function() {
    validStmt({type: "WhileStatement", test: EXPR, body: STMT});
    invalidStmt(2, {type: "WhileStatement"});
    invalidStmt(1, {type: "WhileStatement", test: EXPR});
    invalidStmt(1, {type: "WhileStatement", body: STMT});
    invalidStmt(1, {type: "WhileStatement", test: EXPR, body: EXPR});
    invalidStmt(1, {type: "WhileStatement", test: STMT, body: STMT});
  });

  test("WithStatement", function() {
    validStmt({type: "WithStatement", object: EXPR, body: STMT});
    invalidStmt(2, {type: "WithStatement"});
    invalidStmt(1, {type: "WithStatement", object: EXPR});
    invalidStmt(1, {type: "WithStatement", body: STMT});
    invalidStmt(1, {type: "WithStatement", object: STMT, body: STMT});
    invalidStmt(1, {type: "WithStatement", object: EXPR, body: EXPR});
  });

});
