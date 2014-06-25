"use strict";
var esutils = require("esutils");

var isIdentifierName = esutils.keyword.isIdentifierName;

// isReservedWord :: String -> Boolean
function isReservedWord(id) {
  return id === "null" || id === "true" || id === "false" ||
    esutils.keyword.isKeywordES6(id, true);
}

// getClass :: Object -> String
function getClass(obj) {
  return {}.toString.call(obj).slice(8, -1);
}

// all :: forall a. [a] -> (a -> Boolean) -> Boolean
function all(predicate, xs) {
  if (xs == null) return false;
  for (var i = 0, l = xs.length; i < l; ++i) {
    if (!predicate(xs[i])) return false;
  }
  return true;
}

var EXPRESSIONS = [
  "ArrayExpression",
  "AssignmentExpression",
  "BinaryExpression",
  "CallExpression",
  "ConditionalExpression",
  "FunctionExpression",
  "Identifier",
  "Literal",
  "LogicalExpression",
  "MemberExpression",
  "NewExpression",
  "ObjectExpression",
  "SequenceExpression",
  "ThisExpression",
  "UnaryExpression",
  "UpdateExpression"
];
var ITERATION_STATEMENTS = [
  "DoWhileStatement",
  "ForInStatement",
  "ForStatement",
  "WhileStatement"
];
var STATEMENTS = [
  "BlockStatement",
  "BreakStatement",
  "ContinueStatement",
  "DebuggerStatement",
  "DoWhileStatement",
  "EmptyStatement",
  "ExpressionStatement",
  "ForInStatement",
  "ForStatement",
  "IfStatement",
  "LabeledStatement",
  "ReturnStatement",
  "SwitchStatement",
  "ThrowStatement",
  "TryStatement",
  "VariableDeclaration",
  "WhileStatement",
  "WithStatement"
];

// isExpression :: Node -> Boolean
function isExpression(node) {
  return node != null && EXPRESSIONS.indexOf(node.type) >= 0;
}

function isIterationStatement(node) {
  return node != null && ITERATION_STATEMENTS.indexOf(node.type) >= 0;
}

// isStatement :: Node -> Boolean
function isStatement(node) {
  return node != null && STATEMENTS.indexOf(node.type) >= 0;
}

// isSourceElement :: Node -> Boolean
function isSourceElement(node) {
  return isStatement(node) || node.type === "FunctionDeclaration";
}

// isValidObjectProperty :: Node -> Boolean
function isValidObjectProperty(node) {
  if (node == null || !isValid(node.value) || ["init", "get", "set"].indexOf(node.kind) < 0)
    return false;
  switch (node.key.type) {
    case "Identifier":
      return isIdentifierName(node.key.name);
    case "Literal":
      return ["Number", "String"].indexOf(getClass(node.key.value)) >= 0;
  }
  return false;
}


var ASSIGNMENT_OPERATORS = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "|=", "^=", "&="];
var BINARY_OPERATORS = ["==", "!=", "===", "!==", "<", "<=", ">", ">=", "<<", ">>", ">>>", "+", "-", "*", "/", "%", "|", "^", "&", "in", "instanceof"];
var LOGICAL_OPERATORS = ["||", "&&"];
var UNARY_OPERATORS = ["-", "+", "!", "~", "typeof", "void", "delete"];
var UPDATE_OPERATORS = ["++", "--"];

// isAssignmentOperator :: String -> Boolean
function isAssignmentOperator(op) {
  return ASSIGNMENT_OPERATORS.indexOf(op) >= 0;
}

// isBinaryOperator :: String -> Boolean
function isBinaryOperator(op) {
  return BINARY_OPERATORS.indexOf(op) >= 0;
}

// isLogicalOperator :: String -> Boolean
function isLogicalOperator(op) {
  return LOGICAL_OPERATORS.indexOf(op) >= 0;
}

// isUnaryOperator :: String -> Boolean
function isUnaryOperator(op) {
  return UNARY_OPERATORS.indexOf(op) >= 0;
}

// isUpdateOperator :: String -> Boolean
function isUpdateOperator(op) {
  return UPDATE_OPERATORS.indexOf(op) >= 0;
}


