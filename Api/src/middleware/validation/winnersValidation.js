import { check, validationResult } from 'express-validator/check';
import { sanitize } from 'express-validator/filter';
import { validationErrors } from 'utils/helpers';

module.exports.validate = [
  // sanitize input
  sanitize('competitionID').toInt(),

  // perform checks on input
  check('competitionID', 'Required Value').exists(),

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
];
