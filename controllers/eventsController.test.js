const { getAllEvents } = require('./eventsController');
const { Event } = require('../models/eventModel');
const httpMocks = require('node-mocks-http');
const mongoose = require('mongoose');

jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  model: () => ({
    find: jest.fn(), // Мокируем find метод
  }),
}));

describe('getAllEvents Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('должен вернуть ошибку 500 при сбое базы данных', async () => {
    // Мокаем метод find, чтобы он выбрасывал ошибку
    Event.find.mockRejectedValueOnce(new Error('Database error'));

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    // Вызываем контроллер
    await getAllEvents(req, res);

    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
    console.log("Response data:", responseData); 
    expect(responseData).toEqual({ message: 'Error getting events: Database error' });
  });
});