// isValid :: Node -> Boolean
function isValid(node) {
  if (node == null || !node.type) return false;

  if (node.loc != null &&
    (node.loc.source != null && typeof node.loc.source != "string" ||
      node.loc.start == null ||
      typeof node.loc.start.line != "number" || node.loc.start.line < 1 ||
      typeof node.loc.start.column != "number" || node.loc.start.column < 0 ||
      node.loc.end == null ||
      typeof node.loc.end.line != "number" || node.loc.end.line < 1 ||
      typeof node.loc.end.column != "number" || node.loc.end.column < 0
    )) return false;

  switch (node.type) {

    case "ArrayExpression":
      return all(function(element) {
          return element == null || isExpression(element) && isValid(element);
        }, node.elements);

    case "AssignmentExpression":
      return isAssignmentOperator(node.operator) &&
        isExpression(node.left) && isValid(node.left) &&
        isExpression(node.right) && isValid(node.right);

    case "BinaryExpression":
      return isBinaryOperator(node.operator) &&
        isExpression(node.left) && isValid(node.left) &&
        isExpression(node.right) && isValid(node.right);

    case "BlockStatement":
      return all(function(stmt) { return isStatement(stmt) && isValid(stmt); }, node.body);

    case "BreakStatement":
    case "ContinueStatement":
      return node.label == null || node.label.type === "Identifier" && isValid(node.label);

    case "CatchClause":
      return isExpression(node.param) && isValid(node.param) &&
        node.body != null && node.body.type === "BlockStatement" && isValid(node.body);

    case "ConditionalExpression":
      return isExpression(node.test) && isValid(node.test) &&
        isExpression(node.alternate) && isValid(node.alternate) &&
        isExpression(node.consequent) && isValid(node.consequent);

    case "DebuggerStatement":
      return true;

    case "DoWhileStatement":
      return isStatement(node.body) && isValid(node.body) &&
        isExpression(node.test) && isValid(node.test);

    case "EmptyStatement":
      return true;

    case "ExpressionStatement":
      return isExpression(node.expression) && isValid(node.expression);

    case "ForInStatement":
      return (isExpression(node.left) || node.left.type === "VariableDeclaration") && isValid(node.left) &&
        isExpression(node.right) && isValid(node.right) &&
        isStatement(node.body) && isValid(node.body);

    case "ForStatement":
      return (node.init == null || (isExpression(node.init) || node.init.type === "VariableDeclaration") && isValid(node.init)) &&
        (node.test == null || isExpression(node.test) && isValid(node.test)) &&
        (node.update == null || isExpression(node.update) && isValid(node.update)) &&
        isStatement(node.body) && isValid(node.body);

    case "FunctionDeclaration":
      return node.id != null && node.id.type === "Identifier" && isValid(node.id) &&
        all(function(param){ return isExpression(param) && isValid(param); }, node.params) &&
        node.body != null && node.body.type === "BlockStatement" && isValid({type: "Program", body: node.body.body});

    case "FunctionExpression":
      return (node.id == null || node.id.type === "Identifier" && isValid(node.id)) &&
        all(function(param){ return isExpression(param) && isValid(param); }, node.params) &&
        node.body != null && node.body.type === "BlockStatement" && isValid({type: "Program", body: node.body.body});

    case "Identifier":
      return isIdentifierName(node.name) && !isReservedWord(node.name);

    case "IfStatement":
      return isExpression(node.test) && isValid(node.test) &&
        isStatement(node.consequent) && isValid(node.consequent) &&
        (node.alternate == null || isStatement(node.alternate) && isValid(node.alternate));

    case "LabeledStatement":
      return node.label != null && node.label.type === "Identifier" && isValid(node.label) &&
        isIterationStatement(node.body) && isValid(node.body);

    case "Literal":
      return ["Boolean", "Null", "Number", "RegExp", "String"].indexOf(getClass(node.value)) >= 0;

    case "LogicalExpression":
      return isLogicalOperator(node.operator) &&
        isExpression(node.left) && isValid(node.left) &&
        isExpression(node.right) && isValid(node.right);

    case "MemberExpression":
      return isExpression(node.object) && isValid(node.object) &&
        (node.computed && isExpression(node.property) && isValid(node.property) ||
          !node.computed && node.property != null && node.property.type === "Identifier" && isIdentifierName(node.property.name));

    case "CallExpression":
    case "NewExpression":
      return isExpression(node.callee) && isValid(node.callee) &&
        all(function(arg) { return isExpression(arg) && isValid(arg); }, node.arguments);

    case "ObjectExpression":
      return all(isValidObjectProperty, node.properties);

    case "Program":
      return all(function(stmt){ return isSourceElement(stmt) && isValid(stmt); }, node.body);

    case "ReturnStatement":
      return node.argument == null || isExpression(node.argument) && isValid(node.argument);

    case "SequenceExpression":
      return node.expressions != null && node.expressions.length >= 2 &&
        all(function(expr) { return isExpression(expr) && isValid(expr); }, node.expressions);

    case "SwitchCase":
      return (node.test == null || isExpression(node.test) && isValid(node.test)) &&
        all(function(stmt) { return isStatement(stmt) && isValid(stmt); }, node.consequent);

    case "SwitchStatement":
      return isExpression(node.discriminant) && isValid(node.discriminant) &&
        node.cases != null && node.cases.length >= 1 &&
        all(function(c) { return c != null && c.type === "SwitchCase" && isValid(c); }, node.cases);

    case "ThisExpression":
      return true;

    case "ThrowStatement":
      return isExpression(node.argument) && isValid(node.argument);

    case "TryStatement":
      // NOTE: TryStatement interface changed from {handlers: [CatchClause]} to {handler: CatchClause}
      var handlers = node.handlers || (node.handler ? [node.handler] : []);
      return node.block != null && node.block.type === "BlockStatement" && isValid(node.block) &&
        (handlers.length === 0 || all(function(h) { return h != null && h.type === "CatchClause" && isValid(h); }, handlers)) &&
        (node.finalizer == null || node.finalizer.type === "BlockStatement" && isValid(node.finalizer)) &&
        (handlers.length >= 1 || node.finalizer != null);

    case "UnaryExpression":
      return isUnaryOperator(node.operator) &&
        isExpression(node.argument) && isValid(node.argument);

    case "UpdateExpression":
      return isUpdateOperator(node.operator) &&
        isExpression(node.argument) && isValid(node.argument);

    case "VariableDeclaration":
      return node.declarations != null && node.declarations.length >= 1 &&
        all(function(decl) {
          return decl != null && decl.type === "VariableDeclarator" && isValid(decl);
        }, node.declarations);

    case "VariableDeclarator":
      return isExpression(node.id) && isValid(node.id) &&
        (node.init == null || isExpression(node.init) && isValid(node.init));

    case "WhileStatement":
      return isExpression(node.test) && isValid(node.test) &&
        isStatement(node.body) && isValid(node.body);

    case "WithStatement":
      return isExpression(node.object) && isValid(node.object) &&
        isStatement(node.body) && isValid(node.body);
  }

  return false;
}

module.exports = {
  isValid: isValid
};
