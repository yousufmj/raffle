'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('CandidateTerms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      magazineID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Magazines',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      candidateID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Candidates',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      termID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Terms',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP()')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()'
        )
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('CandidateTerms');
  }
};
