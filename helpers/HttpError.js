const errorMessageList = { 
    400: "Bad request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not found",
    409: "Conflict",
    500: 'Server Error'
  };
  
  const HttpError = (status, message = errorMessageList[status]) => {
    debugger
    console.log(message);
    const error = new Error(message);
    debugger
    error.status = status;
    debugger
    return error;
  };
  
  module.exports = {
    HttpError
  }