import { Staff } from 'models';
import { isFailure, isSuccess } from 'utils/responses';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from 'config';
import { Sequelize, sequelize } from 'models';
import { winston } from 'logging/winston';

module.exports = {
  /**
   * log the user in and return jwt
   */
  login: (req, res) => {
    const Op = Sequelize.Op;
    Staff.findOne({
      where: {
        [Op.or]: [{ username: req.body.username }, { email: req.body.email }]
      }
    })
      .then(user => {
        return confirmPassword(req.body.password, user);
      })
      .then(signToken)
      .then(token => {
        return res.status(200).json({
          success: true,
          message: 'Successfully Logged in',
          token
        });
      })
      .catch(error => {
        winston.error({
          label: `Staff`,
          message: error.message,
          error: error
        });
        isFailure(res, error.message);
      });
  }
};

/**
 * create a JWT token
 * @param {object} user
 * @returns {string} - new jwt token
 */
const signToken = user => {
  return jwt.sign(
    {
      email: user.email
    },
    config.get('auth.jwt.secret'),
    {
      expiresIn: '8h'
    }
  );
};

/**
 * ensure the passwords match
 * @param {string} passwordRequest - password from request body
 * @param {object} user - the user from DB
 */
const confirmPassword = (passwordRequest, user) => {
  const compare = bcrypt.compareSync(passwordRequest, user.password);
  if (compare) {
    return Promise.resolve(user);
  } else {
    return Promise.reject({ message: 'Unauthorized access' });
  }
};
