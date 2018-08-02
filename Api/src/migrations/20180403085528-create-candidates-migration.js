'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Candidates', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            firstName: {
                type: Sequelize.STRING
            },
            lastName: {
                type: Sequelize.STRING
            },
            address1: {
                type: Sequelize.STRING
            },
            address2: {
                type: Sequelize.STRING
            },
            postcode: {
                type: Sequelize.STRING(11)
            },
            email: {
                type: Sequelize.STRING
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
        return queryInterface.dropTable('Candidates');
    }
};