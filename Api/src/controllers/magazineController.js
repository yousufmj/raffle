import { Magazines } from "models";
import { winston } from "logging/winston";
import { isSuccess, isFailure } from "utils/responses";
import { Sequelize } from "sequelize";

module.exports = {
  /**
   * Get and all available magazines
   * @return {object} return an array of objects containing all magazines
   */
  listMagazines: (req, res) => {
    Magazines.findAll({
      attributes: ["id", "name", "website"]
    })
      .then(results => {
        winston.info("successfully returned results count: " + results.length);

        res.httpCode = 200;
        isSuccess(res, undefined, results);
      })
      .catch(error => {
        winston.error(error);

        let errorMessage = "Error finding results";
        res.httpCode = 400;
        isFailure(res, errorMessage);
      });
  },
  /**
   * Create a new Magazine using POST
   * @param {object} req.body containing values for a new entry
   * @example {req.body} { "Name": "Crafts", "Website": "crafts.com"}
   * @returns {object} returns success message and id of new field
   */
  createMagazine: (req, res) => {
    //  check db for unique and create
    Magazines.findOrCreate({
      where: {
        name: req.body.name,
        website: req.body.website
      }
    })
      .spread((results, created) => {
        if (created === false)
          return Promise.reject("entry exists - not created");

        winston.info(results);

        let message = "Successfully Created new entry";
        res.httpCode = 201;
        let id = {
          id: results.id,
          Name: results.name,
          Website: results.website
        };

        isSuccess(res, message, id);
      })
      .catch(error => {
        winston.error(error);
        let errorMessage = "Unable to create new entry";
        res.httpCode = 400;
        isFailure(res, errorMessage);
      });
  },
  /**
   * update a Magazine
   * @param {object} req.body -  containing values that need to be updated
   * @example {req.body} { "Name": "Crafts2", "Website": "crafts2.com"}
   * @returns {object} returns success message
   */
  updateMagazine: (req, res) => {
    Magazines.findById(req.params.id)
      // check if entry exists
      .then(results => {
        if (!results) return Promise.reject("Not Found");

        return Magazines.update(req.body, {
          where: { id: req.params.id }
        });
      })

      // update entry if exists
      // update method returns array of affected values
      // if true will just return 1, else will reject, so not passing any returned values
      .spread(() => {
        winston.info("updated Magazine with id " + req.params.id);

        res.httpCode = 204;
        isSuccess(res);
      })

      .catch(error => {
        winston.error("updating Magazine Error", { error });

        let errorMessage = "Error With Updating";
        res.httpCode = 400;
        isFailure(res, errorMessage);
      });
  },
  /**
   * Delete specified magazine
   * @param {int} id - id passed from url parameter
   * @returns {object} returns 200
   */
  deleteMagazine: (req, res) => {
    Magazines.destroy({
      where: { id: req.params.id }
    })
      .then(affectedRows => {
        if (affectedRows <= 0) return Promise.reject("Not Found");

        winston.info("Successfully Deleted");

        res.httpCode = 204;
        isSuccess(res);
      })
      .catch(error => {
        winston.error(error);

        if (error == "Not Found") {
          res.httpCode = 404;
          return isFailure(res);
        }

        let errorMessage = "Something Went Wrong";
        res.httpCode = 400;
        isFailure(res, errorMessage);
      });
  },
  /**
   * Get and display specified magazine
   * @param {int} id - id passed from url parameter
   * @returns {object} returns all field that match specified id
   */
  getMagazine: (req, res) => {
    Magazines.findById(req.params.id)
      .then(results => {
        if (!results) return Promise.reject("Not found");

        winston.info("get Magazine by id " + req.params.id, { results });

        isSuccess(res, undefined, results);
      })
      .catch(error => {
        winston.error("getMagazine", { error });

        if (error == "Not found") {
          res.httpCode = 204;
          return isFailure(res);
        }

        let errorMessage = "Internal Server Error";
        res.httpCode = 500;
        isFailure(res, errorMessage);
      });
  },
  /**
   *Check All url query params and build a search query
   @param {object} params - search parameters
   @returns {object} - sequelize where object
   */
  query: params => {
    const name = params.name;

    const Op = Sequelize.Op;
    let search = {};

    if (name) {
      search.name = {
        [Op.like]: "%" + name + "%"
      };
    }

    return search;
  }
};
