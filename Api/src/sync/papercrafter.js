import { Sequelize } from 'sequelize';
import minimist from 'minimist';
import { winston } from '../logging/winston';
import { upload } from '../controllers/uploadController';

const myriad = new Sequelize('pcr_nl984hw', 'pcr_nlad917ju', 'aYzh8$a#^j!k6', {
  host: 'www.papercraftermagazine.co.uk',
  dialect: 'mysql',
  operatorsAliases: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
const express = new Sequelize(
  'expression',
  'exp_root',
  '8cc8EQb7f93cdADSmVHrp',
  {
    host: '185.55.79.138',
    dialect: 'mysql',
    operatorsAliases: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const tableName = 'giveaways';
const site_id = 11;
const magazineID = 5;

let args = minimist(process.argv.slice(2));

const startDate = args.s;
const endDate = args.f;

const betweenDates = `added_on between '${startDate}' and '${endDate}'`;

/**
 * Get all comp entries within myriad db
 * @param {number} limit - the limit for SQL query
 * @param {number} offset - offset for SQL query
 * @returns {Array} an array of data entries
 */
const getAllEntries = (limit, offset) => {
  const fields = `firstname as firstName,
    lastname as lastName,
    address1 as address1,
    address2 as address2,
    town as town,
    county as county,
    postcode,
    email,
    referrer as competition,
    added_on as createdAt,
    third_party as thirdParty,
    terms_condition as terms,
    newsletter as newsletter,
    interest as answer1,
    skills as answer2`;

  const query = `select ${fields} from ${tableName}
  where ${betweenDates} and referrer != ''
  and address1 is not NULL
  order by rowid ASC LIMIT ${offset}, ${limit}`;

  return myriad
    .query(query, {
      raw: true,
      type: Sequelize.QueryTypes.SELECT
    })
    .then(results => {
      winston.info({
        message: 'get all entries from myriad',
        label: 'SYNC:Papercrafter:getAllEntries',
        results
      });

      return Promise.resolve(results);
    })
    .catch(error => Promise.reject(error));
};

/**
 * get competition within HomeMaker Beautiful EE
 * @param {object} entry - the object holding all entry details
 */
const getExpressCompetition = entry => {
  const entryUrl = entry.competition;

  const query = `SELECT title,
    url_title as urlTitle,
    entry_date as startDate,
    expiration_date as expiryDate
    FROM  exp_channel_titles
    where url_title = '${entryUrl}'
    and site_id = ${site_id}`;

  return express
    .query(query, {
      raw: true,
      type: Sequelize.QueryTypes.SELECT
    })
    .then(results => {
      winston.info({
        message: 'Get competition details from EE',
        label: 'SYNC:Papercrafter:getExpressCompetition',
        results
      });

      return Promise.resolve(results);
    })
    .catch(error => Promise.reject(error));
};

/**
 * Format data with entry and competition results
 * @param {number} limit - the limit for SQL query
 * @param {number} offset - offset for SQL query
 * @returns {object[]} - an array objects containing entry and competition
 */
const formatResults = async (limit, offset) => {
  try {
    const search = await getAllEntries(limit, offset);

    let details = [];

    let i = 0;
    const iMax = search.length;
    let allComps = [];

    for (; i < iMax; i++) {
      let element = search[i];

      let competition = [];
      const checkComp =
        allComps[
          allComps.map(item => item.urlTitle).indexOf(element.competition)
        ];

      if (!checkComp) {
        competition = await getExpressCompetition(element);
        if (competition.length > 0) allComps.push(competition[0]);
      } else {
        competition = [checkComp];
      }

      if (competition.length > 0) {
        let combinedFormat = {
          entry: element,
          expressCompetition: competition
        };

        details.push(combinedFormat);
      }
    }

    winston.info({
      label: `SYNC:Papercrafter:formatResults`,
      message: `completed formatting results`
    });
    return details;
  } catch (error) {
    winston.error({
      label: 'SYNC:Papercrafter:formatResults',
      message: 'error in try catch',
      error
    });
  }
};

const rowCounts = () => {
  const query = `SELECT COUNT(*) as rows from ${tableName}
  where ${betweenDates} and referrer != ''
  and address1 is not NULL`;

  return myriad
    .query(query, {
      raw: true,
      type: Sequelize.QueryTypes.SELECT
    })
    .then(results => {
      winston.info({
        message: 'Get competition details from EE',
        label: 'SYNC:Papercrafter',
        results
      });
      return Promise.resolve(results[0].rows);
    })
    .catch(error => Promise.reject(error));
};

/**
 * details to run the loop for sync
 * @returns {Promise} - an object contain increment and total row value
 * @example
 * //returns {increment: 5000, total: 20000}
 */
const sqlParameters = async () => {
  try {
    const count = await rowCounts();
    return {
      total: count,
      increment: 1000
    };
  } catch (error) {
    winston.error({
      label: `SYNC:PaperCrafter:sqlParameters`,
      message: `error getting sql paramaters`,
      error
    });

    return Promise.reject(error);
  }
};

/**
 * Create the sync functionality
 * @param {object} batch - object containing count of rows and increment amount
 */
const createData = async () => {
  try {
    let batch = await sqlParameters();

    const totalRows = batch.total;
    const limit = batch.increment;
    let pages = totalRows / limit;
    let i = 0;
    const iMax = pages;

    // create a loop to assign a competition to an entry
    let data = [];
    for (; i < iMax; i++) {
      const paginate = i + 1;
      const offset = (paginate - 1) * limit;
      const formatted = await formatResults(limit, offset);

      data.push(formatted);
    }

    // merge all the arrays
    let merge = [].concat(...data);
    return merge;
  } catch (error) {
    winston.error({
      label: 'SYNC:Papercrafter',
      message: 'error in try catch',
      error
    });
  }
};

// Get all data required then sync it
const scriptStart = process.hrtime();

createData()
  .then(results => {
    return {
      magazineID,
      syncData: results
    };
  })
  .then(upload)
  .then(results => {
    const scriptEnd = process.hrtime(scriptStart);
    winston.info({
      label: `SYNC:Crafts`,
      message: `sync completed in ${scriptEnd[0]}s`,
      results
    });
  })
  .catch(error => {
    winston.error({
      label: `SYNC:Papercrafter`,
      message: `Error in creating data`,
      error
    });
  });
