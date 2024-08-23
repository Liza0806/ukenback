const HttpError = require("../helpers/HttpError");

const validateBody = (schema) => {
    console.log('schema1')
    const func = (req, res, next) => {
        console.log('schema2')
        const { error } = schema.validate(req.body);  
        console.log('schema3')      
        if (error) {
            console.log('schema4')
            return next(HttpError(400, "missing required name field"));
        }
        console.log('schema5')
        next();
    };
    console.log('schema6')
    return func;
};


module.exports = validateBody;