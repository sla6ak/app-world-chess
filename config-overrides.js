const path = require('path');

module.exports = function override(config, env) {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@components': path.resolve(__dirname, 'src/components'),
    '@helpers': path.resolve(__dirname, 'src/helpers'),
    '@layouts': path.resolve(__dirname, 'src/layouts'),
    '@redux': path.resolve(__dirname, 'src/redux'),
    '@views': path.resolve(__dirname, 'src/views'),
  };

  return config;
};

module.exports.jest = function jestConfig(config) {
  config.moduleNameMapper = {
    ...config.moduleNameMapper,
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@helpers/(.*)$': '<rootDir>/src/helpers/$1',
    '^@layouts/(.*)$': '<rootDir>/src/layouts/$1',
    '^@redux/(.*)$': '<rootDir>/src/redux/$1',
    '^@views/(.*)$': '<rootDir>/src/views/$1',
  };

  // Allow ESM modules in @reduxjs/toolkit to be transformed by Jest
  config.transformIgnorePatterns = [
    '/node_modules/(?!@reduxjs/toolkit)',
  ];

  return config;
};
