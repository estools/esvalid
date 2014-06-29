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
```
