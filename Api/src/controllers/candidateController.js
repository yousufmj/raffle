import {
  Candidates,
  Entries,
  Competitions,
  Magazines,
  CandidateTerms,
  Terms
} from 'models';
import { winston } from 'logging/winston';
import { isSuccess, isFailure } from 'utils/responses';
import { capitalise } from 'utils/helpers';
import { Sequelize, sequelize } from 'models';

module.exports = {
  /**
   * Get and display specified Competition
   * @param {object} req - request from express handler
   * @param {object} res - response from express handler
   * @returns {object} returns all field that match specified id
   */
  create: (req, res) => {
    // Sanitization before insert
    req.body.firstName = capitalise(req.body.firstName);
    req.body.lastName = capitalise(req.body.lastName);

    checkCandidate(req.body)
      .then(user => {
        if (user == 'Not Found') return createCandidate(req.body);

        return {
          candidateID: user.id,
          req: req.body
        };
      })
      .then(checkEntry)
      .then(createEntry)
      .then(results => {
        const magazineID = req.body.magazineID;
        const candidateID = results[0].candidateID;

        // update user terms and conditions
        return updateTerms(req.body.terms, magazineID, candidateID)
          .then(response => {
            let message = 'Successfully added new entry';
            res.httpCode = 201;
            return isSuccess(res, message, results[0]);
          })
          .catch(error => {
            winston.error({
              label: `Candidate:checkCandidate:updateTerms`,
              message: `error update terms`,
              error
            });
            return Promise.reject(error);
          });
      })
      .catch(error => {
        if (error.message == 'Candidate already Entered') {
          res.httpCode = 409;
          return isFailure(res, error);
        }

        let errorMessage = 'Unable to add Entry';
        res.httpCode = 400;

        isFailure(res, errorMessage);
      });
  },
  /**
   * Build a query to search for candidate info
   * @param {object} param - The GET search parameters
   * @return {object} - A search object fir for sequelize
   */
  query: params => {
    const fullName = params.fullName;
    const answer1 = params.answer1;
    const entryMethod = params.entryMethod;
    const competitionID = params.competitionID;
    const candidateID = params.candidateID;
    const Op = Sequelize.Op;
    let search = {};

    if (fullName) {
      search.fullName = {
        [Op.like]: '%' + fullName + '%'
      };
    }

    if (answer1) {
      search.answer1 = answer1;
    }

    if (entryMethod) {
      search.entryMethod = entryMethod;
    }

    if (competitionID) {
      search.competitionID = competitionID;
    }

    if (candidateID) {
      search.candidateID = candidateID;
    }

    return search;
  },
  /**
   * Build a query to search for candidate info
   * @param {object} param - The GET search parameters
   * @return {object} - A search object fir for sequelize
   */
  userQuery: params => {
    const fullName = params.fullName;
    const address1 = params.address1;
    const postcode = params.postcode;
    const email = params.email;
    const Op = Sequelize.Op;
    let search = {};

    if (params[0]) {
      const idArray = Object.keys(params).map(i => params[i]);
      search.id = idArray;
    }

    if (fullName) {
      search.fullName = {
        [Op.like]: '%' + fullName + '%'
      };
    }

    if (address1) {
      search.address1 = {
        [Op.like]: '%' + address1 + '%'
      };
    }

    if (postcode) {
      search.postcode = {
        [Op.like]: '%' + postcode + '%'
      };
    }
    if (email) {
      search.email = {
        [Op.like]: '%' + email + '%'
      };
    }

    return search;
  },
  exportPretty: async (req, res) => {
    const filter = req.query.filter ? JSON.parse(req.query.filter) : '';
    const competitionID = filter.competitionID;
    let search = {};
    if (competitionID) search.competitionID = competitionID;

    let transaction;

    try {
      // get transaction
      transaction = await sequelize.db.transaction();

      const allEntries = await Entries.findAll({
        where: search
      });

      let i = 0;
      const iMax = allEntries.length;
      let combinedResults = [];
      for (; i < iMax; i++) {
        const element = allEntries[i];

        const candidateDetails = await Candidates.findOne({
          where: {
            id: element.candidateID
          }
        });

        const competitionDetails = await Competitions.findOne({
          where: {
            id: element.competitionID
          }
        });

        const magazineDetails = await Magazines.findOne({
          where: {
            id: competitionDetails.magazineID
          }
        });

        const agreedTerms = await CandidateTerms.findAll({
          where: {
            candidateID: candidateDetails.id
          },
          include: [Terms]
        });

        const newsletter = agreedTerms.some(
          item => item.Term.title === 'Newsletter'
        );
        const thirdParty = agreedTerms.some(
          item => item.Term.title === 'Third Party'
        );

        const joinDetails = {
          firstName: candidateDetails.firstName,
          lastName: candidateDetails.lastName,
          address1: candidateDetails.address1,
          address2: candidateDetails.address2,
          postcode: candidateDetails.postcode,
          email: candidateDetails.email,
          magazine: magazineDetails.name,
          terms: 'yes',
          answer1: element.answer1,
          answer2: element.answer2,
          entryMethod: element.entryMethod
        };

        joinDetails.thirdParty = thirdParty ? 'yes' : '';
        joinDetails.newsletter = newsletter ? 'yes' : '';

        if (filter.terms == 'thirdParty' && thirdParty) {
          combinedResults.push(joinDetails);
        }

        if (filter.terms == 'newsletter' && newsletter) {
          combinedResults.push(joinDetails);
        }

        if (filter.terms != 'newsletter' && filter.terms != 'thirdParty') {
          combinedResults.push(joinDetails);
        }
      }

      // commit
      await transaction.commit();

      return Promise.resolve(combinedResults);
    } catch (err) {
      await transaction.rollback();
      return Promise.reject(err);
    }
  }
};

