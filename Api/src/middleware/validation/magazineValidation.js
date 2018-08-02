import { check, validationResult } from 'express-validator/check';
import { sanitize } from 'express-validator/filter';
import { validationErrors } from 'utils/helpers';

module.exports.validate = [
  // sanitize input
  sanitize('Name')
    .whitelist(['a-zA-Z0-9_\\s'])
    .trim(),

  // perform checks on input
  check('name', 'Required Value').exists(),
  check('website').isURL(),

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
