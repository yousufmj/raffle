import { uploadForm } from 'controllers/uploadController';
import express from 'express';

let router = express.Router();

router.post('/form/:magazineID', uploadForm);

module.exports = router;
