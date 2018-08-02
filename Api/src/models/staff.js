module.exports = (sequelize, DataTypes) => {
  // Initialise Schema
  const Staff = sequelize.define(
    'Staff',
    {
      firstName: {
        type: DataTypes.STRING
      },
      lastName: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING,
        unique: true
      },
      username: {
        type: DataTypes.STRING,
        unique: true
      },
      password: {
        type: DataTypes.STRING
      }
    },
    {
      timestamps: true,
      tableName: 'Staff',
      paranoid: false,
      underscored: false
    }
  );

  return Staff;
};
