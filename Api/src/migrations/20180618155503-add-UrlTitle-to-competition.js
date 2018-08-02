'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    queryInterface.addColumn(
      'Competitions',
      'urlTitle',
      Sequelize.STRING
    )
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Competitions', 'urlTitle')
  }
};
