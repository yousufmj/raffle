import moment from 'moment';
import axios from 'axios';
import config from 'config';
import fs from 'fs';
import { sequelize, Sequelize } from '../dbConnection';
import { winston } from '../logging/winston';

const myriad = sequelize.myriad;
const express = sequelize.express;

/**
 * Get all comp entries within myriad db
 * @param {number} limit - the limit for SQL query
 * @param {number} offset - offset for SQL query
 * @returns {Array} an array of data entries
 */
const getAllEntries = (limit, offset) => {
  const fields = `MC_firstName,MC_lastName,MC_addI,MC_addII,MC_town,MC_county,
    postcode,email,source,MC_aplpost,MC_aplphone,MC_aplemail,MC_aplmms,
    MC_thirdpost, MC_thirdemail,MC_thirdmms,MC_date,Marketing_rules,competition,
    MC_questionone,MC_questiontwo,device,terms_conditons,newsletter_optin,
    third_party_optin, thirdemail, submit_desktop, submit_mobile`;

  const query = `select ${fields} from myr_data
    order by d_id DESC LIMIT ${offset}, ${limit}`;

  return myriad
    .query(query, {
      raw: true,
      type: Sequelize.QueryTypes.SELECT
    })
    .then(results => {
      winston.info({
        message: 'get all entries from myriad',
        label: 'SYNC',
        results
      });

      return Promise.resolve(results);
    })
    .catch(error => Promise.reject(error));
};

/**
 * get competition within crafts Beautiful EE
 * @param {string} entryUrl
 */
