module.exports = (sequelize, DataTypes) => {
    // Initialise Schema
    const Candidates = sequelize.define('Candidates', {
        firstName: {
            type: DataTypes.STRING
        },
        lastName: {
            type: DataTypes.STRING
        },
        address1: {
            type: DataTypes.STRING
        },
        address2: {
            type: DataTypes.STRING
        },
        postcode: {
            type: DataTypes.STRING(8)
        },
        email: {
            type: DataTypes.STRING
        },
        fullName: {
            type: DataTypes.STRING
        }

    }, {
        timestamps: true,
        tableName: 'Candidates',
        paranoid: false,
        underscored: false,
    });

    Candidates.associate = models => {
        // associations can be defined here

        Candidates.hasMany(models.Winners, {
            foreignKey: 'candidateID'
        });

        Candidates.hasMany(models.Entries, {
          foreignKey: 'candidateID'
      });

    };


    return Candidates;
};