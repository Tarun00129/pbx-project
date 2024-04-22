const express = require('express');
const privateRouter = require('./private');
const publicRouter = require('./public');

const router = express.Router();

router.use('/api', privateRouter);
router.use('/api', publicRouter);

module.exports = router;
