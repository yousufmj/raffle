import { winston } from 'logging/winston';

module.exports = {
  /**
   * Reformat errors from express-validator
   * @param {object[]} errors - an array of objects containing all errors
   * @return {object[]} return an array of objects with reformated errors
   */
  validationErrors: (errors, body) => {
    let allErrors = [];

    // reformat a error message
    errors.forEach(element => {
      let message = {
        parameter: element.param,
        reason: element.msg
      };
      allErrors.push(message);
    });

    let all = {
      errors: allErrors,
      body
    };
    winston.error({
      label: `Validation`,
      message: `Errors`,
      error: all
    });
    return allErrors;
  },

  /**
   * Capitalise first letter of a string
   * @param {string} string - string that requires capitalisation
   */
  capitalise: string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
};
