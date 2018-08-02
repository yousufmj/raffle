import moment from 'moment';
import axios from 'axios';
import config from 'config';
import fs from 'fs';
import { winston } from '../logging/winston';
import { isSuccess, isFailure } from '../utils/responses';
import { CandidateTerms } from '../models';

/**
 * Create a new comeition
 * @param {object} data - all details to add a new competition
 */
const createCompetition = (competitionDetails, magazineID) => {
  const url = `/competitions/create`;

  const body = {
    title: competitionDetails.title,
    urlTitle: competitionDetails.urlTitle,
    startDate: competitionDetails.startDate,
    expiryDate: competitionDetails.expiryDate,
    magazineID
  };

  return axios
    .post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      proxy: {
        port: config.get('server.port')
      },
      withCredentials: true,
      credentials: 'same-origin',
      mode: 'no-cors'
    })
    .then(response => {
      winston.info({
        message: 'Create competition through API',
        label: 'Upload',
        results: response.data
      });
      return Promise.resolve(response.data);
    })
    .catch(error => {
      // if entry doesn't exists find the id for it
      if (error.response.status != 409) {
        winston.error({
          label: 'Upload',
          message: 'Creating a competition through API',
          error
        });
        return Promise.reject(error.response.data);
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
  const url = `/competitions`;
  return axios
    .get(url, {
      params: {
        filter
      },
      proxy: {
        port: config.get('server.port')
      }
    })
    .then(response => {
      winston.info({
        message: 'Get all relevant competitions from API',
        label: 'Upload',
        results: response.data
      });

      return Promise.resolve(response.data.results);
    })
    .catch(error => Promise.reject(error.response.data));
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
      urlTitle: competitionData[0].urlTitle,
      startDate: moment.unix(competitionData[0].startDate).toISOString(),
      expiryDate: moment.unix(competitionData[0].expiryDate).toISOString()
    };

    winston.info({
      label: 'Upload',
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
    label: 'Upload',
    message: 'no data in EE reformatting based on entry'
  });
  return Promise.resolve(competitionDetails);
};

/**
 * Create a new competition entry through API
 * @param {object} competitionDetails - object containing details to create comp
 * @param {object} entryDetails - object containing entry details from myriad
 */
const createEntry = (competitionDetails, entryDetails, magazineID) => {
  let body = {
    firstName: entryDetails.firstName,
    lastName: entryDetails.lastName,
    address1: entryDetails.address1,
    address2: entryDetails.address2,
    postcode: entryDetails.postcode,
    answer1: entryDetails.answer1,
    answer2: entryDetails.answer2,
    email: entryDetails.email,
    entryMethod: 'Online',
    competitionID: competitionDetails[0].id,
    magazineID,
    createdAt: entryDetails.createdAt
  };

  //Define Terms
  const filterTerms = ['terms', 'newsletter', 'thirdParty', 'other'];

  const terms = Object.keys(entryDetails)
    .filter(item => {
      return filterTerms.includes(item);
    })
    .map(item => {
      return item;
    });

  body.terms = terms;

  // make API post to create entry
  const url = `/entries/create`;
  return axios
    .post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      proxy: {
        port: config.get('server.port')
      }
    })
    .then(response => {
      winston.info({
        label: 'Upload',
        message: 'create a new entry',
        results: response.data
      });

      return Promise.resolve(response.data);
    })
    .catch(error => {
      // store all entries that failed due to validation

      if (error.response.status == 422) {
        winston.error({
          label: `Upload:CreateEntry`,
          message: `validation error`,
          error: {
            body,
            reason: error.response.data
          }
        });

        return Promise.resolve({
          message: 'Validation Errors',
          body,
          details: error.response.data
        });
      }

      if (error.response.status != 409) {
        winston.error({
          label: 'Upload',
          message: 'Error creating user',
          error: error
        });
        return Promise.reject(error.response.data);
      }

      // The script shouldnt fail if someone has already entered
      const candidateID = error.response.data.error.candidateID;
      return Promise.resolve({ message: 'Already Entered', candidateID });
    });
};

/**
 * update candidate create date
 * @param {number} candidateID - candidate ID
 */
const updateCandidate = async (candidateID, entry) => {
  // make API post to create entry
  const url = `/candidates/${candidateID}`;

  try {
    const candidateDetails = await axios.get(url);
    const currentCandidateDate = candidateDetails.data.results.createdAt;
    const incomingCandidateDate = entry.createdAt;

    if (incomingCandidateDate < currentCandidateDate) {
      const body = {
        createdAt: entry.incomingCandidateDate
      };
      await axios.put(url, body, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        proxy: {
          port: config.get('server.port')
        }
      });
      winston.info({
        label: `Upload:updateCandidate`,
        message: `updating candidate create date`
      });
      return Promise.resolve('Updated createdAt Date');
    }

    return Promise.resolve('Not Updated');
  } catch (error) {
    winston.error({
      label: `Upload:updateCandidate`,
      message: `error updating createdAt date`,
      error
    });

    return Promise.reject(error.response.data);
  }
};
/**
 * add all entries into DB
 * @param {object} entries - object with all entries
 */

