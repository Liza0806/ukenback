// Import required modules
const isAdmin = require('./isAdmin');
const httpMocks = require('node-mocks-http');

describe('isAdmin Middleware', () => {
  it('should call next() if user is admin', () => {
    const req = httpMocks.createRequest({
      user: { isAdmin: true }
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should respond with 403 status and error message if user is not admin', () => {
    const req = httpMocks.createRequest({
      user: { isAdmin: false }
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res._getJSONData()).toEqual({ message: 'Access denied' });
  });

  it('should respond with 403 status and error message if there is no user', () => {
    const req = httpMocks.createRequest({
      user: undefined
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res._getJSONData()).toEqual({ message: 'Access denied' });
  });

  it('should call next() if user is an admin in a nested request', () => {
    const req = httpMocks.createRequest({
      user: { isAdmin: true },
      params: { nested: 'true' }
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
