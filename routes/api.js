const express = require('express');
const router = express.Router();

// get function on /api
router.get('/', function(req, res, next){
    res.send({ "name": 'fire', "desc": "This beat gon be Fire!", "Metadata": { "internalRepr": {"Map(0)": {}, options: {}} } });
    next();
});

// get function on /api/static
router.get('/static', function(req, res, next){
    res.send({ "name": 'fire', "desc": "This beat gon be Fire!", "data": {"port": process.env.port || 4000, "keep-alive": true, "X-Powered-By": "Express"}, "Metadata": { "internalRepr": {"Map(0)": {}, options: {}} } });
    next();
});

module.exports = router;