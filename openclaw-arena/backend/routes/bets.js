const express = require('express');
const router = express.Router();
const { placeBet, getBalance } = require('../controllers/betController');

router.post('/', placeBet);
router.get('/balance/:user_id', getBalance);

module.exports = router;
