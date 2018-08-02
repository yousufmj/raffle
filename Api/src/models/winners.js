module.exports = (sequelize, DataTypes) => {
    // Initialise Schema
    const Winners = sequelize.define('Winners', {
        candidateID: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Candidates',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        },
        competitionID: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Competitions',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        },
        entryID: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Entries',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        },
    }, {
        timestamps: true,
        tableName: 'Winners',
        paranoid: false,
        underscored: false,
    });

    Winners.associate = models => {
        // associations can be defined here

        Winners.belongsTo(models.Candidates, {
            foreignKey: 'CandidateID'
        });

        Winners.belongsTo(models.Entries, {
            foreignKey: 'entryID'
        });

        Winners.belongsTo(models.Competitions, {
            foreignKey: 'competitionID'
        });


    };

    return Winners;
};