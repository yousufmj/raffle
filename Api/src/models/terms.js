module.exports = (sequelize, DataTypes) => {
    // Initialise Schema
    const Terms = sequelize.define('Terms', {
        title: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT
        }
    }, {
        timestamps: true,
        tableName: 'Terms',
        paranoid: false,
        underscored: false,
    });


    return Terms;
};