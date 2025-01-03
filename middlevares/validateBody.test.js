// Import required modules
const validateBody = require('./vaidateBody'); 
const { HttpError } = require('../helpers/HttpError');
const Joi = require('joi');
const httpMocks = require('node-mocks-http');
jest.mock('../helpers/HttpError', () => ({
  HttpError: jest.fn((status, message) => new Error(message))
}));

describe('validateBody Middleware', () => {
  const sampleSchema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().required(),
  });

  it('should call next() if the request body is valid', () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { name: 'John Doe', age: 30 },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    const validate = validateBody(sampleSchema);
    validate(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should call next with HttpError if the request body is invalid', () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { name: '', age: 'thirty' },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    const validate = validateBody(sampleSchema);
    validate(req, res, next);

    expect(HttpError).toHaveBeenCalledWith(400); 
    expect(next).toHaveBeenCalledWith(expect.anything());
  });

  it('should call next() if the request body is empty', () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {},
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    const validate = validateBody(sampleSchema);
    validate(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
