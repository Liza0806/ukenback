const { HttpError } = require('./HttpError');

describe('HttpError', () => {
  it('should create an error with a default message for a valid status code', () => {
    const error = HttpError(400);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Bad request');
    expect(error.status).toBe(400);
  });

  it('should create an error with a custom message', () => {
    const customMessage = 'Custom error message';
    const error = HttpError(404, customMessage);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(customMessage);
    expect(error.status).toBe(404);
  });

  it('should create an error with "undefined" message for an invalid status code without a custom message', () => {
    const error = HttpError(999);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('');
    expect(error.status).toBe(999);
  });

  it('should log the message to the console', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const error = HttpError(401);

    expect(consoleSpy).toHaveBeenCalledWith('Unauthorized');
    consoleSpy.mockRestore();
  });

  it('should handle missing status parameter gracefully', () => {
    const error = HttpError();

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('');
  });
});
