const { isValidId } = require('./isValidId'); // Укажите правильный путь к файлу с функцией
const { isValidObjectId } = require('mongoose');
const { HttpError } = require('../helpers/HttpError');
const httpMocks = require('node-mocks-http');

jest.mock('mongoose', () => ({
  isValidObjectId: jest.fn()
}));

jest.mock('../helpers/HttpError', () => ({
  HttpError: jest.fn()
}));

describe('isValidId Middleware', () => {
  it('should call next() if the ID is valid', () => {
    isValidObjectId.mockReturnValue(true);

    const req = httpMocks.createRequest({
      params: { id: '605c72d9f1c5c4f3a88f1f7e' }
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    isValidId(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should call next with HttpError if the ID is invalid', () => {
    isValidObjectId.mockReturnValue(false);

    const req = httpMocks.createRequest({
      params: { id: 'invalid_id' }
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    isValidId(req, res, next);

    expect(HttpError).toHaveBeenCalledWith(400, 'invalid_id is not valid id');
    expect(next).toHaveBeenCalledWith(HttpError(400, 'invalid_id is not valid id'));
  });

  it('should call next() if the ID is not provided', () => {
    const req = httpMocks.createRequest({
      params: {}
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    isValidId(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
