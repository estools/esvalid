/* global suite test */
"use strict";

var assert = require("assert");

var esvalid = require("../");

var helpers = require("../test-helpers");
var STMT = helpers.STMT, BLOCK = helpers.BLOCK, EXPR = helpers.EXPR,
    NUM = helpers.NUM, STR = helpers.STR, ID = helpers.ID, CATCH = helpers.CATCH;
var wrapProgram = helpers.wrapProgram, wrapIter = helpers.wrapIter,
    FE = helpers.FE, FD = helpers.FD, label = helpers.label, exprStmt = helpers.exprStmt;
var validExpr = helpers.validExpr, invalidExpr = helpers.invalidExpr,
    validStmt = helpers.validStmt, invalidStmt = helpers.invalidStmt;

suite("unit", function() {

  test("non-nodes", function() {
    function invalid(x, msg) {
      assert.ok(!esvalid.isValid(x), msg);
      var errors = esvalid.errors(x);
      assert.notEqual(errors.length, 0, msg);
      invalidStmt(errors.length, x, msg);
      invalidExpr(errors.length, x, msg);
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

  test("BreakStatement", function() {
    validStmt(label(ID.name, wrapIter({type: "BreakStatement", label: ID})));
    validStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: null, consequent: [{type: "BreakStatement"}]}]});
    invalidStmt(1, wrapIter({type: "BreakStatement", label:ID}));
    invalidStmt(1, label(ID.name + ID.name, wrapIter({type: "BreakStatement", label: ID})));
    invalidStmt(1, {type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: null, consequent: [{type: "BreakStatement", label: ID}]}]});
  });

  test("ContinueStatement", function() {
    validStmt(label(ID.name, wrapIter({type: "ContinueStatement", label: ID})));
    invalidStmt(1, wrapIter({type: "ContinueStatement", label:ID}));
    invalidStmt(1, label(ID.name + ID.name, wrapIter({type: "ContinueStatement", label: ID})));
  });

  test("Identifier `name` member must be a valid IdentifierName", function() {
    validExpr({type: "Identifier", name: "x"});
    validExpr({type: "Identifier", name: "$"});
    validExpr({type: "Identifier", name: "_"});
    validExpr({type: "Identifier", name: "_$0x"});
    invalidExpr(1, {type: "Identifier", name: ""});
    invalidExpr(1, {type: "Identifier", name: "a-b"});
    invalidExpr(1, {type: "Identifier", name: "0x0"});
  });

  test("Identifier `name` member must not be a ReservedWord", function() {
    validExpr({type: "Identifier", name: "varx"});
    validExpr({type: "Identifier", name: "xvar"});
    validExpr({type: "Identifier", name: "varif"});
    validExpr({type: "Identifier", name: "if_var"});
    validExpr({type: "Identifier", name: "function0"});
    invalidExpr(1, {type: "Identifier", name: "if"});
    invalidExpr(1, {type: "Identifier", name: "var"});
    invalidExpr(1, {type: "Identifier", name: "function"});
  });

  test("IfStatement with null `alternate` must not be the `consequent` of an IfStatement with a non-null `alternate`", function() {
    validStmt({type: "IfStatement", test: EXPR, consequent: {type: "DoWhileStatement", test: EXPR, body: {type: "IfStatement", test: EXPR, consequent: STMT}}, alternate: STMT});
    invalidStmt(1, {type: "IfStatement", test: EXPR, consequent: {type: "IfStatement", test: EXPR, consequent: STMT}, alternate: STMT});
    invalidStmt(1, {type: "IfStatement", test: EXPR, consequent: {type: "IfStatement", test: EXPR, consequent: STMT, alternate: {type: "IfStatement", test: EXPR, consequent: STMT}}, alternate: STMT});
    invalidStmt(1, {type: "IfStatement", test: EXPR, consequent: {type: "IfStatement", test: EXPR, consequent: {type: "IfStatement", test: EXPR, consequent: STMT}}, alternate: STMT});
    invalidStmt(1, {type: "IfStatement", test: EXPR, consequent: {type: "LabeledStatement", label: ID, body: {type: "IfStatement", test: EXPR, consequent: STMT}}, alternate: STMT});
    invalidStmt(1, {type: "IfStatement", test: EXPR, consequent: {type: "WhileStatement", test: EXPR, body: {type: "IfStatement", test: EXPR, consequent: STMT}}, alternate: STMT});
    invalidStmt(1, {type: "IfStatement", test: EXPR, consequent: {type: "WithStatement", object: EXPR, body: {type: "IfStatement", test: EXPR, consequent: STMT}}, alternate: STMT});
    invalidStmt(1, {type: "IfStatement", test: EXPR, consequent: {type: "ForStatement", init: EXPR, test: EXPR, update: EXPR, body: {type: "IfStatement", test: EXPR, consequent: STMT}}, alternate: STMT});
    invalidStmt(1, {type: "IfStatement", test: EXPR, consequent: {type: "ForInStatement", left: EXPR, right: EXPR, body: {type: "IfStatement", test: EXPR, consequent: STMT}}, alternate: STMT});
  });

  test("LabeledStatement must not be nested within a LabeledStatement with the same label", function() {
    validStmt(label("a", label("b", STMT)));
    validStmt(label("y", exprStmt(FE(FD(label("a", STMT))))));
    invalidStmt(1, label("a", label("a", STMT)));
    invalidStmt(1, label("a", exprStmt(FE(label("a", STMT)))));
  });

  test("numeric Literal nodes must not be NaN", function() {
    invalidExpr(1, {type: "Literal", value: 0 / 0});
  });

  test("numeric Literal nodes must be non-negative", function() {
    validExpr({type: "Literal", value: 1 / 0});
    validExpr({type: "Literal", value: 1e308});
    validExpr({type: "Literal", value: 1});
    validExpr({type: "Literal", value: 1e-308});
    validExpr({type: "Literal", value: 0});
    invalidExpr(1, {type: "Literal", value: -0});
    invalidExpr(1, {type: "Literal", value: -1e-308});
    invalidExpr(1, {type: "Literal", value: -1});
    invalidExpr(1, {type: "Literal", value: -1e308});
    invalidExpr(1, {type: "Literal", value: -1 / 0});
  });

  test("static MemberExpression `property` member must have a valid IdentifierName `name` member", function() {
    validExpr({type: "MemberExpression", computed: false, object: EXPR, property: {type: "Identifier", name: "var"}});
    invalidExpr(1, {type: "MemberExpression", computed: false, object: EXPR, property: {type: "Identifier"}});
    invalidExpr(1, {type: "MemberExpression", computed: false, object: EXPR, property: {type: "Identifier", name: null}});
    invalidExpr(1, {type: "MemberExpression", computed: false, object: EXPR, property: {type: "Identifier", name: ""}});
    invalidExpr(1, {type: "MemberExpression", computed: false, object: EXPR, property: {type: "Identifier", name: "0"}});
    invalidExpr(1, {type: "MemberExpression", computed: false, object: EXPR, property: {type: "Identifier", name: "a-b"}});
  });

  test("ObjectExpression conflicting init/get/set properties", function() {
    var init = {kind: "init", key: ID, value: ID};
    var getter = {kind: "get", key: ID, value: {type: "FunctionExpression", params: [], body: BLOCK}};
    var setter = {kind: "set", key: ID, value: {type: "FunctionExpression", params: [ID], body: BLOCK}};
    validExpr({type: "ObjectExpression", properties: [init, init]});
    invalidExpr(1, {type: "ObjectExpression", properties: [init, getter]});
    invalidExpr(1, {type: "ObjectExpression", properties: [init, setter]});
    validExpr({type: "ObjectExpression", properties: [getter, setter]});
    invalidExpr(1, {type: "ObjectExpression", properties: [getter, init]});
    invalidExpr(1, {type: "ObjectExpression", properties: [getter, getter]});
    validExpr({type: "ObjectExpression", properties: [setter, getter]});
    invalidExpr(1, {type: "ObjectExpression", properties: [setter, init]});
    invalidExpr(1, {type: "ObjectExpression", properties: [setter, setter]});
  });

  test("ObjectExpression getter property `value` member must have zero parameters", function() {
    validExpr({type: "ObjectExpression", properties: [{kind: "get", key: ID, value: {type: "FunctionExpression", params: [], body: BLOCK}}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "get", key: ID, value: ID}]});
    invalidExpr(2, {type: "ObjectExpression", properties: [{kind: "get", key: ID, value: {type: "FunctionDeclaration", id: ID, params: [], body: BLOCK}}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "get", key: ID, value: {type: "FunctionExpression", params: [ID], body: BLOCK}}]});
  });

  test("ObjectExpression setter property `value` member must have exactly one parameter", function() {
    validExpr({type: "ObjectExpression", properties: [{kind: "set", key: ID, value: {type: "FunctionExpression", params: [ID], body: BLOCK}}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "set", key: ID, value: ID}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "set", key: ID, value: {type: "FunctionExpression", params: [], body: BLOCK}}]});
    invalidExpr(2, {type: "ObjectExpression", properties: [{kind: "set", key: ID, value: {type: "FunctionDeclaration", id: ID, params: [ID], body: BLOCK}}]});
    invalidExpr(1, {type: "ObjectExpression", properties: [{kind: "set", key: ID, value: {type: "FunctionExpression", params: [ID, ID], body: BLOCK}}]});
  });

  test("ReturnStatement must be nested within a FunctionExpression or FunctionDeclaration node", function() {
    validExpr(FE({type: "ReturnStatement"}));
    validStmt(FD({type: "ReturnStatement"}));
    invalidStmt(1, {type: "ReturnStatement"});
  });

  test("SequenceExpression `expressions` member length must be >= 2", function() {
    invalidExpr(1, {type: "SequenceExpression", expressions: []});
    invalidExpr(1, {type: "SequenceExpression", expressions: [EXPR]});
    validExpr({type: "SequenceExpression", expressions: [EXPR, EXPR]});
    validExpr({type: "SequenceExpression", expressions: [EXPR, EXPR, EXPR]});
    validExpr({type: "SequenceExpression", expressions: [EXPR, EXPR, EXPR, EXPR]});
  });

  test("SwitchStatement `cases` member must contain no more than one SwitchCase with a null `test` member", function() {
    validStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: null, consequent: [STMT]}]});
    invalidStmt(1, {type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: null, consequent: [STMT]}, {type: "SwitchCase", test: null, consequent: [STMT]}]});
  });

  test("TryStatement must have a non-null `handler` member or a non-null `finalizer` member", function() {
    validStmt({type: "TryStatement", block: BLOCK, handler: CATCH});
    validStmt({type: "TryStatement", block: BLOCK, finalizer: BLOCK});
    invalidStmt(1, {type: "TryStatement", block: BLOCK});
  });

  test("VariableDeclaration `declarations` member must be non-empty", function() {
    validStmt({type: "VariableDeclaration", kind: "var", declarations: [{type: "VariableDeclarator", id: ID}]});
    invalidStmt(1, {type: "VariableDeclaration", kind: "var", declarations: []});
  });

});
