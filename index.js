function descend (trace, error, object, depth, userCallback, callback) {
  trace("descend", depth, error, object === null, userCallback === callback);
  if (userCallback === callback) {
    return callback(error, object);
  } else if (depth > 1024) {
    if ((typeof process == "object") && process.nextTick) {
      process.nextTick(function() { descend(trace, error, object, 0, userCallback, callback); });
    } else {
      setTimeout(function() { descend(trace, error, object, 0, userCallback, callback); }, 1);
    }
  } else {
    return callback(error, object, depth);
  }
};

function loadObject (trace, object, depth, userCallback, callback) {
  var keys, next;
  trace("loadObject", depth, object === null, userCallback === callback);
  switch (typeof object) {
    case "object":
      if (!(object != null) || object.__ascending) {
        return descend(trace, null, object, depth + 1, userCallback, callback);
      } else if (Array.isArray(object)) {
        next = function(object, index, depth) {
          trace("arrayNext", depth, object === null, index, userCallback === callback);
          if (index === object.length) {
            return descend(trace, null, object, depth + 1, userCallback, callback);
          } else {
            return loadObject(trace, object[index], depth + 1, userCallback, function(error, data, depth) {
              if (error) {
                return descend(trace, error, null, depth + 1, userCallback, callback);
              } else {
                return loadObject(trace, data, depth + 1, userCallback, function(error, data, depth) {
                  if (error) {
                    return descend(trace, error, null, depth + 1, userCallback, callback);
                  } else {
                    object[index] = data;
                    return next(object, index + 1, depth + 1);
                  }
                });
              }
            });
          }
        };
        return next(object, 0, depth + 1);
      } else {
        keys = Object.keys(object);
        next = function(object, keys, index, depth) {
          trace("objectNext", depth, object === null, keys[index], userCallback === callback);
          if (index === keys.length) {
            return descend(trace, null, object, depth + 1, userCallback, callback);
          } else {
            return loadObject(trace, object[keys[index]], depth + 1, userCallback, function(error, data, depth) {
              if (error) {
                return descend(trace, error, null, depth + 1, userCallback, callback);
              } else {
                return loadObject(trace, data, depth + 1, userCallback, function(error, data, depth) {
                  if (error) {
                    return descend(trace, error, null, depth + 1, userCallback, callback);
                  } else {
                    object[keys[index]] = data;
                    return next(object, keys, index + 1, depth + 1);
                  }
                });
              }
            });
          }
        };
        return next(object, keys, 0, depth + 1);
      }
      break;
    case "function":
      return object(function(error, data) {
        trace("CALLBACK", depth, error, data === null);
        return descend(trace, error, data, depth + 1, userCallback, callback);
      });
    default:
      return descend(trace, null, object, depth + 1, userCallback, callback);
  }
};

function noop () {}

module.exports = function(object, callback, trace) {
  return loadObject(trace || noop, object, 0, callback, callback);
}