const getExpressCompetition = entry => {
  const entryUrl = entry.competition;

  const query = `SELECT title, url_title, entry_date, expiration_date
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
        label: 'SYNC',
        results
      });
      return Promise.resolve(results);
    })
    .catch(error => Promise.reject(error));
};

/**
 * Create a new comeition
 * @param {object} data - all details to add a new competition
 */
const createCompetition = competitionDetails => {
  const url = '/competitions/create';
  const body = {
    title: competitionDetails.title,
    urlTitle: competitionDetails.urlTitle,
    startDate: competitionDetails.startDate,
    expiryDate: competitionDetails.expiryDate,
    magazineID: 41
  };

  return axios
    .post(url, body, {
      headers: {
        'Content-Type': 'application/json'
      },
      proxy: {
        host: config.get('server.baseUrl'),
        port: config.get('server.port')
      }
    })
    .then(response => {
      winston.info({
        message: 'Create competition through API',
        label: 'SYNC',
        results: response.data
      });
      return Promise.resolve(response.data);
    })
    .catch(error => {
      // if entry doesn't exists find the id for it
      if (error.response.status != 409) {
        winston.error({
          label: 'SYNC',
          message: 'Creating a competition through API',
          error
        });
        return Promise.reject(error);
      }
      // Function doesn't need to fail if a competition exists
      return Promise.resolve('Competition Exists');
    });
};

/**
 * Get competition that is in Competition Handler
 * @param {object} filter - search filters
 */
const getLocalCompetition = filter => {
  return axios
    .get('/competitions', {
      params: {
        filter
      },
      proxy: {
        host: config.get('server.baseUrl'),
        port: config.get('server.port')
      }
    })
    .then(response => {
      winston.info({
        message: 'Get all relevant competitions from API',
        label: 'SYNC',
        results: response.data
      });

      return Promise.resolve(response.data.results);
    })
    .catch(error => Promise.reject(error));
};

/**
 * Format competitions ready to be addded to db
 * @param {*} entry - the entry data from myriad
 * @param {object} competitionData - the competition details from express
 */
const formatCompetition = (entry, competitionData) => {
  let competitionDetails;

  if (competitionData.length >= 1) {
    competitionDetails = {
      title: competitionData[0].title,
      urlTitle: competitionData[0].url_title,
      startDate: moment.unix(competitionData[0].entry_date).toISOString(),
      expiryDate: moment.unix(competitionData[0].expiration_date).toISOString()
    };

    winston.info({
      label: 'SYNC',
      message: 'formatting competition from API'
    });
    return Promise.resolve(competitionDetails);
  }

  // If no competition create a new entry
  // Convert url to name
  // create custom start and expiry date
  let competitionName = entry.competition;

  competitionName = competitionName.replace(/-/g, ' ');
  entry.competition = competitionName;
  competitionDetails = {
    title: competitionName,
    urlTitle: entry.competition,
    startDate: moment.unix(entry.MC_date).toISOString(),
    expiryDate: moment
      .unix(entry.MC_date)
      .add(2, 'months')
      .format()
  };
  winston.info({
    label: 'SYNC',
    message: 'no data in EE reformatting based on entry'
  });
  return Promise.resolve(competitionDetails);
};

/**
 * Create a new competition entry through API
 * @param {object} competitionDetails - object containing details to create comp
 * @param {object} entryDetails - object containing entry details from myriad
 */
const createEntry = (competitionDetails, entryDetails) => {
  let body = {
    firstName: entryDetails.MC_firstName,
    lastName: entryDetails.MC_lastName,
    address1: entryDetails.MC_addI,
    address2: entryDetails.MC_addII,
    postcode: entryDetails.postcode,
    email: entryDetails.email,
    entryMethod: 'Online',
    competitionID: competitionDetails[0].id,
    termID: 41
  };

  // make API post to create entry
  const url = '/entries/create';
  return axios
    .post(url, body, {
      headers: {
        'Content-Type': 'application/json'
      },
      proxy: {
        host: config.get('server.baseUrl'),
        port: config.get('server.port')
      }
    })
    .then(response => {
      winston.info({
        label: 'SYNC',
        message: 'create a new entry',
        results: response.data
      });

      return Promise.resolve(response.data);
    })
    .catch(error => {
      // store all entries that failed due to validation
      if (error.response.status == 422) {
        const allErrors = {
          body,
          reason: error.error
        };
        return Promise.resolve({
          message: 'Validation Errors',
          details: allErrors
        });
      }

      if (error.response.status != 409) {
        winston.error({
          label: 'sync',
          message: 'Error creating user',
          error: error
        });
        return Promise.reject(error);
      }

      // The script shouldnt fail if someone has already entered
      return Promise.resolve('Already Entered');
    });
};

/**
 * add all entries into DB
 * @param {object} entries - object with all entries
 */

const start = async ($limit, $offset) => {
  winston.info({
    label: 'SYNC',
    message: 'start sync'
  });

  try {
    let allEntries = await getAllEntries($limit, $offset);

    let i = 0;
    const iMax = allEntries.length;
    let totalEntries = 0;
    let totalCompetitions = 0;
    let failedEntries = [];

    for (; i < iMax; i++) {
      const element = allEntries[i];
      let expressCompetition = await getExpressCompetition(element);

      const formatedCompetition = await formatCompetition(
        element,
        expressCompetition
      );

      const handleCompetition = await createCompetition(formatedCompetition);
      let competitionApiInfo;

      if (handleCompetition != 'Competition Exists') {
        competitionApiInfo = [handleCompetition.results];

        totalCompetitions++;
      } else {
        // create filter object to find competition
        const filter = {
          title: formatedCompetition.title,
          urlTitle: formatedCompetition.urlTitle
        };
        competitionApiInfo = await getLocalCompetition(filter);
      }

      const entry = await createEntry(competitionApiInfo, element);
      if (entry && entry.message == 'Validation Errors')
        failedEntries.push(entry.details);
      if (entry != 'Already Entered' && !entry.details) totalEntries++;
    }

    winston.info({
      label: 'SYNC',
      message: 'sync is now complete',
      results: {
        totalEntries,
        totalCompetitions,
        failedEntries: failedEntries.length
      }
    });

    // if there are any failed entries create a file
    if (failedEntries.length >= 1) {
      const json = JSON.stringify(failedEntries, null, 4);
      const epoch = moment().format('X');
      const filePath = `failedEntries-${epoch}.json`;
      fs.writeFile(filePath, json, err => {
        if (err) throw err;
        winston.info({
          label: `SYNC`,
          message: `writing file for failed files`
        });
      });
    }
  } catch (error) {
    winston.error({
      label: 'Sync',
      message: 'error in try catch',
      error
    });
  }
};

start(0, 10);
