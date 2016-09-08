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
