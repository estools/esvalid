/* global suite test */
"use strict";
var assert = require("assert");
var fs = require("fs");

var esprima = require("esprima");
var esvalid = require("../");

function validate(lib) {
  return function test(done) {
    fs.readFile(require.resolve(lib), function(err, programText) {
      if (err) throw err;
      var program = esprima.parse("" + programText);
      assert.ok(esvalid.isValid(program));
      done();
    });
  };
}

if (!process.env.REALCOVERAGE) {

  suite("everything.js", function() {
    test("is valid", validate("everything.js"));
  });

  suite("top 10 most popular npm packages", function() {
    test("underscore", validate("underscore"));
    test("async", validate("async"));
    test("request", validate("request"));
    test("lodash", validate("lodash"));
    test("commander", validate("commander"));
    test("express", validate("express"));
    test("optimist", validate("optimist"));
    test("coffee-script", validate("coffee-script"));
    test("colors", validate("colors"));
    test("mkdirp", validate("mkdirp"));
  });

}
