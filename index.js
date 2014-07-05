"use strict";
var esutils = require("esutils");

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

// isExpression :: Maybe Node -> Boolean
function isExpression(node) { return node != null && esutils.ast.isExpression(node); }
// isStatement :: Maybe Node -> Boolean
function isStatement(node) { return node != null && esutils.ast.isStatement(node); }
// isSourceElement :: Maybe Node -> Boolean
function isSourceElement(node) { return node != null && esutils.ast.isSourceElement(node); }

// isValidObjectProperty :: Maybe Node -> (Maybe Node -> Boolean) -> Boolean
function isValidObjectProperty(node, isValid) {
  if (node == null || !isExpression(node.value) || !isValid(node.value) || ["init", "get", "set"].indexOf(node.kind) < 0)
    return false;
  switch (node.key.type) {
    case "Identifier":
      return esutils.keyword.isIdentifierName(node.key.name);
    case "Literal":
      return ["Number", "String"].indexOf(getClass(node.key.value)) >= 0;
  }
  return false;
}

// isProblematicIfStatement :: Node -> Boolean
function isProblematicIfStatement(node) {
  return node.type === "IfStatement" && (
      node.alternate != null && isProblematicIfStatement(node.alternate) ||
      node.alternate == null && node.consequent != null && (node.consequent.type !== "IfStatement" || isProblematicIfStatement(node.consequent))
    );
}

var ASSIGNMENT_OPERATORS = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "|=", "^=", "&="];
var BINARY_OPERATORS = ["==", "!=", "===", "!==", "<", "<=", ">", ">=", "<<", ">>", ">>>", "+", "-", "*", "/", "%", "|", "^", "&", "in", "instanceof"];
var LOGICAL_OPERATORS = ["||", "&&"];
var UNARY_OPERATORS = ["-", "+", "!", "~", "typeof", "void", "delete"];
var UPDATE_OPERATORS = ["++", "--"];

// isAssignmentOperator :: String -> Boolean
function isAssignmentOperator(op) { return ASSIGNMENT_OPERATORS.indexOf(op) >= 0; }
// isBinaryOperator :: String -> Boolean
function isBinaryOperator(op) { return BINARY_OPERATORS.indexOf(op) >= 0; }
// isLogicalOperator :: String -> Boolean
function isLogicalOperator(op) { return LOGICAL_OPERATORS.indexOf(op) >= 0; }
// isUnaryOperator :: String -> Boolean
function isUnaryOperator(op) { return UNARY_OPERATORS.indexOf(op) >= 0; }
// isUpdateOperator :: String -> Boolean
function isUpdateOperator(op) { return UPDATE_OPERATORS.indexOf(op) >= 0; }


