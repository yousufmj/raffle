module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Competitions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            title: {
                type: Sequelize.STRING
            },
            issue: {
                type: Sequelize.INTEGER
            },
            description: {
                type: Sequelize.TEXT
            },
            startDate: {
                type: Sequelize.DATE
            },
            expiryDate: {
                type: Sequelize.DATE
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
        return queryInterface.dropTable('Competitions');
    }
};