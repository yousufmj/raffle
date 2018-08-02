import express from 'express';
import { Terms } from 'models';
import {
  getMany,
  create,
  update,
  deleteOne,
  findOne,
  deleteMany
} from 'controllers/crud';
import { Sequelize } from 'sequelize';

const router = express.Router();
const modelName = 'Terms';

/*==============
   POST
===============*/
router.post('/create', (req, res) => {
  let data = req.body;

  // Sequelize Object used to define what fields to be updated
  let where = {
    where: {
      title: data.title,
      description: data.description
    }
  };

  create(req, res, where, Terms, modelName);
});

/*==============
   PUT
===============*/
// Update a specific entry
router.put('/:id', (req, res) => {
  update(req, res, Terms, modelName);
});

/*==============
   Delete
===============*/
// delete multiple entries
router.delete('/many', (req, res) => {
  deleteMany(req, res, Terms, modelName);
});

// Delete a specific entry
router.delete('/:id', (req, res) => {
  deleteOne(req, res, Terms, modelName);
});

/*==============
   GET
===============*/
router.get('/', function(req, res) {
  const filter = req.query.filter ? JSON.parse(req.query.filter) : '';
  const title = filter.title;

  const Op = Sequelize.Op;
  let search = {};

  if (title) {
    search = {
      [Op.or]: [
        {
          title: {
            [Op.like]: `%${title}%`
          }
        },
        {
          description: {
            [Op.like]: `%${title}%`
          }
        }
      ]
    };
  }

  getMany(req, res, Terms, modelName, search);
});

router.get('/:id', function(req, res) {
  findOne(req, res, Terms, modelName);
});

module.exports = router;
