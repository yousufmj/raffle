'use strict';
module.exports = (sequelize, DataTypes) => {
  var CandidateTerms = sequelize.define(
    'CandidateTerms',
    {
      magazineID: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Magazines',
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
      tableName: 'CandidateTerms',
      paranoid: false,
      underscored: false
    }
  );

  CandidateTerms.associate = function(models) {
    CandidateTerms.belongsTo(models.Terms, {
      foreignKey: 'termId'
    });

    CandidateTerms.belongsTo(models.Candidates, {
      foreignKey: 'candidateID'
    });

    CandidateTerms.belongsTo(models.Magazines, {
      foreignKey: 'magazineID'
    });
  };
  return CandidateTerms;
};
