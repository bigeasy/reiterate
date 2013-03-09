#!/usr/bin/env node

require('proof')(1, function (step, deepEqual) {

  function generator (number) {
    return function (callback) { callback(null, number * 2) }
  }

  var reiterate = require('../..');

  reiterate({ a: generator(1) }, step());

}, function (object, deepEqual) {

  deepEqual(object, { a: 2 }, 'callback called');

});
