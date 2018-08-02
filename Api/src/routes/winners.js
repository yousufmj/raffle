import express from 'express';
import { Winners } from 'models';
import { validate } from 'middleware/validation/winnersValidation';
import { deleteOne } from 'controllers/crud';
import { search, pretty } from 'controllers/winnersController';

const router = express.Router();
const modelName = 'Winners';

/*==============
   Delete
===============*/
// Update a specific entry
router.delete('/:id', (req, res) => {
  deleteOne(req, res, Winners, modelName);
});

/*==============
   GET
===============*/
router.get('/', search);
router.get('/pretty', pretty);

module.exports = router;
