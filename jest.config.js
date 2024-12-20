module.exports = {
    // Указывает окружение для тестов. В случае тестирования серверной части используется "node".
    testEnvironment: 'node',
  
    // Указывает директории или файлы, которые будут игнорироваться при запуске тестов.
    testPathIgnorePatterns: ['/node_modules/'],
  
    // Автоматически очищает моки перед каждым тестом.
    clearMocks: true,
  
    // Указывает, где сохранять отчёты о покрытии кода.
    coverageDirectory: 'coverage',
  
    // Указывает, какие файлы включать для покрытия кода.
    collectCoverageFrom: ['**/controllers/**/*.js', '**/models/**/*.js'],
  
    // Опционально: Массив расширений модулей, которые Jest должен поддерживать.
    moduleFileExtensions: ['js', 'json', 'node'],
  
    // Позволяет использовать алиасы для путей (например, для более удобных импортов).
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1',
    },
    testTimeout: 20000,
    // Позволяет выводить больше информации о процессе тестирования.
    verbose: true,
  };
  