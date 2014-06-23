/* global suite test */
"use strict";
var assert = require("assert");
var fs = require("fs");

var esprima = require("esprima");
var esvalidate = require("..");

function validate(done) {
  return function(err, programText) {
    if (err) throw err;
    var program = esprima.parse(programText);
    assert.ok(esvalidate.isValid(program));
    done();
  };
}

// top 10 most popular npm packages
suite("popular libraries", function(){

  test("underscore", function(done) {
    fs.readFile(require.resolve("underscore"), validate(done));
  });

  test("async", function(done) {
    fs.readFile(require.resolve("async"), validate(done));
  });

  test("request", function(done) {
    fs.readFile(require.resolve("request"), validate(done));
  });

  test("lodash", function(done) {
    fs.readFile(require.resolve("lodash"), validate(done));
  });

  test("commander", function(done) {
    fs.readFile(require.resolve("commander"), validate(done));
  });

  test("express", function(done) {
    fs.readFile(require.resolve("express"), validate(done));
  });

  test("optimist", function(done) {
    fs.readFile(require.resolve("optimist"), validate(done));
  });

  test("coffee-script", function(done) {
    fs.readFile(require.resolve("coffee-script"), validate(done));
  });

  test("colors", function(done) {
    fs.readFile(require.resolve("colors"), validate(done));
  });

  test("mkdirp", function(done) {
    fs.readFile(require.resolve("mkdirp"), validate(done));
  });

});
