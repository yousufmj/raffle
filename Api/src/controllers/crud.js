import { winston } from 'logging/winston';
import { isSuccess, isFailure } from 'utils/responses';

module.exports = {
  /**
   * Get and list all values for desired Model
   * @param {object} req - The express request object
   * @param {object} res - The express response object
   * @param {string[]} attributes - Array of column names to search by
   * @param {object} model - Sequelize model object
   * @param {string=} modelName - Name of Sequelize model
   * @return {object} return an array of objects containing all values
   */
  listAll: (req, res, attributes, model, modelName) => {
    model
      .findAll({
        attributes
      })
      .then(results => {
        winston.info(
          modelName +
            ':listAll - successfully returned results count: ' +
            results.length
        );
        winston.info({
          label: `${modelName}:listAll`,
          message: `successfully returned results count: ${results.length}`
        });

        res.httpCode = 200;
        isSuccess(res, undefined, results);
      })
      .catch(error => {
        let errorMessage = 'Error finding results';
        winston.error({
          label: `${modelName}:listAll`,
          message: errorMessage,
          error
        });

        res.httpCode = 400;
        isFailure(res, errorMessage);
      });
  },

  /**
   * Create a new entry for the desired Model
   * @param {object} req - The express request object
   * @param {object} res - The express response object
   * @param {object} where - Array of column names for search and create
   * @param {object} model - Sequelize model object
   * @param {string=} modelName - Name of Sequelize model
   * @return {object} return an array of objects containing all values
   */
  create: (req, res, where, model, modelName) => {
    //  check db for unique and create
    model
      .findOrCreate(where)
      .spread((results, created) => {
        if (created === false) return Promise.reject('exists');

        let message = 'Successfully Created new entry';
        winston.info({
          label: `${modelName}:Create`,
          message,
          results
        });

        res.httpCode = 201;
        let id = {
          id: results.id,
          Name: results.name,
          Website: results.website
        };

        isSuccess(res, message, id);
      })
      .catch(error => {
        if (error == 'exists') {
          let errorMessage = 'Entry already exists, unable to create';
          winston.error({
            label: `${modelName}:Create`,
            message: errorMessage,
            error
          });

          res.httpCode = 409;
          return isFailure(res, errorMessage);
        }

        let errorMessage = 'Unable to create new entry';
        winston.error({
          label: `${modelName}:Create`,
          message: errorMessage,
          error
        });

        res.httpCode = 400;
        isFailure(res, errorMessage);
      });
  },

  /**
   * Update an entry from desired model
   * @param {object} req - The express request object
   * @param {object} res - The express response object
   * @param {object} model - Sequelize model object
   * @param {string=} modelName - Name of Sequelize model
   * @return {object} return an array of objects containing all values
   */
  update: (req, res, model, modelName) => {
    model
      .update(req.body, {
        where: { id: req.params.id }
      })

      // update entry if exists
      // update method returns array of affected values
      .spread(() => {
        winston.info({
          label: '${modelName}:Update',
          message: `updated entry with id ${req.params.id}`
        });

        res.httpCode = 204;
        isSuccess(res);
      })

      .catch(error => {
        winston.error({
          label: `${modelName}:`,
          message: `updating error with id ${req.params.id}`,
          error
        });

        let errorMessage = 'Error With Updating';
        res.httpCode = 400;
        isFailure(res, errorMessage);
      });
  },

  /**
   * Get and list all values for selected Model
   * @param {object} req - The express request object
   * @param {object} res - The express response object
   * @param {string[]} attributes - Array of column names to search by
   * @param {object} model - Sequelize model object
   * @param {string=} modelName - Name of Sequelize model
   * @return {object} return an array of objects containing all values
   */
  deleteOne: (req, res, model, modelName) => {
    model
      .destroy({
        where: { id: req.params.id }
      })
      .then(affectedRows => {
        if (affectedRows <= 0) return Promise.reject('Not Found');

        winston.info({
          label: `${modelName}:DeleteOne`,
          message: `Successfully Deleted entry with id: ${req.params.id}`
        });

        res.httpCode = 204;
        return isSuccess(res);
      })
      .catch(error => {
        winston.error({
          label: `${modelName}:DeleteOne`,
          message: `Error Deleing with id: ${req.params.id}`,
          error
        });

        if (error == 'Not Found') {
          res.httpCode = 404;
          return isFailure(res);
        }

        let errorMessage = 'Something Went Wrong';
        res.httpCode = 400;
        isFailure(res, errorMessage);
      });
  },

  /**
   * Get and list all values for selected Model
   * @param {object} req - The express request object
   * @param {object} res - The express response object
   * @param {string[]} attributes - Array of column names to search by
   * @param {object} model - Sequelize model object
   * @param {string=} modelName - Name of Sequelize model
   * @return {object} return an array of objects containing all values
   */
  deleteMany: (req, res, model, modelName) => {
    const filter = JSON.parse(req.query.filter);

    model
      .destroy({
        where: { id: filter.id }
      })
      .then(affectedRows => {
        if (affectedRows <= 0) return Promise.reject('Not Found');

        winston.info({
          label: `${modelName}:DeleteMany`,
          message: `Successfully Deleted entries with ids: ${filter.id}`
        });

        res.httpCode = 204;
        isSuccess(res);
      })
      .catch(error => {
        winston.error({
          label: `${modelName}:DeleteMany`,
          message: `Error deleting is: ${filter.id}`,
          error
        });

        if (error == 'Not Found') {
          res.httpCode = 404;
          return isFailure(res);
        }

        let errorMessage = 'Something Went Wrong';
        res.httpCode = 400;
        isFailure(res, errorMessage);
      });
  },

  /**
   * Get and list all values for selected Model
   * @param {object} req - The express request object
   * @param {object} res - The express response object
   * @param {object} model - Sequelize model object
   * @param {string=} modelName - Name of Sequelize model
   * @param {string[]} attributes - Array of column names to search by
   * @return {object} return an array of objects containing all values
   */
  findOne: (req, res, model, modelName, attributes) => {
    model
      .findOne({
        where: {
          id: req.params.id
        },
        attributes
      })
      .then(results => {
        if (!results) return Promise.reject('Not found');

        winston.info({
          label: `${modelName}:FindOne`,
          message: `Find by ID: ${req.params.id}`,
          results
        });

        isSuccess(res, undefined, results);
      })
      .catch(error => {
        winston.error({
          label: `${modelName}:FindOne`,
          message: `Error finding id: ${req.params.id}`,
          error
        });

        if (error == 'Not found') {
          res.httpCode = 204;
          return isFailure(res);
        }

        let errorMessage = 'Internal Server Error';
        res.httpCode = 500;
        isFailure(res, errorMessage);
      });
  },

  /**
   * Get All results from model accepting search params
   * @param {object} req - The express request object
   * @param {object} res - The express response object
   * @param {object} model - Sequelize model object
   * @param {string=} modelName - Name of Sequelize model
   * @param {string[]} attributes - Array of column names to search by
   * @return {object} return an array of objects containing all values
   */
  getMany: (req, res, model, modelName, query) => {
    // define search filters
    const sort = req.query.sort ? JSON.parse(req.query.sort) : ['id', 'DESC'];
    const page = req.query.page ? JSON.parse(req.query.page) : 1;
    const defaultPerPage = 5000;
    const perPage = req.query.perPage
      ? JSON.parse(req.query.perPage)
      : defaultPerPage;
    const offset = page != 1 ? (page - 1) * perPage : 0;

    return model
      .findAndCountAll({
        where: query,
        limit: perPage,
        order: [[sort[0], sort[1]]],
        offset: offset
      })
      .then(results => {
        winston.info({
          label: `${modelName}:GetMany`,
          message: `Search ${modelName}: count: ${results.count}`
        });

        if (results.count < 1) {
          res.httpCode = 204;
          return isSuccess(res);
        }

        isSuccess(res, undefined, results);
      })
      .catch(error => {
        winston.error({
          label: `${modelName}:GetMany`,
          message: `Search ${modelName} error`,
          error
        });

        res.httpCode = 500;
        isFailure(res);
      });
  }
};
