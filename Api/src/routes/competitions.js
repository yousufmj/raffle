import express from 'express';
import * as competitionController from 'controllers/competitionController';
import { Competitions } from 'models';
import * as validate from 'middleware/validation/competitionValidation';
import {
  create,
  update,
  deleteOne,
  findOne,
  deleteMany,
  getMany
} from 'controllers/crud';
import unescape from 'validator/lib/unescape';
import slug from 'slug';

const router = express.Router();
const modelName = 'Competitions';

/*==============
   POST
===============*/
router.post('/create', validate.create, (req, res) => {
  // values are escaped during validation
  req.body.title = unescape(req.body.title);
  if (req.body.description)
    req.body.description = unescape(req.body.description);
  if (!req.body.urlTitle) req.body.urlTitle = slug(req.body.title);

  let data = req.body;

  // Sequelize Object used to define what fields to be updated
  let where = {
    where: {
      title: data.title,
      urlTitle: data.urlTitle,
      magazineID: data.magazineID,
      startDate: data.startDate,
      expiryDate: data.expiryDate
    }
  };

  create(req, res, where, Competitions, modelName);
});

// TODO: download options - base this off the main search query
router.post('/:id/download/:options', function(req, res) {
  let string =
    'Download entries for comp id' +
    req.params.id +
    ' with the options ' +
    req.params.options;
  res.json(string);
});

router.post('/:id/winner', competitionController.selectWinner);

/*==============
   GET
===============*/

router.get('/', validate.getAll, function(req, res) {
  const filter = req.query.filter ? JSON.parse(req.query.filter) : '';

  const query = competitionController.query(filter);

  getMany(req, res, Competitions, modelName, query);
});

router.get('/:id', function(req, res) {
  findOne(req, res, Competitions, modelName);
});

/*==============
   PUT
===============*/
// Update a specific entry
router.put('/:id', validate.update, (req, res) => {
  update(req, res, Competitions, modelName);
});

/*==============
   Delete
===============*/
// delete multiple entries
router.delete('/many', (req, res) => {
  deleteMany(req, res, Competitions, modelName);
});
// delete a specific entry
router.delete('/:id', (req, res) => {
  deleteOne(req, res, Competitions, modelName);
});

module.exports = router;
