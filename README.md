# Reitrate [![Build Status](https://travis-ci.org/bigeasy/reiterate.png?branch=master)](https://travis-ci.org/bigeasy/reiterate) [![Coverage Status](https://coveralls.io/repos/bigeasy/reiterate/badge.png?branch=master)](https://coveralls.io/r/bigeasy/reiterate) [![NPM version](https://badge.fury.io/js/reiterate.png)](http://badge.fury.io/js/reiterate)

Evented construction of JSON objects.

## Synopsis

**Reiterate** creates a JSON object tree asynchronously, interpreting functions
in the object heirarchy as data methods that accept a callback.

You can use functions to define the functions that populate the structure.

The data functions can inject more data functions into the heirarchy, so that
the children can be created based on their parents.

```javascript
var loadObject = require('reiterate').loadObject,
    datastore = require('acme-datastore').datastore;

function getArticleByPerson(personId) {
  function (callback) {
    datastore.select('articles', 'personId', personId, callback);
  }
}

function getPerson (id) {
  function (callback) {
    datastore.select('people', id, function (error, people) {
      if (error) {
        callback(error);
      }  else {
        person = people.shift();
        person.articles = getArticleByPerson(person.id);
        callback(null, person);
      }
    });
  }
}

var data = { person: getPeople(1) };
loadObject(data, function (error, data) {
  for (var i = 0; i < data.person.articles.length; i++) {
    article = data.person.articles[i];
    process.stdout.write(article.title + ' by ' + person.name + '\n');
  }
});
```

For those of you using a NoSQL database, this is an easy way to get a
pseudo-JOIN, to create a psuedo-JOIN across database engines

## API

### `require('reiterate')`

The `reiterate` module exports the `loadObject` method.

```javascript
var loadObject = require('async-object').loadObject;
```

### `loadObject(object, callback)`

 * `object` &mdash;       The object to populate.
 * `callback` &mdash;     The callback to invoke when the object has been
                          loaded, or when an error occurs.

Use the `loadObject` method to load the `object` and invoke the given `callback`
when the object is loaded or if there is an error.

Any valid JSON type can be passed to `loadObject`. If the type is not an object,
array or function, the data is simply forwarded to the callback.

`loadObject` will descend the object contents recursively. Any values of type
`function` found in an object or array are assumed to be methods that accept a
single callback and invoked. The callback is of the form `callback(error,
data)`.

If data generation function invokes the callback is invoked with an error, the
error is forwarded to the user callback passed to `loadObject` and loading ends.
Otherwise, each value in th  data passed to the callback descended searching for
functions.

Note that each value of the data given to the is first checked for a function
that needs to be expanded, invokes the function if it exists. This means that a
one data function can return a data structure with data functions in it, and
those data functions will be be expanded before they are assigned to the tree.

You can also pass a function as the `object` argument so that the expanded data
callback result is given to the user callback.

## Change Log

Changes for each release.

### Version 0.0.0

Released: Mon Jul 23 02:29:04 UTC 2012

 * Build on Travis CI. #4. 
 * Rename to `reiterate`. #2.