// isValidPrime :: Node -> [Label] -> Boolean -> Boolean -> Boolean -> Boolean
function isValidPrime(node, labels, inFunc, inIter, inSwitch) {
  if (!node.type || node.loc != null &&
    (node.loc.source != null && typeof node.loc.source != "string" ||
      node.loc.start == null ||
      typeof node.loc.start.line != "number" || node.loc.start.line < 1 ||
      typeof node.loc.start.column != "number" || node.loc.start.column < 0 ||
      node.loc.end == null ||
      typeof node.loc.end.line != "number" || node.loc.end.line < 1 ||
      typeof node.loc.end.column != "number" || node.loc.end.column < 0
    )) return false;

  var isValid = function(node) {
    return isValidPrime(node, labels, inFunc, inIter, inSwitch);
  };

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
      return (inIter || inSwitch) && (node.label == null || node.label.type === "Identifier" && isValid(node.label) && labels.indexOf(node.label.name) >= 0);

    case "CatchClause":
      return isExpression(node.param) && isValid(node.param) &&
        node.body != null && node.body.type === "BlockStatement" && isValid(node.body);

    case "ConditionalExpression":
      return isExpression(node.test) && isValid(node.test) &&
        isExpression(node.alternate) && isValid(node.alternate) &&
        isExpression(node.consequent) && isValid(node.consequent);

    case "ContinueStatement":
      return inIter && (node.label == null || node.label.type === "Identifier" && isValid(node.label) && labels.indexOf(node.label.name) >= 0);

    case "DebuggerStatement":
      return true;

    case "DoWhileStatement":
      return isStatement(node.body) && isValidPrime(node.body, labels, inFunc, true, inSwitch) &&
        isExpression(node.test) && isValid(node.test);

    case "EmptyStatement":
      return true;

    case "ExpressionStatement":
      return isExpression(node.expression) && isValid(node.expression);

    case "ForInStatement":
      return (isExpression(node.left) || node.left.type === "VariableDeclaration") && isValid(node.left) &&
        isExpression(node.right) && isValid(node.right) &&
        isStatement(node.body) && isValidPrime(node.body, labels, inFunc, true, inSwitch);

    case "ForStatement":
      return (node.init == null || (isExpression(node.init) || node.init.type === "VariableDeclaration") && isValid(node.init)) &&
        (node.test == null || isExpression(node.test) && isValid(node.test)) &&
        (node.update == null || isExpression(node.update) && isValid(node.update)) &&
        isStatement(node.body) && isValidPrime(node.body, labels, inFunc, true, inSwitch);

    case "FunctionDeclaration":
      return node.id != null && node.id.type === "Identifier" && isValid(node.id) &&
        all(function(param){ return isExpression(param) && isValid(param); }, node.params) &&
        node.body != null && node.body.type === "BlockStatement" && isValidPrime({type: "Program", body: node.body.body}, [], true, inIter, inSwitch);

    case "FunctionExpression":
      return (node.id == null || node.id.type === "Identifier" && isValid(node.id)) &&
        all(function(param){ return isExpression(param) && isValid(param); }, node.params) &&
        node.body != null && node.body.type === "BlockStatement" && isValidPrime({type: "Program", body: node.body.body}, labels, true, inIter, inSwitch);

    case "Identifier":
      return node.name != null && esutils.keyword.isIdentifierName(node.name) && !esutils.keyword.isReservedWordES6(node.name, true);

    case "IfStatement":
      return isExpression(node.test) && isValid(node.test) &&
        isStatement(node.consequent) && isValid(node.consequent) &&
        (node.alternate == null || isStatement(node.alternate) && isValid(node.alternate)) &&
        (node.alternate == null || !isProblematicIfStatement(node.consequent));

    case "LabeledStatement":
      return node.label != null && node.label.type === "Identifier" && isValid(node.label) && labels.indexOf(node.label.name) < 0 &&
        isStatement(node.body) && isValidPrime(node.body, labels.concat(node.label.name), inFunc, inIter, inSwitch);

    case "Literal":
      switch (getClass(node.value)) {
        case "Boolean":
        case "Null":
        case "RegExp":
        case "String":
          return true;
        case "Number":
          return 1 / node.value >= 0 && node.value !== 1 / 0 && node.value !== -1 / 0;
      }
      return false;

    case "LogicalExpression":
      return isLogicalOperator(node.operator) &&
        isExpression(node.left) && isValid(node.left) &&
        isExpression(node.right) && isValid(node.right);

    case "MemberExpression":
      return isExpression(node.object) && isValid(node.object) &&
        (node.computed && isExpression(node.property) && isValid(node.property) ||
          !node.computed && node.property != null && node.property.type === "Identifier" && esutils.keyword.isIdentifierName(node.property.name));

    case "CallExpression":
    case "NewExpression":
      return isExpression(node.callee) && isValid(node.callee) &&
        all(function(arg) { return isExpression(arg) && isValid(arg); }, node.arguments);

    case "ObjectExpression":
      return all(function(n) { return isValidObjectProperty(n, isValid); }, node.properties);

    case "Program":
      return all(function(stmt){ return isSourceElement(stmt) && isValid(stmt); }, node.body);

    case "ReturnStatement":
      return inFunc && (node.argument == null || isExpression(node.argument) && isValid(node.argument));

    case "SequenceExpression":
      return node.expressions != null && node.expressions.length >= 2 &&
        all(function(expr) { return isExpression(expr) && isValid(expr); }, node.expressions);

    case "SwitchCase":
      return (node.test == null || isExpression(node.test) && isValid(node.test)) &&
        all(function(stmt) { return isStatement(stmt) && isValidPrime(stmt, labels, inFunc, inIter, true); }, node.consequent);

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
        isStatement(node.body) && isValidPrime(node.body, labels, inFunc, true, inSwitch);

    case "WithStatement":
      return isExpression(node.object) && isValid(node.object) &&
        isStatement(node.body) && isValid(node.body);
  }

  // istanbul ignore next: unreachable
  throw new TypeError("Unrecognised node type: " + JSON.stringify(node.type));
}

module.exports = {
  // isValid :: Maybe Node -> Boolean
  isValid: function isValid(node) {
    if (node == null || node.type !== "Program") return false;
    return isValidPrime(node, [], false, false, false);
  },
  // isValidExpression :: Maybe Node -> Boolean
  isValidExpression: function isValidExpression(node) {
    return isExpression(node) && isValidPrime(node, [], false, false, false);
  }
};
