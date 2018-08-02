'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    queryInterface.addColumn(
      'Candidates',
      'fullName',
      Sequelize.STRING
    )
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Candidates', 'fullName')
  }
};
