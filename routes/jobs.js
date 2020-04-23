const express = require('express');
const router = express.Router();


//Importing Jobs controller methods

const {getJobs} = require('../controllers/jobsController');

//Since now we are using controllers, we don't need it.
//router.get('/jobs', (req, res) => {
//    res.status(200).json({
//        success: true,
//        message: 'This route will display all jobs in the future'
//    });
//});

router.route('/jobs').get(getJobs);


module.exports = router;