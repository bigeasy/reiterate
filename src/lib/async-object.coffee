loadObject = (object, callback) ->
  switch typeof object
    when "object"
      if not object?
        callback(null, object)
      else if Array.isArray(object)
        next = (object, index) ->
          if index is object.length
            callback(null, object)
          else
            loadObject object[index], (error, data) ->
              if error
                callback(error)
              else
                loadObject data, (error, data) ->
                  if error
                    callback(error)
                  else
                    object[index] = data
                    next(object, index + 1)
        next(object, 0)
      else
        keys = Object.keys(object)
        next = (object, keys, index) ->
          if index is keys.length
            callback(null, object)
          else
            loadObject object[keys[index]], (error, data) ->
              if error
                callback(error)
              else
                loadObject data, (error, data) ->
                  if error
                    callback(error)
                  else
                    object[keys[index]] = data
                    next(object, keys, index + 1)
        next(object, keys, 0)
    when "function"
      object(callback)
    else
      callback(null, object)

module.exports.loadObject = loadObject
