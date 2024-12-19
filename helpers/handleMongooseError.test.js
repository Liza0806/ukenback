const { handleMongooseError } = require('./handleMongooseError');

describe('handleMongooseError', () => {
  it('should set status 409 for MongoServerError with code 11000', () => {
    const error = { name: 'MongoServerError', code: 11000 };
    const next = jest.fn();

    handleMongooseError(error, null, next);

    expect(error.status).toBe(409);
    expect(next).toHaveBeenCalled();
  });

  it('should set status 400 for other MongoServerError errors', () => {
    const error = { name: 'MongoServerError', code: 12345 };
    const next = jest.fn();

    handleMongooseError(error, null, next);

    expect(error.status).toBe(400);
    expect(next).toHaveBeenCalled();
  });

  it('should set status 400 for non-MongoServerError errors', () => {
    const error = { name: 'ValidationError', code: null };
    const next = jest.fn();

    handleMongooseError(error, null, next);

    expect(error.status).toBe(400);
    expect(next).toHaveBeenCalled();
  });

  it('should work with an empty error object', () => {
    const error = {};
    const next = jest.fn();

    handleMongooseError(error, null, next);

    expect(error.status).toBe(400);
    expect(next).toHaveBeenCalled();
  });

  it('should call next regardless of the error type', () => {
    const error = { name: 'SomeOtherError', code: 999 };
    const next = jest.fn();

    handleMongooseError(error, null, next);

    expect(next).toHaveBeenCalled();
  });
});
