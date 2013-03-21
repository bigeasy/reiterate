#!/usr/bin/env node

require('proof')(1, function (step, deepEqual) {
  
  function generator (number) {
    return function (callback) { callback(null, number * 2) }
  }

  step(function () {

    var reiterate = require('../..');

    reiterate({ a: generator(1) }, step());

  }, function (object) {

    deepEqual(object, { a: 2 }, 'callback called');

  });
});
