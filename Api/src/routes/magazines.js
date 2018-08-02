import express from "express";
import * as magazineController from "controllers/magazineController";
import { Magazines } from "models";
import { validate } from "middleware/validation/magazineValidation";
import {
  create,
  update,
  deleteOne,
  findOne,
  deleteMany,
  getMany
} from "controllers/crud";

const router = express.Router();
const modelName = "Magazines";

/*==============
   GET
===============*/

router.get("/", function(req, res) {
  const filter = req.query.filter ? JSON.parse(req.query.filter) : "";
  const query = magazineController.query(filter);

  getMany(req, res, Magazines, modelName, query);
});

router.get("/:id", function(req, res) {
  findOne(req, res, Magazines, modelName);
});

/*==============
   POST
===============*/
router.post("/create", validate, (req, res) => {
  let data = req.body;

  // Sequelize Object used to define what fields to be updated
  let where = {
    where: {
      name: data.name,
      website: data.website
    }
  };

  create(req, res, where, Magazines, modelName);
});

/*==============
   PUT
===============*/
// Update a specific entry
router.put("/:id", validate, (req, res) => {
  update(req, res, Magazines, modelName);
});

/*==============
 Delete
===============*/
// delete multiple entries
router.delete("/many", (req, res) => {
  deleteMany(req, res, Magazines, modelName);
});

// delete a specific entry
router.delete("/:id", (req, res) => {
  deleteOne(req, res, Magazines, modelName);
});

module.exports = router;
