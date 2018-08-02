import { Sequelize } from 'sequelize';
import minimist from 'minimist';
import { winston } from '../logging/winston';
import { upload } from '../controllers/uploadController';

const myriad = new Sequelize('myriad', 'cb_myriad', 'vC24NEb6', {
  host: '185.55.79.138',
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

const tableName = 'myr_data';
let args = minimist(process.argv.slice(2));

const startDate = args.s;
const endDate = args.f;

const betweenDates = `database_date between '${startDate}' and '${endDate}'`;

/**
 * Get all comp entries within myriad db
 * @param {number} limit - the limit for SQL query
 * @param {number} offset - offset for SQL query
 * @returns {Array} an array of data entries
 */
const getAllEntries = (limit, offset) => {
  const fields = `MC_firstName as firstName,
    MC_lastName as lastName,
    MC_addI as address1,
    MC_addII as address2,
    MC_town as town,
    MC_county as county,
    postcode,
    email,
    source,
    MC_aplpost,
    MC_aplphone,
    MC_aplemail,
    MC_aplmms,
    MC_thirdpost,
    MC_thirdemail,
    MC_thirdmms,
    database_date as createdAt,
    Marketing_rules,
    competition,
    MC_questionone as answer1,
    MC_questiontwo as answer2,
    device,
    terms_conditons as terms,
    newsletter_optin as newsletter,
    third_party_optin as thirdparty,
    thirdemail,
    submit_desktop,
    submit_mobile`;

  const query = `select ${fields} from myr_data
    where ${betweenDates} and competition != ''
    order by d_id ASC LIMIT ${offset}, ${limit} `;

  return myriad
    .query(query, {
      raw: true,
      type: Sequelize.QueryTypes.SELECT
    })
    .then(results => {
      winston.info({
        message: 'get all entries from myriad',
        label: 'SYNC:CraftsBeautiful',
        results
      });

      return Promise.resolve(results);
    })
    .catch(error => Promise.reject(error));
};

/**
 * get competition within crafts Beautiful EE
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
    and site_id = 1`;

  return express
    .query(query, {
      raw: true,
      type: Sequelize.QueryTypes.SELECT
    })
    .then(results => {
      winston.info({
        message: 'Get competition details from EE',
        label: 'SYNC:CraftsBeautiful',
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
        MC_aplpost: element.MC_aplpost,
        MC_aplphone: element.MC_aplphone,
        MC_aplemail: element.MC_aplemail,
        MC_aplmms: element.MC_aplmms,
        MC_thirdpost: element.MC_thirdpost,
        MC_thirdemail: element.MC_thirdemail,
        MC_thirdmms: element.MC_thirdmms
      };

      let competition = [];
      const checkComp =
        allComps[
          allComps.map(item => item.urlTitle).indexOf(element.competition)
        ];

      if (!checkComp) {
        competition = await getExpressCompetition(element);
        allComps.push(competition[0]);
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
      label: 'Sync',
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
        message: 'Count entries from myriad',
        label: 'SYNC:CraftsBeautiful',
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
      label: `SYNC:Crafts:sqlParameters`,
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
      label: 'SYNC:CraftsBeautiful',
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
      magazineID: 1,
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
      label: `SYNC:CraftsBeautiful`,
      message: `Error in creating data`,
      error
    });
  });
