const production = require('../../config/production.json').sequelize.db;

module.exports = {
  development: {
    username: 'yousuf',
    password: 'password',
    database: 'comp_handler',
    host: '127.0.0.1',
    dialect: 'mysql'
  },
  test: {
    username: 'yousuf',
    password: 'password',
    database: 'comp_handler',
    host: '127.0.0.1',
    dialect: 'mysql'
  },
  production
};