/**
 * Check if the user exists in db
 * @param {object} requestBody - request body from POST
 * @returns {string} - returns Not Found if user cannot be found
 * @returns {object} - returns user details found from the db
 */
const checkCandidate = requestBody => {
  return Candidates.findAll({
    where: {
      firstName: requestBody.firstName,
      lastName: requestBody.lastName,
      email: requestBody.email
    }
  })
    .then(results => {
      if (results.length <= 0) {
        winston.info({
          label: `Candidate:checkCandidate`,
          message: `No user found. creating new`,
          results
        });

        return Promise.resolve('Not Found');
      }

      return results[0];
    })
    .catch(error => {
      winston.error({
        label: `Candidate:checkCandidate`,
        message: `checkError`,
        error
      });

      return Promise.reject('Error With finding user');
    });
};

/**
 *  Create a new user if doesn't exist
 * @param {object} requestBody - request body from POST
 * @returns {object} - returns candidateID, and passes along request body
 * @example {candidateID: 10, req: {name:test}}
 */
const createCandidate = requestBody => {
  const address2 = requestBody.address2 || '';
  const name = `${requestBody.firstName} ${requestBody.lastName}`;

  // define fields for new user
  const userFields = {
    firstName: requestBody.firstName,
    lastName: requestBody.lastName,
    address1: requestBody.address1,
    address2: address2,
    postcode: requestBody.postcode,
    email: requestBody.email,
    fullName: name
  };

  if (requestBody.createdAt) userFields.createdAt = requestBody.createdAt;

  // create a new user
  return Candidates.findOrCreate({
    where: userFields
  })
    .then(results => {
      winston.info({
        label: `Candidate:createCandidate`,
        message: `Successfully created a new user`,
        results
      });

      // just return user id
      return Promise.resolve({ candidateID: results[0].id, req: requestBody });
    })
    .catch(error => {
      winston.error({
        label: `Candidate:createCandidate`,
        message: `Unable to create user through candidates`,
        error
      });

      return Promise.reject('Unable to create new entry');
    });
};

/**
 * Create a new candidate entry
 * @param {object} userDetails - Object containing all relevant user information
 * @returns {object} - information about the new entry
 */
const createEntry = userDetails => {
  let fields = {
    answer1: userDetails.req.answer1,
    answer2: userDetails.req.answer2,
    answer3: userDetails.req.answer3,
    answer4: userDetails.req.answer4,
    entryMethod: userDetails.req.entryMethod,
    competitionID: userDetails.req.competitionID,
    candidateID: userDetails.candidateID
  };

  return Entries.findOrCreate({
    where: fields
  })
    .then(results => {
      winston.info({
        label: `Candidate:createEntry`,
        message: `Create new entry`,
        results
      });

      return Promise.resolve(results);
    })
    .catch(error => {
      winston.error({
        label: `Candidate:createEntry`,
        message: `error with creating new entry`,
        error
      });
      return Promise.reject(error);
    });
};

/**
 * Check If an entry exists for specific user
 * @param {object} userDetails - Object containing all relevant user information
 * @returns {object} - userDetails that where passed in if no entry exists
 */
const checkEntry = userDetails => {
  winston.info({
    label: `Candidate:checkEntry`,
    message: `entry details`,
    results: userDetails
  });
  return Entries.findAll({
    where: {
      candidateID: userDetails.candidateID,
      competitionID: userDetails.req.competitionID
    }
  })
    .then(results => {
      winston.info({
        label: `Candidate:checkEntry`,
        message: `check if entry exists`,
        results
      });

      if (results.length > 0) {
        return Promise.reject({
          message: 'Candidate already Entered',
          candidateID: userDetails.candidateID
        });
      }

      return Promise.resolve(userDetails);
    })
    .catch(error => {
      winston.error({
        label: `Candidate:checkEntry`,
        message: `error with checking entry`,
        error
      });
      return Promise.reject(error);
    });
};

/**
 * Create a new candidate entry
 * @param {object[]} terms - array with all aggreed terms
 * @param {string} magazineID - Id of relevant magazine
 * @param {string} candidateID - Id of relevant candidate
 * @returns {object} - information about the new entry
 */
const updateTerms = async (allTerms, magazineID, candidateID) => {
  let transaction;

  //Incorrect method but for now hardcoding terms IDS
  const termsDefinition = {
    newsletter: 2,
    terms: 1,
    other: 4,
    thirdParty: 3
  };

  try {
    let i = 0;
    const iMax = allTerms.length;
    await CandidateTerms.destroy({
      where: {
        candidateID,
        magazineID
      }
    });

    for (; i < iMax; i++) {
      const element = allTerms[i];
      transaction = await sequelize.db.transaction();

      await CandidateTerms.findOrCreate({
        where: {
          candidateID,
          termID: termsDefinition[element],
          magazineID,
          other: element.other
        }
      });
      await transaction.commit();
    }

    return Promise.resolve('Successfully Updated Terms');
  } catch (error) {
    await transaction.rollback();

    winston.error({
      label: `Candidate:Terms`,
      message: `Error Updated Terms`,
      error
    });

    return Promise.reject(error);
  }
};
