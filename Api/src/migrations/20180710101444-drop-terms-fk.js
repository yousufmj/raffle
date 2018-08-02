'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Entries', 'termID');
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.addColumn('Entries', 'termID', Sequelize.INTEGER);
  }
};
