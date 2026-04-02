const express = require('express');
const router = express.Router();
const { runMatchHandler, listMatches, getMatch } = require('../controllers/matchController');

router.post('/run', runMatchHandler);
router.get('/', listMatches);
router.get('/:id', getMatch);

module.exports = router;
