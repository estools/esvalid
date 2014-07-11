# esvalid

## Install

    npm install esvalid

## Usage

#### `esvalid.isValid(node)` :: Spidermonkey AST Node → Boolean

Returns true if and only if the given AST node represents a valid ECMAScript
program.

#### `esvalid.isValidExpression(node)` :: Spidermonkey AST Node → Boolean

Returns true if and only if the given AST node represents a valid ECMAScript
expression.

#### `esvalid.errors(node)` :: Spidermonkey AST Node → [InvalidAstError]

Returns an array of `InvalidAstError` objects representing the errors in the
given AST. An effort is made to continue collecting errors in the face of
malformed ASTs. If an empty array is returned, it is implied that the given AST
node is error free.

#### `new esvalid.InvalidAstError(node, message)` :: Node -> String -> InvalidAstError

Constructs a new `InvalidAstError` instance. `node` must be non-null.

##### Example

```
var esvalid = require("esvalid");
var esprima = require("esprima");

var program = esprima.parse(fs.readFileSync(require.resolve("esprima")));
esvalid.isValid(program); // true

esvalid.isValid({type: "Program", body: []}); // true
esvalid.isValid({type: "Program", body: null}); // false

esvalid.isValidExpression({type: "Program", body: []}); // false
esvalid.isValidExpression({type: "Literal", value: 0}); // true

esvalid.errors({type: "Program", body: []}); // []
var error = esvalid.errors({type: "Program", body: null})[0];
error instanceof esvalid.InvalidAstError; // true
error.node; // {type: "Program", body: null}
error.message; // "Program `body` member must be non-null"
```
