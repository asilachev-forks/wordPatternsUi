getResponseError = (data) ->
    if 'org.az.words.ServiceException' == data.exception
        data.message
    else
        error = ''
        if data.error
            error += data.error + ' '
        if data.message
            error += data.message + ' '
        error

mean = (array) ->
    if array.length == 0
        return 0
    sum = 0
    for a in array
        sum += a
    sum / array.length


meanInRange = (array, fmin, fmax) ->
    if array.length == 0
        return 0

    sum = 0
    cnt = 0

    for a in array
        if a > fmin and a < fmax
            sum += a
            cnt++

    if cnt == 0
        return 0

    sum / cnt
