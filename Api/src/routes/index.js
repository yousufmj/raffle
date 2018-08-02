import { create } from 'middleware/auth/jwt';
import express from 'express';

let router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.json({
    title: 'Competition Handler API AWS'
  });
});

router.post('/createToken', create, (req, res) => {
  res.json({
    success: true,
    token: req.token
  });
});

router.get('/test', (req, res) => {
  res.json('test');
});

router.get('/healthcheck', (req, res) => {
  res.json({
    success: true,
    message: "healthy"
  });
});

module.exports = router;
