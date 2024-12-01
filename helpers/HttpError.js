const errorMessageList = { 
    400: "Bad request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not found",
    409: "Conflict",
    500: 'Server Error'
  };
  
  const HttpError = (status, message = errorMessageList[status]) => {
    console.log(message);
    const error = new Error(message);
    error.status = status;
    return error;
  };
  
//  module.exports = HttpError;
//  class HttpError extends Error {
//   constructor(status, message) {
//     super(message || errorMessageList[status]);
//     this.status = status;
//   }
// }

// const errorMessageList = { 
//   400: "Bad request",
//   401: "Unauthorized",
//   403: "Forbidden",
//   404: "Not found",
//   409: "Conflict",
//   500: 'Server Error'
// };

// module.exports = HttpError;