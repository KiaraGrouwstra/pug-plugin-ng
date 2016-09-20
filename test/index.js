'use strict';

var pug = require('pug');
var pug_plugin_ng = require('../');
var fs = require('fs');
var assert = require('assert');

var dir = __dirname + '/cases/';
fs.readdirSync(dir).forEach(function (testCase) {
  if (/\.pug$/.test(testCase)) {
    console.dir(testCase);
    var expPath = dir + testCase.replace(/\.pug$/, '.expected.html');
    var expected = fs.readFileSync(expPath, 'utf8');
    // console.log('expected', expected);
    var str = fs.readFileSync(dir + testCase, 'utf8');
    var result = pug.render(str, { doctype: 'html', plugins: [pug_plugin_ng], pretty: true });
    // console.log('result', result);
    var actPath = dir + testCase.replace(/\.pug$/, '.actual.html');
    fs.writeFileSync(actPath, result);
    assert.equal(expected, result);
  }
});
