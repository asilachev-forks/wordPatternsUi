function getResponseError(data) {

    if ("org.az.words.ServiceException" == data.exception) {
        return data.message;
    } else {
        var error = "";
        if (data.error) {
            error += data.error + " ";
        }
        if (data.message) {
            error += data.message + " ";
        }
        return error;
    }
}


function mean(array) {
    if (array.length == 0) return 0;
    var sum = 0;

    for (var i = 0; i < array.length; i++) {
        sum += array[i];
    }

    return sum / array.length;
}

function meanInRange(array, fmin, fmax) {
    if (array.length == 0) return 0;
    var sum = 0;
    var cnt = 0;

    for (var i = 0; i < array.length; i++) {
        if (array[i] > fmin && array[i] < fmax) {
            sum += array[i];
            cnt++;
        }

    }

    return sum / cnt;
}
