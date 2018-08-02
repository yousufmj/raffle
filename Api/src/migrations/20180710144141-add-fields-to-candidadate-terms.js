'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('CandidateTerms', 'other', Sequelize.STRING);
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('CandidateTerms', 'other');
  }
};
