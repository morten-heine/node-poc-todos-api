const express = require('express');
const router = express.Router({ mergeParams: true });
const { encrypt, decrypt } = require('../../utils/crypto.js');

router.get('/', async (req, res) => {
    console.log('get /');
    res.send('Todo API');
});

module.exports = router;
