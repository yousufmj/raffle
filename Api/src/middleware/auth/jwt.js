import jwt from 'jsonwebtoken';
import config from 'config';
import winston from 'winston';

module.exports = {

    verify:(req,res,next) => {

        let authHeader = req.headers.authorization;

        jwt.verify(authHeader, config.get('auth.jwt.secret'), (error) => {

            if(error){
                winston.error(error);

                return res.status(401)
                    .json({error});
            }

            next();
        });

    },

    create:(req, res, next) => {
        req.token = jwt.sign(
            {
                user: req.username
            },
            config.get('auth.jwt.secret'),
            { expiresIn: '10m'}
        );

        next();
    }
};