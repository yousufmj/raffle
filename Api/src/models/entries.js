module.exports = (sequelize, DataTypes) => {
  // Initialise Schema
  const Entries = sequelize.define(
    'Entries',
    {
      answer1: {
        type: DataTypes.STRING
      },
      answer2: {
        type: DataTypes.STRING
      },
      answer3: {
        type: DataTypes.STRING
      },
      answer4: {
        type: DataTypes.STRING
      },
      entryMethod: {
        type: DataTypes.STRING
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
      candidateID: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Candidates',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      }
    },
    {
      timestamps: true,
      tableName: 'Entries',
      paranoid: false,
      underscored: false
    }
  );

  Entries.associate = models => {
    Entries.hasMany(models.Winners, {
      foreignKey: 'entryID'
    });

    Entries.belongsTo(models.Competitions, {
      foreignKey: 'competitionID'
    });
  };

  return Entries;
};
