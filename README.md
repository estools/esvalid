# esvalidate

## Install

    npm install -g commonjs-everywhere

## Usage

#### `esvalidate.isValid(node)` :: Spidermonkey AST Node → Boolean

Returns true if and only if the given AST node represents a valid ECMAScript
program or a portion of one.

##### Example

```
var esvalidate = require("esvalidate");
var esprima = require("esprima");

var program = esprima.parse(fs.readFileSync(require.resolve("esprima")));
esvalidate.isValid(program); // true
esvalidate.isValid({type: "Program", body: []}); // true
esvalidate.isValid({type: "Program", body: null}); // false
```
