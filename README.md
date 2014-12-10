# set-property-from-file

[![Build Status](https://travis-ci.org/shinnn/set-property-from-file.svg?branch=master)](https://travis-ci.org/shinnn/set-property-from-file)
[![Build status](https://ci.appveyor.com/api/projects/status/2kqfms8u86h69tqt?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/set-property-from-file)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/set-property-from-file.svg)](https://coveralls.io/r/shinnn/set-property-from-file)
[![Dependency Status](https://david-dm.org/shinnn/set-property-from-file.svg)](https://david-dm.org/shinnn/set-property-from-file)
[![devDependency Status](https://david-dm.org/shinnn/set-property-from-file/dev-status.svg)](https://david-dm.org/shinnn/set-property-from-file#info=devDependencies)

Set object property using a file path and contents

```javascript
var setPropertyFromFile = require('set-property-from-file');

// foo.txt (Hello!)

setPropertyFromFile({bar: true}, 'foo.txt', 'utf8', function(err, res) {
  if (err) {
    throw err;
  }

  res; //=> {foo: 'Hello!', bar: true};
});
```

## Installation

[![NPM version](https://badge.fury.io/js/set-property-from-file.svg)](https://www.npmjs.org/package/set-property-from-file)

[Use npm.](https://www.npmjs.org/doc/cli/npm-install.html)

```
npm install set-property-from-file
```

## API

```javascript
var setPropetyFromFile = require('set-property-from-file');
```

### setPropetyFromFile(*target*, *filePath* [, *options*], *callback*)

*target*: `object`  
*filePath*: `String` (a relative file path)  
*options*: `Object` or `String` (file encoding)  
*callback*: `Function`

It reads a file asynchronously, then sets the property of the target object to the file contents. (It automatically strip [UTF-8 byte order mark](http://en.wikipedia.org/wiki/Byte_order_mark#UTF-8) from contents.)

The names of the created properties are based on the file path. For example,

* `foo.txt` sets `foo` property.
* `foo/bar.txt` sets `foo.bar` property.
* `foo/bar/baz.qux.txt` sets `foo.bar['baz.qux']` property.
* `../foo/bar.txt` sets `['..'].foo.bar` property.
* `foo/../bar/baz.txt` sets `bar.baz` property.

```javascript
var assert = require('assert');
var setPropertyFromFile = require('set-property-from-file');

var target = {
  fixtures: {
    foo: 'bar'
  }
};

setPropertyFromFile(target, 'fixtures/images/00.jpg', function(err, res) {
  if (err) {
    throw err;
  }
  
  // Adds ['fixtures']['images']['00'] property to the target object.
  assert.deepEqual(res, {
    fixtures: {
      foo: 'bar' // target's default property
      images: {
        '00': <Buffer ... > // new property
      }
    }
  }, 'object['fixtures']['images']['00'] is added.');
});
```

It doesn't create a new property under the existing property if the existing property is not an object.

```javascript
var assert = require('assert');
var setPropertyFromFile = require('set-property-from-file');

var target = {
  fixtures: {
    foo: 'Hello!' // string (not an object)
  }
};

setPropertyFromFile(target, 'fixtures/foo/bar/baz.txt', function(err, res) {
  if (err) {
    throw err;
  }

  // Doesn't overwrite the existing non-object property.
  assert.deepEqual(res, {
    fixtures: {
      foo: 'Hello!' // object['fixtures']['foo'] already exists
    }
  });
});
```

#### options

(In addition to the follwing options, [all fs.readFile options](http://nodejs.org/api/fs.html#fs_fs_readfile_filename_options_callback) are available.)

##### options.cwd

Type: `String`  
Default: [`process.cwd()`](http://nodejs.org/api/process.html#process_process_cwd)

Specify the working directory the source path is relative to. This won't be included in the property names.

```javascript
// Reads one/two/three.txt
setPropertyFromFile({}, 'two/three.txt', {cwd: 'one'}, function(err, res) {
  res; // {two: {three: <Buffer ...>}}
});
```

##### options.base

Type: `String`  
Default: `''`

Specify the directory relative to the cwd. This won't be included in the property names.

```javascript
// Reads one/two/three.txt
setPropertyFromFile({}, 'one/two/three.txt', {base: 'one/two'}, function(err, res) {
  res; // {three: <Buffer ...>}
});
```

##### options.ext

Type: `Boolean`  
Default: `false`

By default the property names don't include file extension. `true` keeps it in the last property name.

```javascript
setPropertyFromFile({}, 'index.js', function(err, res) {
  res; //=> {index: ... }
});

setPropertyFromFile({}, 'index.js', {ext: true}, function(err, res) {
  res; //=> {index: {js: ... }}
});
```

##### options.encoding

Type: `String` or `Function`  
Default: `undefined`

If you set this option to a function, it will be used to process file contents before setting the property.

```javascript
// foo.txt (abcde)

var encoder = function(content) {
  return content.toString().toUpperCase();
};

setPropertyFromFile({}, 'foo.txt', {encoding: encoder}, function(err, res) {
  res; //=> 'ABCDE'
});
```

#### callback(*error*, *result*)

*error*: `Error` if it fails to read the file, otherwise `null`  
*result*: `Object` (Target object modified)

Note that it overwrites the target object.

```javascript
var target = {foo: true};

setPropertyFromFile(target, 'bar.txt', function(err, res) {
  res; //=> {foo: true, bar: ... }
  target; //=> {foo: true, bar: ... }
  res === target; //=> true
});
```

## License

Copyright (c) 2014 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).
