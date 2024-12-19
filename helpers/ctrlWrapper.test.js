const ctrlWrapper = require('./ctrlWrapper');

describe('ctrlWrapper', () => {
  it('should call the passed controller function with req, res, and next', async () => {
    const mockCtrl = jest.fn(async (req, res, next) => {
      res.status(200).json({ message: 'Success' });
    });

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    const wrappedCtrl = ctrlWrapper(mockCtrl);

    await wrappedCtrl(req, res, next);

    expect(mockCtrl).toHaveBeenCalledWith(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Success' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should pass the error to next if the controller throws an error', async () => {
    const mockError = new Error('Controller error');
    const mockCtrl = jest.fn(async () => {
      throw mockError;
    });

    const req = {};
    const res = {};
    const next = jest.fn();

    const wrappedCtrl = ctrlWrapper(mockCtrl);

    await wrappedCtrl(req, res, next);

    expect(mockCtrl).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(mockError);
  });

  it('should handle synchronous errors thrown by the controller', async () => {
    const mockError = new Error('Synchronous error');
    const mockCtrl = jest.fn(() => {
      throw mockError;
    });

    const req = {};
    const res = {};
    const next = jest.fn();

    const wrappedCtrl = ctrlWrapper(mockCtrl);

    await wrappedCtrl(req, res, next);

    expect(mockCtrl).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(mockError);
  });
});
