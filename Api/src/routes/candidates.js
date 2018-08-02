import express from 'express';
import { Candidates } from 'models';
import * as candidateController from '../controllers/candidateController';
import { validateCandidate } from 'middleware/validation/candidateValidation';
import {
  getMany,
  create,
  update,
  deleteOne,
  findOne,
  deleteMany
} from 'controllers/crud';
import { capitalise } from 'utils/helpers';

const router = express.Router();
const modelName = 'Candidates';

/*==============
  POST
===============*/
router.post('/create', validateCandidate, (req, res) => {
  // Sanitisations before input
  req.body.firstName = capitalise(req.body.firstName);
  req.body.lastName = capitalise(req.body.lastName);
  req.body.postcode = req.body.postcode.replace(/ /g, '');

  let data = req.body;
  let address2 = data.address2 || '';

  // Sequelize Object used to define what fields to be updated
  let where = {
    where: {
      firstName: data.firstName,
      lastName: data.lastName,
      address1: data.address1,
      address2: address2,
      postcode: data.postcode,
      email: data.email
    }
  };

  create(req, res, where, Candidates, modelName);
});

/*==============
  PUT
===============*/
// Update a specific entry
router.put('/:id', (req, res) => {
  update(req, res, Candidates, modelName);
});

/*==============
  Delete
===============*/
// delete multiple entries
router.delete('/many', (req, res) => {
  deleteMany(req, res, Candidates, modelName);
});
// Update a specific entry
router.delete('/:id', (req, res) => {
  deleteOne(req, res, Candidates, modelName);
});

/*==============
  GET
===============*/
router.get('/', function(req, res) {
  let filter = req.query.filter ? JSON.parse(req.query.filter) : '';

  const query = candidateController.userQuery(filter);

  getMany(req, res, Candidates, modelName, query);
});

router.get('/:id', function(req, res) {
  findOne(req, res, Candidates, modelName);
});

module.exports = router;
