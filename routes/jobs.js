const express = require('express');
const router = express.Router();


//Importing Jobs controller methods

const {
    getJobs,
    newJob,
    getJobsInRadius,
    updateJob,
    deleteJob,
    getJob,
    jobStats
} = require('../controllers/jobsController');

//Since now we are using controllers, we don't need it.
//router.get('/jobs', (req, res) => {
//    res.status(200).json({
//        success: true,
//        message: 'This route will display all jobs in the future'
//    });
//});

router.route('/jobs').get(getJobs);

router.route('/job/:id/:slug').get(getJob);

router.route('/stats/:topic').get(jobStats);

router.route('/jobs/:zipcode/:distance').get(getJobsInRadius);

router.route('/job/new').post(newJob);

router.route('/job/:id')
    .put(updateJob)
    .delete(deleteJob);

module.exports = router;