import { check, validationResult } from 'express-validator/check';
import { sanitize } from 'express-validator/filter';
import { validationErrors } from 'utils/helpers';

module.exports.validateEntry = [
  // sanitize input
  sanitize('competitionID').toInt(),
  sanitize('termID').toInt(),
  sanitize('email').normalizeEmail(),
  sanitize('email').trim(),

  // perform checks on input
  check('firstName', 'First Name is Required').exists(),
  check('lastName', 'Last Name is Required').exists(),
  check('address1', 'Address is Required ').exists(),
  check('postcode', 'Postcode is Required ').exists(),
  check('entryMethod', 'Entry Method Required').exists(),
  check('email', 'Email is Required ').exists(),
  check('competitionID', 'CompeitionID is Required').exists(),

  // ensure that values are not blank
  check('firstName', ' First Name Cant be empty')
    .not()
    .isEmpty(),
  check('lastName', 'Last Name Cant be empty')
    .not()
    .isEmpty(),
  check('address1', 'Address cant be empty')
    .not()
    .isEmpty(),
  check('postcode', 'Postcode Cant be empty')
    .not()
    .isEmpty(),
  check('email', 'Email Cant be empty')
    .not()
    .isEmpty(),
  // check('terms.terms', 'Terms must be agreed to')
  //   .not()
  //   .isEmpty(),
  check('entryMethod', 'Entry Method cant be empty')
    .not()
    .isEmpty(),

  check('email', 'Invalid email')
    .isEmail()
    .optional(),
  check('postcode', 'Invalid postcode')
    .isPostalCode('GB')
    .optional(),

  (req, res, next) => {
    const errors = validationResult(req);

    // handle validation errors
    if (!errors.isEmpty()) {
      let errorMessage = validationErrors(errors.array(), req.body);
      return res.status(422).json({
        status: false,
        error: errorMessage
      });
    }

    next();
  }
];

module.exports.validateCandidate = [
  // sanitize input
  sanitize('email').normalizeEmail(),

  // perform checks on input
  check('firstName', 'Required Value').exists(),
  check('lastName', 'Required Value').exists(),
  check('address1', 'Required Value').exists(),
  check('postcode', 'Required Value').exists(),
  check('email', 'Required Value').exists(),

  // ensure that values are not blank
  check('firstName')
    .not()
    .isEmpty(),
  check('lastName')
    .not()
    .isEmpty(),
  check('address1')
    .not()
    .isEmpty(),
  check('postcode')
    .not()
    .isEmpty(),
  check('email')
    .not()
    .isEmpty(),

  // last few checks
  check('email')
    .isEmail()
    .optional(),
  check('postcode')
    .isPostalCode('GB')
    .optional(),

  (req, res, next) => {
    const errors = validationResult(req);

    // handle validation errors
    if (!errors.isEmpty()) {
      let errorMessage = validationErrors(errors.array(), req.body);
      return res.status(422).json({
        status: false,
        reason: 'validations',
        error: errorMessage
      });
    }

    next();
  }
];
