module.exports = (sequelize, DataTypes) => {
    // Initialise Schema
    const Magazine = sequelize.define('Magazines', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            type: DataTypes.STRING
        },
        website: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: true,
        tableName: 'Magazines',
        paranoid: false,
        underscored: false,
    });

    Magazine.associate = models => {
        Magazine.hasMany(models.Competitions, {
            foreignKey: 'magazineID'
        });
    };

    return Magazine;
};