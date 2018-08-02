import { Candidates, Entries, Winners } from 'models';
import { winston } from 'logging/winston';
import { isSuccess, isFailure } from 'utils/responses';
import { Sequelize, sequelize } from 'models';

module.exports = {
  /**
   * Get and display specified Competition
   * @param {int} id - id passed from url parameter
   * @returns {object} returns all field that match specified id
   */
  query: params => {
    const title = params.title;
    const urlTitle = params.urlTitle;
    const issue = params.issue;
    const magazineID = params.magazineID;
    const description = params.description;
    const startDate = params.startDate;
    const expiryDate = params.expiryDate;

    const Op = Sequelize.Op;
    let search = {};

    if (title) {
      search.title = {
        [Op.like]: '%' + title + '%'
      };
    }

    if (urlTitle) {
      search.urlTitle = urlTitle;
    }

    if (magazineID) {
      search.magazineID = magazineID;
    }

    if (issue) {
      search.issue = issue;
    }

    if (description) {
      search.description = {
        [Op.like]: '%' + description + '%'
      };
    }

    // date check
    if (startDate && expiryDate) {
      search.startDate = {
        [Op.gt]: startDate
      };
      search.expiryDate = {
        [Op.lt]: expiryDate
      };
    } else if (expiryDate) {
      search.expiryDate = {
        [Op.lt]: expiryDate
      };
    } else if (startDate) {
      search.startDate = {
        [Op.gt]: startDate
      };
    }

    return search;
  },

  /**
   * find winner(s) for specified competition
   * @param {int} id - id passed from url parameter
   * @returns {object} returns all field that match specified id
   */
  selectWinner: async (req, res) => {
    const Op = Sequelize.Op;
    let winnerAmount = req.body.amount || 1;
    let i = 0;
    const iMax = winnerAmount;
    let transaction;

    try {
      for (; i < iMax; i++) {
        // start sequelize transaction
        transaction = await sequelize.db.transaction();
        const getWinners = await Winners.findAll(
          {
            where: {
              competitionID: req.params.id
            }
          },
          { transaction }
        );

        // Get all Ids of Current Winner
        let winnerIDs = getWinners.map(data => {
          return data.candidateID;
        });

        // Get all Entries excluding winning candidates
        const getEntries = await Entries.findAll(
          {
            where: {
              competitionID: req.params.id,
              candidateID: {
                [Op.notIn]: winnerIDs
              }
            },
            attributes: ['id', 'candidateID', 'competitionID']
          },
          { transaction }
        );

        const selectWinner = await findWinner(getEntries);
        const createWinner = await addWinner(selectWinner);

        // commit transaction
        await transaction.commit();
      }
      isSuccess(res, 'success');
    } catch (error) {
      // rollback transactions if there are eny errors
      await transaction.rollback();

      const errorMessage = 'Error with selecting winner';
      winston.error({
        label: `Competition:SelectWinner`,
        message: errorMessage,
        error
      });

      isFailure(res, errorMessage);
    }
  }
};

const findWinner = possibleCandidates => {
  const randomWinner =
    possibleCandidates[Math.floor(Math.random() * possibleCandidates.length)];

  return Candidates.findById(randomWinner.candidateID)
    .then(user => {
      winston.info({
        label: `Competitions:FindWinner`,
        message: `Find a winner from entries`,
        results: user
      });

      // create new return object
      const userData = {
        candidateID: user.id,
        entryID: randomWinner.id,
        competitionID: randomWinner.competitionID
      };

      return Promise.resolve(userData);
    })
    .catch(error => {
      winston.error({
        label: `Competitions:FindWinner`,
        message: `error finding winner from entries`,
        error
      });
      return Promise.reject('Error Trying to create a winner');
    });
};

const addWinner = user => {
  return Winners.findOrCreate({
    where: {
      candidateID: user.candidateID,
      competitionID: user.competitionID,
      entryID: user.entryID
    }
  });
};
