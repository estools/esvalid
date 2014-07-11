/* global suite test */
"use strict";
var assert = require("assert");

var esvalid = require("..");


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
// wrap a statement in a function expression
function FE(n) { return {type: "FunctionExpression", params: [], body: {type: "BlockStatement", body: [n]}}; }
// wrap a statement in a function declaration
function FD(n) { return {type: "FunctionDeclaration", id: ID, params: [], body: {type: "BlockStatement", body: [n]}}; }
// wrap a statement in an iteration statement
function label(l, n) { return {type: "LabeledStatement", label: {type: "Identifier", name: l}, body: n}; }


function validStmt(x, msg) { assert.ok(esvalid.isValid(wrapProgram(x)), msg); }
function invalidStmt(x, msg) { assert.ok(!esvalid.isValid(wrapProgram(x)), msg); }
function validExpr(x, msg) { assert.ok(esvalid.isValidExpression(x), msg); }
function invalidExpr(x, msg) { assert.ok(!esvalid.isValidExpression(x), msg); }


suite("unit", function(){

  test("non-nodes", function() {
    function invalid(x, msg) {
      assert.ok(!esvalid.isValid(x), msg);
      invalidStmt(x, msg);
      invalidExpr(x, msg);
    }
    invalid(null);
    invalid(0);
    invalid({});
    invalid("Program");
    invalid({type: null});
    invalid({type: false});
    invalid({type: ""});
    invalid({type: "Node"});
  });

  test("Node", function() {
    invalidStmt({type: "EmptyStatement", loc: {}});
    invalidStmt({type: "EmptyStatement", loc: {start: null, end: 0}});
    invalidStmt({type: "EmptyStatement", loc: {start: {}, end: {}}});
    invalidStmt({type: "EmptyStatement", loc: {start: {line: "a", column: "b"}, end: {line: "a", column: "b"}}});
    invalidStmt({type: "EmptyStatement", loc: {start: {line: 0, column: 0}, end: {line: 1, column: 0}}});
    invalidStmt({type: "EmptyStatement", loc: {start: {line: 1, column: 0}, end: {line: 0, column: 0}}});
    invalidStmt({type: "EmptyStatement", loc: {start: {line: 1, column: -1}, end: {line: 1, column: 0}}});
    invalidStmt({type: "EmptyStatement", loc: {start: {line: 1, column: 0}, end: {line: 1, column: -1}}});
    invalidStmt({type: "EmptyStatement", loc: {source: 0, start: {line: 1, column: 0}, end: {line: 1, column: 0}}});
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
    invalidExpr({type: "ArrayExpression"});
    invalidExpr({type: "ArrayExpression", elements: [STMT]});
  });

  test("AssignmentExpression", function() {
    validExpr({type: "AssignmentExpression", operator: "=", left: EXPR, right: EXPR});
    validExpr({type: "AssignmentExpression", operator: "+=", left: EXPR, right: EXPR});
    invalidExpr({type: "AssignmentExpression", operator: "||=", left: EXPR, right: EXPR});
    invalidExpr({type: "AssignmentExpression"});
    invalidExpr({type: "AssignmentExpression", left: EXPR, right: EXPR});
    invalidExpr({type: "AssignmentExpression", operator: "=", left: EXPR});
    invalidExpr({type: "AssignmentExpression", operator: "=", right: EXPR});
    invalidExpr({type: "AssignmentExpression", left: EXPR, right: EXPR});
    invalidExpr({type: "AssignmentExpression", operator: "="});
    invalidExpr({type: "AssignmentExpression", left: EXPR});
    invalidExpr({type: "AssignmentExpression", right: EXPR});
    invalidExpr({type: "AssignmentExpression", left: STMT, right: EXPR});
    invalidExpr({type: "AssignmentExpression", left: EXPR, right: STMT});
  });

  test("BinaryExpression", function() {
    validExpr({type: "BinaryExpression", operator: "+", left: EXPR, right: EXPR});
    validExpr({type: "BinaryExpression", operator: "&", left: EXPR, right: EXPR});
    invalidExpr({type: "BinaryExpression", operator: "=", left: EXPR, right: EXPR});
    invalidExpr({type: "BinaryExpression", operator: "||", left: EXPR, right: EXPR});
    invalidExpr({type: "BinaryExpression"});
    invalidExpr({type: "BinaryExpression", left: EXPR, right: EXPR});
    invalidExpr({type: "BinaryExpression", operator: "+", left: EXPR});
    invalidExpr({type: "BinaryExpression", operator: "+", right: EXPR});
    invalidExpr({type: "BinaryExpression", left: EXPR, right: EXPR});
    invalidExpr({type: "BinaryExpression", operator: "+"});
    invalidExpr({type: "BinaryExpression", left: EXPR});
    invalidExpr({type: "BinaryExpression", right: EXPR});
    invalidExpr({type: "BinaryExpression", left: STMT, right: EXPR});
    invalidExpr({type: "BinaryExpression", left: EXPR, right: STMT});
  });

  test("Blocktatement", function() {
    validStmt({type: "BlockStatement", body: []});
    validStmt({type: "BlockStatement", body: [STMT]});
    validStmt({type: "BlockStatement", body: [STMT, STMT]});
    invalidStmt({type: "BlockStatement"});
    invalidStmt({type: "BlockStatement", body: null});
    invalidStmt({type: "BlockStatement", body: [null]});
    invalidStmt({type: "BlockStatement", body: [EXPR]});
    invalidStmt({type: "BlockStatement", body: [FD(STMT)]});
  });

  test("BreakStatement", function() {
    validStmt(wrapIter({type: "BreakStatement"}));
    validStmt(wrapIter({type: "BreakStatement", label: null}));
    validStmt(label(ID.name, wrapIter({type: "BreakStatement", label: ID})));
    validStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: null, consequent: [{type: "BreakStatement"}]}]});
    invalidStmt({type: "BreakStatement"});
    invalidStmt(wrapIter({type: "BreakStatement", label: STMT}));
    invalidStmt(label(ID.name + ID.name, wrapIter({type: "BreakStatement", label: ID})));
  });

  // TODO: CallExpression

  // TODO: CatchClause

  test("ConditionalExpression", function() {
    validExpr({type: "ConditionalExpression", test: EXPR, alternate: EXPR, consequent: EXPR});
    invalidExpr({type: "ConditionalExpression"});
    invalidExpr({type: "ConditionalExpression", alternate: EXPR, consequent: EXPR});
    invalidExpr({type: "ConditionalExpression", test: EXPR, consequent: EXPR});
    invalidExpr({type: "ConditionalExpression", test: EXPR, alternate: EXPR});
    invalidExpr({type: "ConditionalExpression", test: STMT, alternate: EXPR, consequent: EXPR});
    invalidExpr({type: "ConditionalExpression", test: EXPR, alternate: STMT, consequent: EXPR});
    invalidExpr({type: "ConditionalExpression", test: EXPR, alternate: EXPR, consequent: STMT});
    invalidExpr({type: "ConditionalExpression", test: null, alternate: EXPR, consequent: EXPR});
    invalidExpr({type: "ConditionalExpression", test: EXPR, alternate: null, consequent: EXPR});
    invalidExpr({type: "ConditionalExpression", test: EXPR, alternate: EXPR, consequent: null});
  });

  test("ContinueStatement", function() {
    validStmt(wrapIter({type: "ContinueStatement"}));
    validStmt(wrapIter({type: "ContinueStatement", label: null}));
    validStmt(label(ID.name, wrapIter({type: "ContinueStatement", label: ID})));
    invalidStmt({type: "ContinueStatement"});
    invalidStmt(wrapIter({type: "ContinueStatement", label: STMT}));
    invalidStmt(label(ID.name + ID.name, wrapIter({type: "ContinueStatement", label: ID})));
    invalidStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: null, consequent: [{type: "ContinueStatement"}]}]});
  });

  test("DebuggerStatement", function() {
    validStmt({type: "DebuggerStatement"});
  });

  // TODO: DoWhileStatement

  test("EmptyStatement", function() {
    validStmt({type: "EmptyStatement"});
  });

  test("ExpressionStatement", function() {
    validStmt({type: "ExpressionStatement", expression: EXPR});
    invalidStmt({type: "ExpressionStatement"});
    invalidStmt({type: "ExpressionStatement", expression: STMT});
    invalidStmt({type: "ExpressionStatement", expression: FD(STMT)});
  });

  // TODO: ForInStatement

  // TODO: ForStatement

  test("FunctionDeclaration", function() {
    validStmt({type: "FunctionDeclaration", id: ID, params: [], body: BLOCK});
    validStmt({type: "FunctionDeclaration", id: ID, params: [ID, ID], body: BLOCK});
    validStmt({type: "FunctionDeclaration", id: ID, params: [], body: {type: "BlockStatement", body: [FD(STMT)]}});
    invalidStmt({type: "FunctionDeclaration"});
    invalidStmt({type: "FunctionDeclaration", params: [], body: BLOCK});
    invalidStmt({type: "FunctionDeclaration", id: null, params: [], body: BLOCK});
    invalidStmt({type: "FunctionDeclaration", id: ID, params: []});
    invalidStmt({type: "FunctionDeclaration", id: STMT, params: [], body: BLOCK});
    invalidStmt({type: "FunctionDeclaration", id: ID, body: BLOCK});
    invalidStmt({type: "FunctionDeclaration", id: ID, params: [null], body: BLOCK});
    invalidStmt({type: "FunctionDeclaration", id: ID, params: [STMT], body: BLOCK});
  });

  test("FunctionExpression", function() {
    validExpr({type: "FunctionExpression", params: [], body: BLOCK});
    validExpr({type: "FunctionExpression", id: null, params: [], body: BLOCK});
    validExpr({type: "FunctionExpression", id: ID, params: [], body: BLOCK});
    validExpr({type: "FunctionExpression", id: ID, params: [ID, ID], body: BLOCK});
    validExpr({type: "FunctionExpression", params: [], body: {type: "BlockStatement", body: [FD(STMT)]}});
    invalidExpr({type: "FunctionExpression"});
    invalidExpr({type: "FunctionExpression", params: []});
    invalidExpr({type: "FunctionExpression", body: BLOCK});
    invalidExpr({type: "FunctionExpression", params: [null], body: BLOCK});
    invalidExpr({type: "FunctionExpression", id: STMT, params: [], body: BLOCK});
    invalidExpr({type: "FunctionExpression", id: ID, params: [STMT], body: BLOCK});
  });

  test("Identifier", function() {
    validExpr({type: "Identifier", name: "x"});
    validExpr({type: "Identifier", name: "varx"});
    validExpr({type: "Identifier", name: "xvar"});
    invalidExpr({type: "Identifier"});
    invalidExpr({type: "Identifier", name: null});
    invalidExpr({type: "Identifier", name: ""});
    invalidExpr({type: "Identifier", name: "var"});
    invalidExpr({type: "Identifier", name: "implements"});
    invalidExpr({type: "Identifier", name: "let"});
    invalidExpr({type: "Identifier", name: "yield"});
  });

  test("IfStatement", function() {
    validStmt({type: "IfStatement", test: EXPR, consequent: STMT});
    validStmt({type: "IfStatement", test: EXPR, consequent: BLOCK});
    validStmt({type: "IfStatement", test: EXPR, consequent: STMT, alternate: STMT});
    validStmt({type: "IfStatement", test: EXPR, consequent: BLOCK, alternate: BLOCK});
    validStmt({type: "IfStatement", test: EXPR, consequent: STMT, alternate: BLOCK});
    validStmt({type: "IfStatement", test: EXPR, consequent: BLOCK, alternate: STMT});
    invalidStmt({type: "IfStatement"});
    invalidStmt({type: "IfStatement", test: EXPR});
    invalidStmt({type: "IfStatement", test: STMT, consequent: STMT});
    invalidStmt({type: "IfStatement", test: EXPR, consequent: EXPR});
    invalidStmt({type: "IfStatement", test: EXPR, alternate: STMT});
    invalidStmt({type: "IfStatement", test: EXPR, consequent: STMT, alternate: EXPR});
    invalidStmt({type: "IfStatement", test: EXPR, consequent: {type: "IfStatement", test: EXPR, consequent: STMT}, alternate: STMT});
    invalidStmt({type: "IfStatement", test: EXPR, consequent: {type: "IfStatement", test: EXPR, consequent: STMT, alternate: {type: "IfStatement", test: EXPR, consequent: STMT}}, alternate: STMT});
    invalidStmt({type: "IfStatement", test: EXPR, consequent: {type: "IfStatement", test: EXPR, consequent: {type: "IfStatement", test: EXPR, consequent: STMT}}, alternate: STMT});
  });


  test("LabeledStatement", function() {
    validStmt({type: "LabeledStatement", label: ID, body: STMT});
    validStmt(label("a", label("b", STMT)));
    validStmt(label("y", {type: "ExpressionStatement", expression: FE(FD(label("a", STMT)))}));
    invalidStmt({type: "LabeledStatement"});
    invalidStmt({type: "LabeledStatement", label: null, body: STMT});
    invalidStmt({type: "LabeledStatement", label: 0, body: STMT});
    invalidStmt({type: "LabeledStatement", label: ID, body: null});
    invalidStmt({type: "LabeledStatement", label: ID, body: false});
    invalidStmt(label("a", label("a", STMT)));
    invalidStmt(label("a", FE(label("a", STMT))));
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
    invalidExpr({type: "Literal"});
    invalidExpr({type: "Literal", value: void 0});
    invalidExpr({type: "Literal", value: -0});
    invalidExpr({type: "Literal", value: -1});
    invalidExpr({type: "Literal", value: -1e308});
    invalidExpr({type: "Literal", value: -1e-308});
    invalidExpr({type: "Literal", value: 1 / 0});
    invalidExpr({type: "Literal", value: -1 / 0});
    invalidExpr({type: "Literal", value: 0 / 0});
    invalidExpr({type: "Literal", value: new Date});
    invalidExpr({type: "Literal", value: arguments});
    invalidExpr({type: "Literal", value: {}});
    invalidExpr({type: "Literal", value: []});
    invalidExpr({type: "Literal", value: [0]});
    invalidExpr({type: "Literal", value: ["x"]});
  });

  test("LogicalExpression", function() {
    validExpr({type: "LogicalExpression", operator: "||", left: EXPR, right: EXPR});
    validExpr({type: "LogicalExpression", operator: "&&", left: EXPR, right: EXPR});
    invalidExpr({type: "LogicalExpression", operator: "=", left: EXPR, right: EXPR});
    invalidExpr({type: "LogicalExpression", operator: "+", left: EXPR, right: EXPR});
    invalidExpr({type: "LogicalExpression"});
    invalidExpr({type: "LogicalExpression", left: EXPR, right: EXPR});
    invalidExpr({type: "LogicalExpression", operator: "||", left: EXPR});
    invalidExpr({type: "LogicalExpression", operator: "||", right: EXPR});
    invalidExpr({type: "LogicalExpression", left: EXPR, right: EXPR});
    invalidExpr({type: "LogicalExpression", operator: "||"});
    invalidExpr({type: "LogicalExpression", left: EXPR});
    invalidExpr({type: "LogicalExpression", right: EXPR});
    invalidExpr({type: "LogicalExpression", left: STMT, right: EXPR});
    invalidExpr({type: "LogicalExpression", left: EXPR, right: STMT});
  });

  test("MemberExpression", function() {
    validExpr({type: "MemberExpression", computed: true, object: EXPR, property: EXPR});
    validExpr({type: "MemberExpression", computed: true, object: EXPR, property: ID});
    validExpr({type: "MemberExpression", computed: true, object: EXPR, property: NUM});
    validExpr({type: "MemberExpression", computed: false, object: EXPR, property: ID});
    validExpr({type: "MemberExpression", object: EXPR, property: ID});
    validExpr({type: "MemberExpression", computed: false, object: EXPR, property: {type: "Identifier", name: "var"}});
    invalidExpr({type: "MemberExpression"});
    invalidExpr({type: "MemberExpression", computed: true, object: EXPR});
    invalidExpr({type: "MemberExpression", computed: true, property: EXPR});
    invalidExpr({type: "MemberExpression", computed: false, object: EXPR, property: NUM});
    invalidExpr({type: "MemberExpression", computed: true, object: STMT, property: EXPR});
    invalidExpr({type: "MemberExpression", computed: false, object: STMT, property: ID});
    invalidExpr({type: "MemberExpression", computed: true, object: EXPR, property: STMT});
    invalidExpr({type: "MemberExpression", computed: false, object: EXPR, property: EXPR});
    invalidExpr({type: "MemberExpression", computed: false, object: EXPR, property: {type: "Identifier"}});
    invalidExpr({type: "MemberExpression", computed: false, object: EXPR, property: {type: "Identifier", name: null}});
    invalidExpr({type: "MemberExpression", computed: false, object: EXPR, property: {type: "Identifier", name: ""}});
  });

  // TODO: NewExpression

  test("ObjectExpression", function() {
    validExpr({type: "ObjectExpression", properties: []});
    validExpr({type: "ObjectExpression", properties: [{kind: "init", key: ID, value: EXPR}]});
    validExpr({type: "ObjectExpression", properties: [{kind: "get", key: ID, value: EXPR}]});
    validExpr({type: "ObjectExpression", properties: [{kind: "set", key: ID, value: EXPR}]});
    validExpr({type: "ObjectExpression", properties: [{kind: "init", key: NUM, value: EXPR}]});
    validExpr({type: "ObjectExpression", properties: [{kind: "init", key: STR, value: EXPR}]});
    validExpr({type: "ObjectExpression", properties: [{kind: "init", key: {type: "Identifier", name: "var"}, value: EXPR}]});
    invalidExpr({type: "ObjectExpression"});
    invalidExpr({type: "ObjectExpression", properties: [null]});
    invalidExpr({type: "ObjectExpression", properties: [{key: ID, value: EXPR}]});
    invalidExpr({type: "ObjectExpression", properties: [{kind: "-", key: ID, value: EXPR}]});
    invalidExpr({type: "ObjectExpression", properties: [{kind: "init", value: EXPR}]});
    invalidExpr({type: "ObjectExpression", properties: [{kind: "init", key: STMT, value: EXPR}]});
    invalidExpr({type: "ObjectExpression", properties: [{kind: "init", key: ID, value: STMT}]});
    invalidExpr({type: "ObjectExpression", properties: [{kind: "init", key: ID, value: BLOCK}]});
    invalidExpr({type: "ObjectExpression", properties: [{kind: "init", key: EXPR, value: EXPR}]});
    invalidExpr({type: "ObjectExpression", properties: [{kind: "init", key: {type: "Identifier", name: null}, value: EXPR}]});
    invalidExpr({type: "ObjectExpression", properties: [{kind: "init", key: {type: "Identifier", name: ""}, value: EXPR}]});
    invalidExpr({type: "ObjectExpression", properties: [{kind: "init", key: {type: "Identifier", name: "a-b"}, value: EXPR}]});
    invalidExpr({type: "ObjectExpression", properties: [{kind: "init", key: {type: "Literal", value: null}, value: EXPR}]});
    invalidExpr({type: "ObjectExpression", properties: [{kind: "init", key: {type: "Literal", value: /./}, value: EXPR}]});
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
    invalidStmt({type: "ReturnStatement"});
    invalidStmt({type: "ReturnStatement", argument: EXPR});
    invalidExpr(FE({type: "ReturnStatement", argument: STMT}));
  });

  test("SequenceExpression", function() {
    invalidExpr({type: "SequenceExpression"});
    invalidExpr({type: "SequenceExpression", expressions: null});
    invalidExpr({type: "SequenceExpression", expressions: []});
    invalidExpr({type: "SequenceExpression", expressions: [EXPR]});
    invalidExpr({type: "SequenceExpression", expressions: [EXPR, STMT]});
    invalidExpr({type: "SequenceExpression", expressions: [EXPR, null]});
    validExpr({type: "SequenceExpression", expressions: [EXPR, EXPR]});
  });

  // TODO: SwitchCase

  test("SwitchStatement", function() {
    validStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: null, consequent: [STMT]}]});
    validStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: EXPR, consequent: [STMT]}, {type: "SwitchCase", test: null, consequent: [STMT]}]});
    validStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: EXPR, consequent: []}]});
    validStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: EXPR, consequent: [STMT]}]});
    invalidStmt({type: "SwitchStatement"});
    invalidStmt({type: "SwitchStatement", discriminant: EXPR});
    invalidStmt({type: "SwitchStatement", discriminant: EXPR, cases: null});
    invalidStmt({type: "SwitchStatement", discriminant: EXPR, cases: []});
    invalidStmt({type: "SwitchStatement", discriminant: EXPR, cases: [null]});
    invalidStmt({type: "SwitchStatement", discriminant: EXPR, cases: [ID]});
    invalidStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: STMT, consequent: []}]});
    invalidStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: EXPR, consequent: [EXPR]}]});
    invalidStmt({type: "SwitchStatement", discriminant: STMT, cases: [{type: "SwitchCase", test: EXPR, consequent: [STMT]}]});
    invalidStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: null, consequent: [STMT]}, {type: "SwitchCase", test: null, consequent: [STMT]}]});
  });

  test("ThisExpression", function() {
    validExpr({type: "ThisExpression"});
  });

  test("ThrowStatement", function() {
    validStmt({type: "ThrowStatement", argument: ID});
    validStmt({type: "ThrowStatement", argument: EXPR});
    invalidStmt({type: "ThrowStatement"});
    invalidStmt({type: "ThrowStatement", argument: null});
    invalidStmt({type: "ThrowStatement", argument: STMT});
  });

  test("TryStatement", function() {
    invalidStmt({type: "TryStatement"});
    invalidStmt({type: "TryStatement", block: BLOCK});
    invalidStmt({type: "TryStatement", handler: CATCH});
    invalidStmt({type: "TryStatement", handlers: [CATCH]});
    invalidStmt({type: "TryStatement", block: EXPR, handler: CATCH});
    invalidStmt({type: "TryStatement", block: BLOCK, finalizer: EXPR});
    invalidStmt({type: "TryStatement", block: BLOCK, handler: BLOCK});
    invalidStmt({type: "TryStatement", block: BLOCK, handlers: []});
    invalidStmt({type: "TryStatement", block: BLOCK, handlers: [CATCH, null, CATCH]});
    invalidStmt({type: "TryStatement", block: BLOCK, handlers: [CATCH, BLOCK, CATCH]});
    validStmt({type: "TryStatement", block: BLOCK, handler: CATCH});
    validStmt({type: "TryStatement", block: BLOCK, finalizer: BLOCK});
    validStmt({type: "TryStatement", block: BLOCK, handler: CATCH, finalizer: BLOCK});
    validStmt({type: "TryStatement", block: BLOCK, handlers: [CATCH]});
    validStmt({type: "TryStatement", block: BLOCK, handlers: [CATCH, CATCH]});
    validStmt({type: "TryStatement", block: BLOCK, finalizer: BLOCK});
    validStmt({type: "TryStatement", block: BLOCK, handler: CATCH, finalizer: BLOCK});
  });

  test("UnaryExpression", function() {
    validExpr({type: "UnaryExpression", operator: "+", argument: EXPR});
    validExpr({type: "UnaryExpression", operator: "!", argument: EXPR});
    invalidExpr({type: "UnaryExpression", operator: "/", argument: EXPR});
    invalidExpr({type: "UnaryExpression", operator: "+", argument: STMT});
    invalidExpr({type: "UnaryExpression", operator: "+"});
    invalidExpr({type: "UnaryExpression", argument: EXPR});
    invalidExpr({type: "UnaryExpression"});
  });

  test("UpdateExpression", function() {
    validExpr({type: "UpdateExpression", operator: "++", argument: EXPR, prefix: true});
    validExpr({type: "UpdateExpression", operator: "++", argument: EXPR});
    validExpr({type: "UpdateExpression", operator: "--", argument: EXPR, prefix: false});
    invalidExpr({type: "UpdateExpression", operator: "+", argument: EXPR, prefix: true});
    invalidExpr({type: "UpdateExpression", operator: "++", argument: STMT});
    invalidExpr({type: "UpdateExpression", operator: "++"});
    invalidExpr({type: "UpdateExpression", argument: EXPR});
    invalidExpr({type: "UpdateExpression"});
  });

  test("VariableDeclaration", function() {
    invalidStmt({type: "VariableDeclaration"});
    invalidStmt({type: "VariableDeclaration", declarations: null});
    invalidStmt({type: "VariableDeclaration", declarations: []});
    invalidStmt({type: "VariableDeclaration", declarations: [null]});
    invalidStmt({type: "VariableDeclaration", declarations: [ID]});
    validStmt({type: "VariableDeclaration", declarations: [{type: "VariableDeclarator", id: ID}]});
    validStmt({type: "VariableDeclaration", declarations: [{type: "VariableDeclarator", id: ID, init: EXPR}]});
    validStmt({type: "VariableDeclaration", declarations: [{type: "VariableDeclarator", id: ID}, {type: "VariableDeclarator", id: ID}]});
  });

  // TODO: VariableDeclarator

  // TODO: WhileStatement

  test("WithStatement", function() {
    validStmt({type: "WithStatement", object: EXPR, body: STMT});
    invalidStmt({type: "WithStatement"});
    invalidStmt({type: "WithStatement", object: EXPR});
    invalidStmt({type: "WithStatement", body: STMT});
    invalidStmt({type: "WithStatement", object: STMT, body: STMT});
    invalidStmt({type: "WithStatement", object: EXPR, body: EXPR});
  });

});
