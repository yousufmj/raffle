import { Winners, Candidates, Entries, Competitions, Magazines } from 'models';
import { Sequelize, sequelize } from 'models';
import { winston } from 'logging/winston';
import { isSuccess, isFailure } from 'utils/responses';

module.exports = {
  /**
   * Search for a winner by competitionID
   * @param {string} req.query.competitionID - query parameter from url
   * @returns {object}  - details of the winner and competition info
   */
  old: (req, res) => {
    const filter = req.query.filter ? JSON.parse(req.query.filter) : '';
    const competitionID = filter.competitionID;
    let search = {};

    if (competitionID) search.competitionID = competitionID;

    Winners.findAll({
      include: [
        {
          model: Entries,
          where: search
        }
      ]
    })
      .then(findUser)
      .then(formatResult)

      .then(results => {
        let message = 'Successfully found winner for: ';
        let winnerResponse;

        if (results.length == 0) {
          res.httpCode = 204;
          isSuccess(res);
        }
        winnerResponse = {
          rows: results,
          count: results.length
        };

        winston.info(message, { results });
        isSuccess(res, undefined, winnerResponse);
      })

      .catch(error => {
        let errorMessage = 'Unable to find Winner';
        res.httpCode = 404;

        winston.error(errorMessage, { error });
        isFailure(res, errorMessage);
      });
  },
  /**
   * Generate a view of winners with all associated tables
   * @param {object} - express request object
   * @param {object} - express response object
   */
  search: async (req, res) => {
    const filter = req.query.filter ? JSON.parse(req.query.filter) : '';
    const competitionID = filter.competitionID;
    const competitionTitle = filter.competitionTitle;

    const Op = Sequelize.Op;
    let search = {};
    let competitionSearch = {};

    if (competitionID) search.competitionID = competitionID;
    if (competitionTitle)
      competitionSearch = {
        title: {
          [Op.like]: `%${competitionTitle}%`
        }
      };

    try {
      const allWinners = await Winners.findAndCountAll({
        include: [
          {
            model: Entries,
            where: search
          },
          {
            model: Candidates
          },
          {
            model: Competitions,
            where: competitionSearch,
            include: [
              {
                model: Magazines
              }
            ]
          }
        ]
      });
      isSuccess(res, 'Found Winners', allWinners);
    } catch (error) {
      let errorMessage = 'Unable to find winners';
      winston.error({
        label: `Winners:Search`,
        message: errorMessage,
        error
      });

      isFailure(res, errorMessage);
    }
  },
  /**
   * Generate a view of relevant winner info with all associated tables
   * @param {object} - express request object
   * @param {object} - express response object
   */
  pretty: async (req, res) => {
    const filter = req.query.filter ? JSON.parse(req.query.filter) : '';
    const competitionID = filter.competitionID;
    let search = {};

    if (competitionID) search.competitionID = competitionID;

    try {
      const allWinners = await Winners.findAll({
        include: [
          {
            model: Entries,
            where: search
          },
          {
            model: Candidates
          },
          {
            model: Competitions,
            include: [
              {
                model: Magazines
              }
            ]
          }
        ]
      });

      const format = formatWinners(allWinners);

      res.json(format);
    } catch (error) {
      res.status.json(error);
    }
  }
};

const formatWinners = winners => {
  let newFormat = [];

  let i = 0;
  const iMax = winners.length;

  for (; i < iMax; i++) {
    const element = winners[i];

    const currentWinner = {
      firstName: element.Candidate.firstName,
      lastName: element.Candidate.lastName,
      email: element.Candidate.email,
      address1: element.Candidate.address1,
      address2: element.Candidate.address2,
      postcode: element.Candidate.postcode,
      competition: element.Competition.title,
      magazine: element.Competition.Magazine.name
    };

    newFormat.push(currentWinner);
  }
  return newFormat;
};

/**
 * Find the winner from the user table
 * @param {object} results - results from the winner table
 * @returns {object} - user details, candidate details, competition details
 */
const findUser = results => {
  winston.info('Found Winner for competition', { results });
  const allIDs = results.map(a => a.candidateID);
  const allEntryIDs = results.map(a => a.entryID);

  return Candidates.findAll({
    where: {
      id: allIDs
    },
    // Join on Candidates
    include: [
      {
        model: Entries,
        where: {
          competitionID: results.competitionID,
          id: allEntryIDs
        },
        required: false,

        // Join on Competitions
        include: [
          {
            model: Competitions,
            where: {
              id: results.competitionID
            }
          }
        ]
      }
    ]
  });
};

/**
 * Format the user results
 * @param {object} user - results from user search
 * @returns {object} - reformatted user information
 */
const formatResult = user => {
  winston.info('formatting user for better response', { user });

  let i = 0;
  const iMax = user.length;
  let allWinners = [];

  for (; i < iMax; i++) {
    let winnerDetails = {
      id: user[i].id,
      firstName: user[i].firstName,
      lastName: user[i].lastName,
      address1: user[i].address1,
      address2: user[i].address2,
      postcode: user[i].postcode,
      email: user[i].email
    };

    // winnerDetails.CompetitionEntry = {
    //   title: user[i].Entries[0].Competition.title,
    //   description: user[i].Entries[0].Competition.description,
    //   answer1: user[i].Entries[0].answer1,
    //   entryMethod: user[i].Entries[0].entryMethod,
    //   selectedDate: user[i].Entries[0].createdAt
    // };

    allWinners.push(winnerDetails);
  }

  // // create main user object
  // let winnerDetails = {
  //     firstName: user.firstName,
  //     lastName: user.lastName,
  //     address1: user.address1,
  //     address2: user.address2,
  //     postcode: user.postcode,
  //     email: user.email,
  // };

  // // new object for competition details
  // winnerDetails.CompetitionEntry = {
  //     title: user.Entries[0].Competition.title,
  //     description: user.Entries[0].Competition.description,
  //     answer1: user.Entries[0].answer1,
  //     entryMethod: user.Entries[0].entryMethod,
  //     selectedDate: user.Entries[0].createdAt
  // };

  return Promise.resolve(allWinners);
};