const upload = async uploadData => {
  winston.info({
    label: 'Upload',
    message: 'start uploading'
  });

  const { magazineID, syncData } = uploadData;

  let failedEntries = [];
  try {
    let totalEntries = 0;
    let totalCompetitions = 0;
    let allComps = [];

    for (const sync of syncData) {
      const { entry, expressCompetition } = sync;
      let handleCompetition = [];
      let competitionApiInfo;
      const checkComp =
        allComps[
          allComps
            .map(item => item.urlTitle)
            .indexOf(expressCompetition[0].urlTitle)
        ];

      if (!checkComp) {
        const formatedCompetition = await formatCompetition(
          entry,
          expressCompetition
        );

        handleCompetition = await createCompetition(
          formatedCompetition,
          magazineID
        );

        if (handleCompetition != 'Competition Exists') {
          competitionApiInfo = [handleCompetition.results];

          allComps.push(handleCompetition.results);
          totalCompetitions++;
        } else {
          // create filter object to find competition
          const filter = {
            title: formatedCompetition.title,
            urlTitle: formatedCompetition.urlTitle,
            magazineID
          };
          competitionApiInfo = await getLocalCompetition(filter);

          allComps.push(competitionApiInfo[0]);
        }
      } else {
        competitionApiInfo = [checkComp];
      }

      const newEntry = await createEntry(competitionApiInfo, entry, magazineID);

      if (newEntry && newEntry.message == 'Validation Errors')
        failedEntries.push(newEntry);
      if (newEntry.message != 'Candidate already Entered' && !newEntry.details)
        totalEntries++;
      if (newEntry.message === 'Candidate already Entered' && !newEntry.details)
        await updateCandidate(newEntry.candidateID, entry);
    }

    winston.info({
      label: 'Upload',
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
      const filePath = `fixtures/failedEntries-${epoch}.json`;
      fs.writeFile(filePath, json, err => {
        if (err) throw err;
        winston.info({
          label: `SYNC`,
          message: `writing file for failed files`
        });
      });
    }
    return Promise.resolve(`Completed Upload ${totalEntries}`);
  } catch (error) {
    winston.error({
      label: 'Upload',
      message: 'error in try catch',
      error
    });

    if (failedEntries.length >= 1) {
      const json = JSON.stringify(failedEntries, null, 4);
      const epoch = moment().format('X');
      const filePath = `fixtures/failedEntries-${epoch}.json`;
      fs.writeFile(filePath, json, err => {
        if (err) throw err;
        winston.info({
          label: `SYNC`,
          message: `writing file for failed files`
        });
      });
    }

    return Promise.reject(error);
  }
};

const uploadForm = async (req, res) => {
  //intercepts OPTIONS method
  const entry = req.body;
  const magazineID = req.params.magazineID;

  // redefine entry form form data
  const expressCompetition = {
    title: entry.competitionTitle,
    urlTitle: entry.competitionUrl,
    startDate: moment.unix(entry.competitionStartDate).toISOString(),
    expiryDate: moment.unix(entry.competitionExpiryDate).toISOString()
  };

  winston.info({
    label: 'Upload',
    message: 'start uploading'
  });

  try {
    let totalEntries = 0;
    let totalCompetitions = 0;
    let failedEntries = [];

    const handleCompetition = await createCompetition(
      expressCompetition,
      magazineID
    );

    let competitionApiInfo;

    if (handleCompetition != 'Competition Exists') {
      competitionApiInfo = [handleCompetition.results];

      totalCompetitions++;
    } else {
      // create filter object to find competition
      const filter = {
        title: expressCompetition.title,
        urlTitle: expressCompetition.urlTitle,
        magazineID
      };
      competitionApiInfo = await getLocalCompetition(filter);
    }

    const newEntry = await createEntry(competitionApiInfo, entry, magazineID);

    // Return failure if validation for users are triggered
    if (newEntry && newEntry.message == 'Validation Errors') {
      winston.error({
        label: 'Upload:Form',
        message: 'Create entry Error',
        error: newEntry
      });

      res.httpCode = 422;
      return isFailure(res, 'Validation Errors', newEntry.details.error);
    }

    winston.info({
      label: 'Upload',
      message: 'uploading entry is now complete',
      results: {
        totalEntries,
        totalCompetitions,
        failedEntries: failedEntries.length
      }
    });

    return isSuccess(res, 'Successful upload');
  } catch (error) {
    winston.error({
      label: 'Upload',
      message: 'error in try catch',
      error
    });
    let errorMessage = 'Error in uploading';
    res.httpCode = 400;
    return isFailure(res, errorMessage);
  }
};

module.exports = {
  upload,
  uploadForm
};
