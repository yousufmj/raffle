'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Entries', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            answer1: {
                type: Sequelize.STRING
            },
            answer2: {
                type: Sequelize.STRING
            },
            answer3: {
                type: Sequelize.STRING
            },
            answer4: {
                type: Sequelize.STRING
            },
            entryMethod: {
                type: Sequelize.STRING
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
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()')
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Entries');
    }
};