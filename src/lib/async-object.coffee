descend = (trace, error, object, depth, userCallback, callback) ->
  trace "descend", depth, error, object is null, userCallback is callback
  if isNaN(depth)
    process.exit 1
  if userCallback is callback
    callback(error, object)
  else if depth > 1024
    process.nextTick ->
      descend(trace, error, object, 0, userCallback, callback)
  else
    callback(error, object, depth)

loadObject = (trace, object, depth, userCallback, callback) ->
  trace "loadObject", depth, object is null, userCallback is callback
  switch typeof object
    when "object"
      if not object? or object.__ascending
        descend(trace, null, object, depth + 1, userCallback, callback)
      else if Array.isArray(object)
        next = (object, index, depth) ->
          trace "arrayNext", depth, object is null, index, userCallback is callback
          if index is object.length
            descend(trace, null, object, depth + 1, userCallback, callback)
          else
            loadObject trace, object[index], depth + 1, userCallback, (error, data, depth) ->
              if error
                descend(trace, error, null, depth + 1, userCallback, callback)
              else
                loadObject trace, data, depth + 1, userCallback, (error, data, depth) ->
                  if error
                    descend(trace, error, null, depth + 1, userCallback, callback)
                  else
                    object[index] = data
                    next(object, index + 1, depth + 1)
        next(object, 0, depth + 1)
      else
        keys = Object.keys(object)
        next = (object, keys, index, depth) ->
          trace "objectNext", depth, object is null, keys[index], userCallback is callback
          if index is keys.length
            descend(trace, null, object, depth + 1, userCallback, callback)
          else
            loadObject trace, object[keys[index]], depth + 1, userCallback, (error, data, depth) ->
              if error
                descend(trace, error, null, depth + 1, userCallback, callback)
              else
                loadObject trace, data, depth + 1, userCallback, (error, data, depth) ->
                  if error
                    descend(trace, error, null, depth + 1, userCallback, callback)
                  else
                    object[keys[index]] = data
                    next(object, keys, index + 1, depth + 1)
        next(object, keys, 0, depth + 1)
    when "function"
      object (error, data) ->
        trace "CALLBACK", depth, error, data is null
        descend(trace, error, data, depth + 1, userCallback, callback)
    else
      descend(trace, null, object, depth + 1, userCallback, callback)

noop = ->

module.exports.loadObject = (object, callback, trace) ->
  loadObject(trace or noop, object, 0, callback, callback)
