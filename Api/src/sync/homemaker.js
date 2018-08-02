import { Sequelize } from 'sequelize';
import minimist from 'minimist';
import { winston } from '../logging/winston';
import { upload } from '../controllers/uploadController';

const myriad = new Sequelize('hm_ga18_', 'hm_ga_ad52', '55z^?6Q1FdIqo#C<', {
  host: 'www.homemakermagazine.co.uk',
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

const tableName = 'data';
const site_id = 9;
let args = minimist(process.argv.slice(2));

const startDate = args.s;
const endDate = args.f;

const betweenDates = `time between '${startDate}' and '${endDate}'`;

/**
 * Get all comp entries within myriad db
 * @param {number} limit - the limit for SQL query
 * @param {number} offset - offset for SQL query
 * @returns {Array} an array of data entries
 */
const getAllEntries = (limit, offset) => {
  const fields = `first_name as firstName,
    surname as lastName,
    address1,
    address2,
    town,
    county,
    postcode,
    time,
    email,
    competition,
    apl_post,
    apl_phone,
    apl_email,
    apl_mms,
    third_post,
    third_phone,
    third_email,
    third_mms,
    time as createdAt,
    questionone as answer1,
    questiontwo as answer2`;

  const query = `select ${fields} from ${tableName}
  where ${betweenDates} and competition != ''
  order by id ASC LIMIT ${offset}, ${limit}`;

  return myriad
    .query(query, {
      raw: true,
      type: Sequelize.QueryTypes.SELECT
    })
    .then(results => {
      winston.info({
        message: 'get all entries from myriad',
        label: 'SYNC:HomeMaker',
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
        label: 'SYNC:HomeMaker',
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

      // add other section for terms and conditions
      element.other = {
        apl_post: element.apl_post,
        apl_phone: element.apl_phone,
        apl_email: element.apl_email,
        apl_mms: element.apl_mms,
        third_post: element.third_post,
        third_phone: element.third_phone,
        third_email: element.third_email,
        third_mms: element.third_mms
      };

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

    return details;
  } catch (error) {
    winston.error({
      label: 'SYNC:HomeMaker',
      message: 'error in try catch',
      error
    });
  }
};

const rowCounts = () => {
  const query = `SELECT COUNT(*) as rows from ${tableName}
  where ${betweenDates} and competition != ''`;

  return myriad
    .query(query, {
      raw: true,
      type: Sequelize.QueryTypes.SELECT
    })
    .then(results => {
      winston.info({
        message: 'count rows from myriad',
        label: 'SYNC:HomeMaker',
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
      label: `SYNC:sqlParameters`,
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
      label: 'SYNC:HomeMaker',
      message: 'error in try catch',
      error
    });
    return Promise.reject(error);
  }
};

// Get all data required then sync it
const scriptStart = process.hrtime();

createData()
  .then(results => {
    return {
      magazineID: 2,
      syncData: results
    };
  })
  .then(upload)
  .then(results => {
    const scriptEnd = process.hrtime(scriptStart);
    winston.info({
      label: `SYNC:HomeMaker`,
      message: `sync completed in ${scriptEnd[0]}s`,
      results
    });
  })
  .catch(error => {
    winston.error({
      label: `SYNC:HomeMaker`,
      message: `Error in creating data`,
      error
    });
  });
