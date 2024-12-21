const { HttpError } = require("../helpers/HttpError");

const validateBody = (schema) => {
    debugger
    const func = (req, res, next) => {
        debugger
        const { error } = schema.validate(req.body);  
        debugger
        if (error) {
            debugger
            console.log(error, 'error')
            return next(HttpError(400));
        }
        next();
    };
    debugger
    console.log(func, 'func')
    return func;
};


module.exports = validateBody;