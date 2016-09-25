var getResponseError, mean, meanInRange;

getResponseError = function(data) {
  var error;
  if ('org.az.words.ServiceException' === data.exception) {
    return data.message;
  } else {
    error = '';
    if (data.error) {
      error += data.error + ' ';
    }
    if (data.message) {
      error += data.message + ' ';
    }
    return error;
  }
};

mean = function(array) {
  var a, i, len, sum;
  if (array.length === 0) {
    return 0;
  }
  sum = 0;
  for (i = 0, len = array.length; i < len; i++) {
    a = array[i];
    sum += a;
  }
  return sum / array.length;
};

meanInRange = function(array, fmin, fmax) {
  var a, cnt, i, len, sum;
  if (array.length === 0) {
    return 0;
  }
  sum = 0;
  cnt = 0;
  for (i = 0, len = array.length; i < len; i++) {
    a = array[i];
    if (a > fmin && a < fmax) {
      sum += a;
      cnt++;
    }
  }
  if (cnt === 0) {
    return 0;
  }
  return sum / cnt;
};
