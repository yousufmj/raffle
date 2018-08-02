module.exports = (sequelize, DataTypes) => {
  var Competitions = sequelize.define(
    'Competitions',
    {
      title: {
        type: DataTypes.STRING
      },
      issue: {
        type: DataTypes.INTEGER
      },
      magazineID: {
        type: DataTypes.INTEGER
      },
      description: {
        type: DataTypes.TEXT
      },
      urlTitle: {
        type: DataTypes.TEXT
      },
      startDate: {
        type: DataTypes.DATE
      },
      expiryDate: {
        type: DataTypes.DATE
      },
      termID: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Terms',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      }
    },
    {
      timestamps: true,
      tableName: 'Competitions',
      paranoid: false,
      underscored: false
    }
  );

  Competitions.associate = models => {
    // associations can be defined here

    Competitions.hasMany(models.Winners, {
      foreignKey: 'competitionID'
    });

    Competitions.hasMany(models.Entries, {
      foreignKey: 'competitionID'
    });

    Competitions.belongsTo(models.Magazines, {
      foreignKey: 'magazineID'
    });
  };

  return Competitions;
};
