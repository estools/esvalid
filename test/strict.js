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

suite("strict mode", function() {

  // wrap zero or more statements in a strict-mode function expression
  function strictFE() { return FE.apply(null, [exprStmt({type: "Literal", value: "use strict"})].concat([].slice.call(arguments))); }

  test("basic directive support", function() {
    validStmt(FD(exprStmt({type: "Literal", value: "use strict"})));
    validStmt(FD(exprStmt({type: "Literal", value: "directive"}), exprStmt({type: "Literal", value: "use strict"})));
    validStmt(exprStmt(FE(exprStmt({type: "Literal", value: "use strict"}))));
    validStmt(exprStmt(FE(exprStmt({type: "Literal", value: "directive"}), exprStmt({type: "Literal", value: "use strict"}))));
    validStmt(exprStmt({type: "Literal", value: "use strict"}));
    validExpr(FE(exprStmt({type: "Literal", value: "use strict"})));
  });

  test("FunctionDeclaration parameter names must be unique in strict mode", function() {
    validExpr(strictFE({type: "FunctionDeclaration", id: ID, params: [ID], body: BLOCK}));
    validExpr(strictFE({type: "FunctionDeclaration", id: ID, params: [{type: "Identifier", name: "a"}, {type: "Identifier", name: "A"}], body: BLOCK}));
    validStmt({type: "FunctionDeclaration", id: ID, params: [ID, ID], body: BLOCK});
    invalidExpr(1, strictFE({type: "FunctionDeclaration", id: ID, params: [ID, ID], body: BLOCK}));
  });

  test("FunctionExpression parameter names must be unique in strict mode", function() {
    validExpr(strictFE(exprStmt({type: "FunctionExpression", id: ID, params: [ID], body: BLOCK})));
    validExpr(strictFE(exprStmt({type: "FunctionExpression", id: ID, params: [{type: "Identifier", name: "a"}, {type: "Identifier", name: "A"}], body: BLOCK})));
    validExpr({type: "FunctionExpression", id: ID, params: [ID, ID], body: BLOCK});
    invalidExpr(1, strictFE(exprStmt({type: "FunctionExpression", id: ID, params: [ID, ID], body: BLOCK})));
  });

  test("Identifier FutureReservedWords", function() {
    validExpr({type: "Identifier", name: "let"});
    validExpr({type: "Identifier", name: "yield"}); // ES5 only
    invalidExpr(1, strictFE(exprStmt({type: "Identifier", name: "let"})));
    invalidExpr(1, strictFE(exprStmt({type: "Identifier", name: "yield"})));
  });

  test("ObjectExpression duplicate keys", function() {
    validExpr({type: "ObjectExpression", properties: [{kind: "init", key: {type: "Literal", value: "a"}, value: EXPR}, {kind: "init", key: {type: "Literal", value: "a"}, value: EXPR}]});
    validExpr({type: "ObjectExpression", properties: [{kind: "init", key: {type: "Literal", value: "__proto__"}, value: EXPR}, {kind: "init", key: {type: "Literal", value: "a"}, value: EXPR}]});
    validExpr(strictFE(exprStmt({type: "ObjectExpression", properties: [{kind: "init", key: {type: "Literal", value: "hasOwnProperty"}, value: EXPR}, {kind: "init", key: {type: "Literal", value: "a"}, value: EXPR}]})));
    invalidExpr(1, strictFE(exprStmt({type: "ObjectExpression", properties: [{kind: "init", key: {type: "Literal", value: "a"}, value: EXPR}, {kind: "init", key: {type: "Literal", value: "a"}, value: EXPR}]})));
    invalidExpr(1, strictFE(exprStmt({type: "ObjectExpression", properties: [{kind: "init", key: {type: "Literal", value: "a"}, value: EXPR}, {kind: "init", key: {type: "Identifier", name: "a"}, value: EXPR}]})));
    invalidExpr(1, strictFE(exprStmt({type: "ObjectExpression", properties: [{kind: "init", key: {type: "Literal", value: "0"}, value: EXPR}, {kind: "init", key: {type: "Literal", value: 0}, value: EXPR}]})));
  });

  test("UnaryExpression delete with unqualified identifier", function() {
    validExpr({type: "UnaryExpression", operator: "delete", argument: NUM});
    validExpr({type: "UnaryExpression", operator: "delete", argument: ID});
    validExpr(strictFE(exprStmt({type: "UnaryExpression", operator: "delete", argument: NUM})));
    invalidExpr(1, strictFE(exprStmt({type: "UnaryExpression", operator: "delete", argument: ID})));
  });

  test("WithStatement not allowed", function() {
    validStmt({type: "WithStatement", object: EXPR, body: STMT});
    invalidExpr(1, strictFE({type: "WithStatement", object: EXPR, body: STMT}));
  });

});
