import express from 'express';
import { Staff } from 'models';
import {
  create,
  update,
  deleteOne,
  findOne,
  deleteMany,
  getMany
} from 'controllers/crud';
import { login } from 'controllers/staffController';
import { isFailure } from 'utils/responses';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from 'config';

const router = express.Router();
const modelName = 'Staff';

/*==============
    GET
===============*/

router.get('/', function(req, res) {
  getMany(req, res, Staff, modelName);
});

router.get('/:id', function(req, res) {
  findOne(req, res, Staff, modelName);
});

/*==============
  POST
===============*/
router.post('/create', (req, res) => {
  let data = req.body;
  bcrypt.hash(data.password, 10, (error, hash) => {
    if (error) {
      return isFailure(res, null, 'Error creating user');
    }

    // Sequelize Object used to define what fields to be updated
    let where = {
      where: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        username: data.username,
        password: hash
      }
    };

    create(req, res, where, Staff, modelName);
  });
});

router.post('/login', login);

/*==============
  PUT
===============*/
// Update a specific entry
router.put('/:id', (req, res) => {
  update(req, res, Staff, modelName);
});

/*==============
 Delete
===============*/
// delete multiple entries
router.delete('/many', (req, res) => {
  deleteMany(req, res, Staff, modelName);
});

// delete a specific entry
router.delete('/:id', (req, res) => {
  deleteOne(req, res, Staff, modelName);
});

module.exports = router;
