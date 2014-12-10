'use strict';

var noop = require('nop');
var setPropertyFromFile = require('../');
var test = require('tape');

test('setPropertyFromFile()', function(t) {
  t.plan(15);

  var obj = {};
  setPropertyFromFile(obj, '.gitattributes', 'utf8', function(err, res) {
    t.deepEqual(
      [err, res],
      [null, {'.gitattributes': '* text=auto\n'}],
      'should set property based on the file name, contents and encoding.'
    );
    t.strictEqual(obj, res, 'should overwrite the target object.');
  });

  setPropertyFromFile({'.gitattributes': ['a']}, '.gitattributes', null, function(err, res) {
    t.deepEqual(
      [err, res],
      [null, {'.gitattributes': new Buffer('* text=auto\n')}],
      'should override existing property.'
    );
  });

  setPropertyFromFile({}, 'test/fixtures/a.txt', {}, function(err, res) {
    t.deepEqual(
      [err, res],
      [null, {test: {fixtures: {a: new Buffer('foo\n')}}}],
      'should set nested property when the file is under some directories.'
    );
  });

  setPropertyFromFile({test: {fixtures: 1}}, 'test/fixtures/a.txt', function(err, res) {
    t.deepEqual(
      [err, res],
      [null, {test: {fixtures: 1}}],
      'should not override property when the property is not an object.'
    );
  });

  setPropertyFromFile({test: {fixtures: {b: 1}}}, 'test/fixtures/a.txt', function(err, res) {
    t.deepEqual(
      [err, res],
      [null, {
        test: {
          fixtures: {a: new Buffer('foo\n'), b: 1}
        }
      }],
      'should extend property when the property is an object.'
    );
  });

  setPropertyFromFile({}, 'fixtures/a.txt', {
    cwd: 'test',
    base: 'fixtures',
    encoding: 'base64'
  }, function(err, res) {
    t.deepEqual(
      [err, res],
      [null, {a: new Buffer('foo\n').toString('base64')}],
      'should reflect `cwd` option and `base` option to the result.'
    );
  });

  setPropertyFromFile({}, '.gitattributes', {base: 'test'}, function(err, res) {
    t.deepEqual(
      [err, res],
      [null, {'..': {'.gitattributes': new Buffer('* text=auto\n')}}],
      'should set ".." property when the path starts with "../".'
    );
  });

  var option = {encoding: Boolean};

  setPropertyFromFile({}, 'index.js', {encoding: Boolean}, function(err, res) {
    t.deepEqual(
      [err, res],
      [null, {index: true}],
      'should process file content with a function using `encoding` option.'
    );
    t.deepEqual(option, {encoding: Boolean}, 'should not modify option object.');
  });

  setPropertyFromFile({}, 'test/fixtures/a.txt', {ext: true}, function(err, res) {
    t.deepEqual(
      [err, res],
      [null, {test: {fixtures: {'a.txt': new Buffer('foo\n')}}}],
      'should add extension to the property name using `ext` option.'
    );
  });

  setPropertyFromFile({}, 'node_modules', function(err) {
    t.equal(
      err.code,
      'EISDIR',
      'should pass an error to the callback when it fails to read a file.'
    );
  });

  t.throws(
    setPropertyFromFile.bind(null, null, noop),
    /TypeError.*must be an object/,
    'should throw a type error when the first argument is not an object.'
  );

  t.throws(
    setPropertyFromFile.bind(null, {}, '/', noop),
    /must be a relative path/,
    'should throw an error when the path is absolute.'
  );

  t.throws(
    setPropertyFromFile.bind(null, {}, '.gitattributes', {}),
    /TypeError.*must be a function/,
    'should throw a type error when the last argument is not a function.'
  );
});
