/*!
 * set-property-from-file | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/set-property-from-file
*/
'use strict';

var path = require('path');

var fs = require('graceful-fs');
var isRelativePath = require('is-relative');
var objectPath = require('object-path');
var stripBom = require('strip-bom');
var xtend = require('xtend');

module.exports = function setPropertyFromFile(target, filePath, options, cb) {
  if (!target || typeof target !== 'object') {
    throw new TypeError('First argument must be an object.');
  }

  if (cb === undefined) {
    cb = options;
    options = {};
  } else {
    if (typeof options === 'string') {
      options = {encoding: options};
    } else {
      options = options || {};
    }
  }

  filePath = path.normalize(filePath);

  if (!isRelativePath(filePath)) {
    throw new Error('Second argument must be a relative path.');
  }

  var encoder;

  if (typeof options.encoding === 'function') {
    encoder = options.encoding;
    options = xtend(options, {encoding: null});
  }

  if (typeof cb !== 'function') {
    throw new TypeError(cb + ' is not a function. Last argument must be a function.');
  }

  var readPath = filePath;
  if (options.cwd !== undefined) {
    readPath = path.resolve(options.cwd, readPath);
  }

  fs.readFile(readPath, options, function(err, result) {
    if (err) {
      cb(err);
      return;
    }

    if (options.base !== undefined) {
      filePath = path.relative(options.base, filePath);
    }

    var props = filePath.split(path.sep);

    if (!options.ext) {
      var last = props.length - 1;
      props[last] = path.basename(props[last], path.extname(props[last]));
    }

    result = stripBom(result);

    if (encoder) {
      result = encoder(result);
    }

    objectPath.set(target, props, result);
    cb(null, target);
  });
};
