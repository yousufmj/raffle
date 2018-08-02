import { Sequelize } from 'sequelize';
import config from 'config';

const Op = Sequelize.Op;

const sequelize = {};
const sequelizeConfig = config.get('sequelize');

const databases = Object.keys(sequelizeConfig);
for (let i = 0; i < databases.length; ++i) {
  let database = databases[i];
  let databaseDetails = sequelizeConfig[database];

  sequelize[database] = new Sequelize(
    databaseDetails.database,
    databaseDetails.username,
    databaseDetails.password,
    {
      host: databaseDetails.host,
      port: databaseDetails.port,
      dialect: databaseDetails.dialect,
      operatorsAliases: Op,
      dialectOptions: databaseDetails.dialectOptions,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

module.exports = {
  sequelize: sequelize,
  Sequelize: Sequelize
};
