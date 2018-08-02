import express from 'express';
import { Entries } from 'models';
import {
  create,
  query as searchQuery,
  exportPretty
} from 'controllers/candidateController';
import { validateEntry } from 'middleware/validation/candidateValidation';
import { getMany, update, deleteOne, deleteMany } from 'controllers/crud';

const router = express.Router();
const modelName = 'Entries';

/*==============
   POST
===============*/

router.post('/create', sanitize, validateEntry, create);

/*==============
   Delete
===============*/
// delete multiple entries
router.delete('/many', (req, res) => {
  deleteMany(req, res, Entries, modelName);
});

// delete a specific entry
router.delete('/:id', (req, res) => {
  deleteOne(req, res, Entries, modelName);
});

/*==============
   PUT
===============*/
// Update a specific entry
router.put('/:id', (req, res) => {
  update(req, res, Entries, modelName);
});

/*==============
   GET
===============*/

router.get('/', function(req, res) {
  const filter = req.query.filter ? JSON.parse(req.query.filter) : '';
  const query = searchQuery(filter);

  getMany(req, res, Entries, modelName, query);
});

router.get('/pretty', async (req, res) => {
  try {
    const details = await exportPretty(req, res);
    res.json(details);
  } catch (error) {
    res.status(400).json(error);
  }
});

function sanitize(req, res, next) {
  if (req.body.postcode)
    req.body.postcode = req.body.postcode.replace(/\s/g, '');

  next();
}

module.exports = router;
