import { sequelize, Sequelize } from '../dbConnection';

const models = {
  Entries: sequelize.db.import('./entries'),
  Competitions: sequelize.db.import('./competitions.js'),
  Magazines: sequelize.db.import('./magazines.js'),
  Terms: sequelize.db.import('./terms.js'),
  Winners: sequelize.db.import('./winners.js'),
  Candidates: sequelize.db.import('./candidates.js'),
  CandidateTerms: sequelize.db.import('./candidateTerms.js'),
  Staff: sequelize.db.import('./staff.js')
};

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
