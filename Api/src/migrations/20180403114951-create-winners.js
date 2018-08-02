'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Winners', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
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
            entryID: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Entries',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            competitionID: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Competitions',
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
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()')
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Winners');
    }
};