import {
  check,
  validationResult,
  checkSchema,
  oneOf
} from 'express-validator/check';
import { sanitize } from 'express-validator/filter';
import { validationErrors } from 'utils/helpers';
import winston from 'logging/winston';

let searchParams = [
  'title',
  'magazineID',
  'issue',
  'startDate',
  'expiryDate',
  'description'
];

module.exports = {
  /**
   * Validation for creating new entry
   * @returns {object} will return an error object if validation fails else move onto next function
   */
  create: [
    // sanitize input
    sanitize('title')
      .escape()
      .trim(),
    sanitize('description')
      .escape()
      .trim(),
    sanitize('magazineID').toInt(),
    sanitize('issue').toInt(),

    // mandatory fields
    check('title', 'Required Value').exists(),
    check('magazineID', 'Required Value').exists(),
    check('startDate', 'Required Value').exists(),
    check('expiryDate', 'Required Value').exists(),

    // Format check
    check('startDate', 'Not valid date format')
      .isISO8601()
      .optional(),
    check('expiryDate', 'Not valid date format')
      .isISO8601()
      .optional(),

    // Run the validation
    (req, res, next) => {
      const errors = validationResult(req);

      // handle validation errors
      if (!errors.isEmpty()) {
        let errorMessage = validationErrors(errors.array());
        return res.status(422).json({
          status: false,
          reason: 'Validation Error',
          error: errorMessage
        });
      }

      next();
    }
  ],

  /**
   * Validation for updating an entry
   * @returns {object} will return an error object if validation fails else move onto next function
   */
  update: [
    // sanitize input
    sanitize('title')
      .escape()
      .trim(),
    sanitize('description')
      .escape()
      .trim(),
    sanitize('magazineID').toInt(),
    sanitize('issue').toInt(),

    // Format check
    check('startDate', 'Not valid date format')
      .isISO8601()
      .optional(),
    check('expiryDate', 'Not valid date format')
      .isISO8601()
      .optional(),

    // Run the validation
    (req, res, next) => {
      const errors = validationResult(req);

      // handle validation errors
      if (!errors.isEmpty()) {
        let errorMessage = validationErrors(errors.array());
        return res.status(422).json({
          status: false,
          reason: 'Validation Error',
          error: errorMessage
        });
      }

      next();
    }
  ],
  getAll: [
    // sanitize input
    sanitize('title')
      .escape()
      .trim(),
    sanitize('description')
      .escape()
      .trim(),
    sanitize('magazineID').toInt(),
    sanitize('issue').toInt(),

    // Run the validation
    (req, res, next) => {
      const errors = validationResult(req);

      // handle validation errors
      if (!errors.isEmpty()) {
        let errorMessage = validationErrors(errors.array());
        winston.error({
          label: 'Validation',
          message: errorMessage
        });
        return res.status(422).json({
          status: false,
          reason: 'Validation Error',
          error: errorMessage
        });
      }

      next();
    }
  ],
  search: [
    oneOf([
      check('title').isLength({ min: 1, max: undefined }),
      check('magazineID').isLength({ min: 1, max: undefined }),
      check('description').isLength({ min: 1, max: undefined }),
      check('startDate').isLength({ min: 1, max: undefined }),
      check('expiryDate').isLength({ min: 1, max: undefined }),
      check('issue').isLength({ min: 1, max: undefined })
    ]),
    checkSchema({
      title: {
        in: 'query',
        optional: true
      },
      magazineID: {
        in: 'query',
        isInt: true,
        toInt: true,
        optional: true
      },
      issue: {
        in: 'query',
        isInt: true,
        toInt: true,
        optional: true
      },
      description: {
        in: 'query',
        optional: true
      },
      startDate: {
        in: 'query',
        isISO8601: {
          errorMessage: 'Incorrect date format'
        },
        optional: true,
        isIn: searchParams
      },
      expiryDate: {
        in: 'query',
        isISO8601: {
          errorMessage: 'Incorrect date format'
        },
        optional: true,
        isIn: searchParams
      }
    }),
    (req, res, next) => {
      const errors = validationResult(req);
      // handle validation errors
      if (!errors.isEmpty()) {
        let errorMessage = validationErrors(errors.array());
        return res.status(422).json({
          status: false,
          reason: 'Validation Error',
          error: errorMessage
        });
      }

      next();
    }
  ]
};
