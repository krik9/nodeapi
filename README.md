1. Basic Project setup:
    a. npm init
        package name: jobapi,
        description: This is first node jobapi project,
        entry point: app.js,
        author: krik9
    b. create app.js
        const express = require('express');
        const app = express();

        const PORT=process.env.PORT;
        app.listen(PORT,()=>{
            console.log(`Server started on PORT ${process.env.PORT};
        }); 
    c. create config folder and config.env file in config folder
        PORT=3000
        NODE_ENV=development
    d. open app.js and add 
        //setting up config.env file variables
        dotenv.config({path:'./config/config.env'}); 
    e. Now open terminal and run below command
        npm i express dotenv --save
    f. Run node app.js
    g. Ctrl+C to exit

2. Setting up github
    a. create github repository
    b. initialise local repository by running below command 
        git init
    c. create .gitignore file with below lines
        config/config.env
        node_modules/

3. Installing and setting up nodemon
    a. npm i nodemon --save-dev
    b. Open package.json and delete test line under scripts and below lines
        "start": "node app.js",
        "dev": "nodemon app",
        "prod": "SET NODE_ENV=production & nodemon app.js"
    c. open app.js and edit server started console log line as below
        console.log(`Server started on PORT ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
    d. Run below commands to verify in terminal
        npm run dev => should print "Server started on PORT 3000 in development mode"
        npm run prod => should print "Server started on PORT 3000 in production mode"

4. creating Basic route
    a. create routes folder and create jobs.js 
            
            const express = require('express');
            const router = express.Router();

            router.get('/jobs', (req, res) => {
            res.status(200).json({
                success: true,
                message: 'This route will display all jobs in the future'
            });
            });
            
            module.exports = router;

    b. open app.js and add below lines
        //Importing all routes
        const jobs = require('./routes/jobs');
        app.use(jobs);
    c. Now open postman and type http://localhost:3000/jobs and it should display below json
        {
            "success": true,
            "message": "This route will display all jobs in the future"
        }
    d. To manage different api versions, we can add /api/v1/jobs instead of /jobs.
        This can be done in jobs.js - " router.get('/api/v1/jobs', (req, res)" (or)
        app.js - "app.use('/api/v1',jobs);"
    e. Now open postman and type http://localhost:3000/api/v1/jobs and it should display same json.

5. creating controller method
    a. create controllers folder and create jobsController.js file as below
        
        //Get all jobs => /api/v1/jobs
        exports.getJobs = (req,res,next) =>{
            res.status(200).json({
                success:true,
                message:"This route will display all jobs in future."
            });
        }    
    b. Now open jobs.js and add below lines and you can remove router.get method since we moved it to jobsController.js
        //Importing Jobs controller methods
        const {getJobs} = require('../controllers/jobsController');
        router.route('/jobs').get(getJobs);
    c. Now open postman and type http://localhost:3000/api/v1/jobs and it should display same json.

6. Setting up Postman environment
    a. Download and install postman and make sure you have an account
    b. Click on gear on top right corner and add new environment "nodeapi"
    c. create variable "DOMAIN" with value "http://localhost:3000" and add it.
    d. Now on top right corner, choose nodeapi environment and type {{DOMAIN}}/api/v1/jobs and you should get same result.
    e. Click on collections tab in left pane and add name as nodeapi and description to create a collection.
    f. Right click and create jobs folder with description - "All requests related to job - create, read, update, delete and apply to a job etc."
    g. create a new tab and make sure you have GET request and type {{DOMAIN}}/api/v1/jobs and verify the result and save as "Get all jobs" with 
        description "Get all jobs that are stored in db." and make sure you choose nodeapi collection and jobs folder to save.
    h. From now on, you can simply click on it and send it to get the results.
    i. For POST requests, click on new tab and click on "Presets" -> Manage presets and Add contentType key and value application/json
7. Installing Mongodb server and compass
    a. Download and install mongodb community edition server based on your OS
    b. To start the server on linux use sudo service mongod start (This automatically creates /var/log/mongodb and 
        /var/log/mongodb/mongod.log as user mongodb permissions). so if you just use "mongod" command to run the server, it creates a 
        /tmp/mongodb-27017.sock file and cause permission issues. so delete the file if you have ran it mistakenly an use "sudo mongod" or
        "sudo service mongod start"
    c. Download and install mongo shell based on your OS and execute "show dbs;" to see if it works
    d. Download and install mongodb compass based on your OS
8. Connecting API with database
    a. Run "npm i mongoose --save" in terminal
    a. open config/config.env file and add below line
        DB_LOCAL_URI = mongodb://localhost:27017/jobs
    b. create config/database.js with following details
            const mongoose = require('mongoose');

            const connectDatabase = () => {
                mongoose.connect(process.env.DB_LOCAL_URI, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useCreateIndex: true
                }).then(con => {
                    console.log(`Mongodb database connected with host: ${con.connection.host}`);
                });
            };

            module.exports = connectDatabase;
        In this case, to get rid of warning while connecting to database, we use useNewUrlParser, useUnifiedTopology and useCreateIndex set to true.
        Also, since this connect is a promise we use then()
    c. Now open app.js and ad below lines
        //Import the database
        const connectDatabase = require('./config/database');

        //connecting to database
        connectDatabase();
    d. Now open mongodb compass and configure as follows for connection string
        "mongodb://localhost:27017/jobs" and click on connect and you will find three existing dbs admin, config and local.
        we won't find anything for jobs yet, since nothing is created and stored.
9. Understanding middlewares
    a. Open app.js and add below lines after connectDatabase() call
        //creating own middleware
        const middleware = (req,res,next) => {
            console.log("Hello from middleware");
            next();
        };

        app.use(middleware);
    b. Now open postman and type http://localhost:3000/api/v1/jobs and it should display same json. However, if you check terminal, you will have
            Server started on PORT 3000 in development mode
            Mongodb database connected with host: localhost
            Hello from middleware
        Basically, Hello from middleware will now be displayed for for every request (GET, POST)
        To elaborate, let's set up global variable as follows
           //creating own middleware
            const middleware = (req,res,next) => {
                console.log("Hello from middleware");
                //setting up user variable globally
                req.user = 'krik9';
                next();
            };

            app.use(middleware);  
        Also, open jobsController.js and add middlewareuser line as follows

            //Get all jobs => /api/v1/jobs
            exports.getJobs = (req,res,next) =>{
                res.status(200).json({
                    success:true,
                    middlewareuser: req.user,
                    message:"This route will display all jobs in future."
                });
            }
    c. Now open postman and type http://localhost:3000/api/v1/jobs and it should display
            {
                "success": true,
                "middlewareuser": "krik9",
                "message": "This route will display all jobs in future."
            }
        So basically middleware is a function that takes three parameters req, res and next. and this function is present everywhere in the project. you can even try to get other variables like req.requestMethod = req.method; in app.js 
        and in jobsController.js if you add requestMethod: req.requestMethod, and if you submit get request from postman you will get
            {
                "success": true,
                "middlewareuser": "krik9",
                "requestMethod": "GET",
                "message": "This route will display all jobs in future."
            }
        Similarly, you can also use req.url and trigger postman GET request, you will get
            {
                "success": true,
                "middlewareuser": "krik9",
                "requestMethod": "GET",
                "requesturl": "/api/v1/jobs",
                "message": "This route will display all jobs in future."
            }  
    d. Run below git commands

        git add .
        git commit -m "project setup"
        git remote add origin git@github.com:krik9/nodeapi.git
        git push -u origin master

Using MongoDB - Adding Jobs resource
************************************
1. Creating Job Model
    a. Create models folder and jobs.js file as below
        const mongoose = require('mongoose');
        const validator = require('validator');

        const jobSchema = new mongoose.Schema({
            title: {
                type: String,
                required: [true, 'Please enter job title'],
                trim: true,
                maxlength: [100, 'Job title cannot exceed 100 characters.']
            },
            slug: String,
            description: {
                type: String,
                required: [true, 'Please enter job description'],
                maxlength: [1000, 'Job description cannot exceed 1000 characters.']
            },
            email: {
                type: String,
                validate: [validator.isEmail, 'Please add a valid email address.']
            },
            address: {
                type: String,
                required: [true, 'Please add an address']
            },
            company: {
                type: String,
                required: [true, 'Please add a valid Company name.']
            },
            industry: {
                type: [String], //Array value of strings
                required: true,
                enum: {
                    values: [
                        'Business',
                        'Information Technology',
                        'Banking',
                        'Education/Training',
                        'Telecommunication',
                        'Others'
                    ],
                    message: 'Please select correct options for industry',
                }
            },
            jobType: {
                type: String, //Only one value, even though we have options
                required: true,
                enum: {
                    values: [
                        'Permanent',
                        'Temporary',
                        'Internship'
                    ],
                    message: 'Please select correct options for Job type.'
                }
            },
            minEducation: {
                type: String,
                required: true,
                enum: {
                    values: [
                        'Bachelors',
                        'Masters',
                        'Phd'
                    ],
                    message: 'Please select correct options for Education'
                }
            },
            positions: {
                type: Number,
                default: 1
            },
            experience: {
                type: String,
                required: true,
                enum: {
                    values: [
                        'No Experience',
                        '1 Year - 2 Years',
                        '2 Years - 5 Years',
                        '5 Years+'
                    ],
                    message: 'Please select correct options for experience'
                }
            },
            salary: {
                type: Number,
                required: [true, 'Please enter expected salary for the Job.']
            },
            postingDate: {
                type: Date,
                default: Date.now
            },
            lastDate: {
                type: Date,
                default: new Date().setDate(new Date().getDate() + 7)
            },
            applicantaApplied: {
                type: [Object],
                select: false
            }

        });

        module.exports = mongoose.model('Job', jobSchema);
2. Create and save new job to database
    a. open controllers/jobsController.js and add the following things
        const Job = require('../models/jobs');

        // Create a new job => /api/v1/job/new
        exports.newJob = async (req, res, next) => {
            const job = await Job.create(req.body); //since we will use global error handlers, we are not using try catch(promise) concept, instead we use await.
                                                    //Also, since we use await, we need async function.
            res.status(200).json({
                success: true,
                message: 'Job Created',
                data: job
            });
        };
    b. open routes/jobs.js and add the following route and modify jobscontroller method
        const {
            getJobs,
            newJob
        } = require('../controllers/jobsController');

        router.route('/job/new').post(newJob);
    c. Now install validator "npm i --save validator"
    d. Now open postman and click on create new tab and choose POST request and type {{DOMAIN}}/api/v1/job/new.
        From Headers tab select json preset and click on Body tab and choose raw and json
            {
                "title": "Ruby on Rails Developer (Software Engineer)",
                "description": "We are looking for a Ruby Rails Developer to join our team and help them build new products and work on existing processes. you will be part of range of work streams from improving existing server and operation processes over translating functional requirements to code to developing new products from scratch.",
                "email":"employeer@gmail.com",
                "address":"200 Olympic Dr, Stafford, VA, 22554",
                "company":"Stafford",
                "industry":[
                    "Information Technology"
                    ],
                "jobType": "Permanent",
                "minEducation": "Masters",
                "positions":1,
                "experience":"2 Years - 5 Years",
                "salary":110000
            }
        It should return a response as follows
            {
                "success": true,
                "message": "Job Created"
            }
    e. However, no record is created and no data is returned. So, if we cross check, we are missing app.use in app.js, so add the following
            //setup body parser
            app.use(express.json());
        Also, comment middleware part in app.js and controllers/jobsController.js file
        After that,save it and click on dend in postman which will display
            {
                "success": true,
                "message": "Job Created",
                "data": {
                    "industry": [
                        "Information Technology"
                    ],
                    "positions": 1,
                    "lastDate": "2020-05-01T07:22:51.092Z",
                    "applicantaApplied": [],
                    "_id": "5ea294705c3088625672f937",
                    "title": "Ruby on Rails Developer (Software Engineer)",
                    "description": "We are looking for a Ruby Rails Developer to join our team and help them build new products and work on existing processes. you will be part of range of work streams from improving existing server and operation processes over translating functional requirements to code to developing new products from scratch.",
                    "email": "employeer@gmail.com",
                    "address": "200 Olympic Dr, Stafford, VA, 22554",
                    "company": "Stafford",
                    "jobType": "Permanent",
                    "minEducation": "Masters",
                    "experience": "2 Years - 5 Years",
                    "salary": 110000,
                    "postingDate": "2020-04-24T07:25:36.959Z",
                    "__v": 0
                }
            }
    f. Now open Mongo compass and disconnect and reconnect if required and verify if the db and colection is available.
3. Creating slug for job 
    a. Run "npm i --save slugify" //Slugify is for url generation
    b. Open models/jobs.js and add 
        const slugify = require('slugify');

        //creating job slug before saving //pre is like a middle ware thing for mongoose
        jobSchema.pre('save', function (next) { //we have to use function here instead of arrow func so that you can use this keyword to refer objects
            this.slug = slugify(this.title, { lower: true });
            next();
        });
    c. Delete the existing record in db and send the POST request again from postman and then you can see slug created in db
        "ruby-on-rails-developer-(software-engineer)"
4. Display all Jobs
    a. open controllers/jobsController.js and edit following details
        //Get all jobs => /api/v1/jobs
        exports.getJobs = async (req, res, next) => {
            const jobs = await Job.find();
            res.status(200).json({
                success: true,
                results: jobs.length,
                data: jobs,
            });
        }
    b. Now open postman and send GET request as "{{DOMAIN}}/api/v1/jobs" and you will get the details from database.
5. Setting up location in database
    a. open models/jobs.js and add below details after address
            location: {
                type: {
                    type: String,
                    enum: ['Point']
                },
                coordinates: {
                    type: [Number],
                    index: '2dsphere'
                },
                formattedAddress: String,
                city: String,
                state: String,
                zipcode: String,
                country: String
            },
    b. create free account in http://developer.mapquest.com/ and add that api key in config/config.env
        GEOCODER_PROVIDER = mapquest
        GEOCODER_API_KEY=
    c. run "npm i --save node-geocoder" to install node geocoder
    d. create utils/geocoder.js file const nodeGeocoder = require('node-geocoder');

        const options = {
            provider: process.env.GEOCODER_PROVIDER,
            httpAdapter: 'https',
            apiKey: process.env.GEOCODER_API_KEY,
            formatter: null
        }

        const geocoder = nodeGeocoder(options);

        module.exports = geocoder;
    d. open models/jobs.js and add the following details
        //setting up location before saving to database
        jobSchema.pre('save', async function (next) {

            const loc = await geoCoder.geocode(this.address); //since it return promise, we need await for it
            this.location = {
                type: 'Point',
                coordinates: [loc[0].longitude, loc[0].latitude],
                formattedAddress: loc[0].formattedAddress,
                city: loc[0].city,
                state: loc[0].state,
                zipcode: loc[0].zipcode,
                country: loc[0].countryCode
            }

        });
    e. Delete the existing record in db and send the POST request again from postman and now you can see the formatted address details.
    f. Now open postman and save the postman POST request as follows under nodeapi and jobs folder
        Request Name: "Create new job"
        Request description: "create and add job to db. user must be authenticated and must be employeer."
6. Search jobs within Distance/radius
    a. open controllers/jobsController.js and add following code.
        const geoCoder = require('../utils/geocoder');
        
        //search jobs within radius => /api/v1/jobs/:zipcode/:distance
        exports.getJobsInRadius = async (req, res, next) => {
            const { zipcode, distance } = req.params;

            //getting latitude and longitude from geocoder with zipcode
            const loc = await geoCoder.geocode(zipcode);
            const latitude = loc[0].latitude;
            const longitude = loc[0].longitude;
            const radius = distance / 3963; //radius of earth in miles

            const jobs = await Job.find({
                location: { $geoWithin: { $centerSphere: [[longitude, latitude], radius] } } //here we use mongodb geowithin function
            });

            res.status(200).json({
                success: true,
                results: jobs.length,
                data: jobs
            })

        };
    b. open routes/jobs.js and add the following route and modify jobscontroller method
        const {
            getJobs,
            newJob,
            getJobsInRadius
        } = require('../controllers/jobsController');


        router.route('/jobs/:zipcode/:distance').get(getJobsInRadius);
    c. Open postman and create new tab with url "{{DOMAIN}}/api/v1/jobs/22554-7763/55" and set the preset to "set-json-header"
        and you should see one successful result.
    d. Now, post another job through "Create new job" with following details
        {
            "title": "Node JS Intern",
            "description": "Must be a full stack developer, able to implement everything in a MEAN or MERN stack paradigm (MongoDB, express, Angular and/or React, and Node.js.",
            "email":"employeer@gmail.com",
            "address":"651 Rr 2, Oquawka, IL, 61469",
            "company":"Knack Ltd",
            "industry":[
                "Information Technology"
                ],
            "jobType": "Internship",
            "minEducation": "Bachelors",
            "positions":1,
            "experience":"No Experience",
            "salary":15000
        }
        if you use "Get all jobs", you will see 2 results.
        if you use Get request with url "{{DOMAIN}}/api/v1/jobs/37308/55", you will get the new result. (For some reason, Geocoder identified 61469 zipcode as 37308 in my case)
        Finally save this request as "Get Job with in Radius/Distance" and with description "All jobs within specific distance/radius by providing zipcode."
7. Update Job:
    a. open controllers/jobsController.js and add following lines
        //Update a Job => /api/v1/job/:id
        exports.updateJob = async (req, res, next) => {
            let job = await Job.findById(req.params.id);

            if (!job) {
                res.status(404).json({
                    success: false,
                    message: 'Job not found.'
                })
            }

            job = await Job.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
                useFindAndModify: false
            });
            res.status(200).json({
                success: true,
                message: 'Job is updated.',
                data: job
            })
        };
    b. open routes/jobs.js and add the following route and modify jobscontroller method
        const {
            getJobs,
            newJob,
            getJobsInRadius,
            updateJob
        } = require('../controllers/jobsController');

        router.route('/job/:id').put(updateJob);
    c. Now open postman and use PUT request with url "{{DOMAIN}}/api/v1/job/5ea2f29bab67e8755b2a7260" and update title for the existing job.
        Here job id is picked from db which was auto generated when we stored the job record in our earlier steps. 
            {
                "title":"Ruby on Rails Developer Software Engineer"
            }
        Finally save it as "Update Job" and description "update job using id."
        
8. Delete Job
    a. open controllers/jobsController and add the following
        //Delete a Job => /api/v1/job/:id
        exports.deleteJob = async (req, res, next) => {
            let job = await Job.findById(req.params.id);

            if (!job) {
                res.status(404).json({
                    success: false,
                    message: 'Job not found.'
                })
            }

            job = await Job.findByIdAndDelete(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Job is deleted.'
            })
        };
    b. open routes/jobs.js add the following route and modify jobscontroller method
        const {
            getJobs,
            newJob,
            getJobsInRadius,
            updateJob,
            deleteJob
        } = require('../controllers/jobsController');

        router.route('/job/:id')
            .put(updateJob)
            .delete(deleteJob);
    c. Now open postman and use DELETE request with url "{{DOMAIN}}/api/v1/job/5ea2f29bab67e8755b2a7260" and it should delete the existing job.
        {
            "success": true,
            "message": "Job is deleted."
        }
        Finally save it as "Delete Job" and description "delete job using id."
9. Get single job by id and slug
    a. open controllers/jobsController.js and add the following
        //Get single job with id and slug => /api/v1/job/:id/:slug
        exports.getJob = async (req,res,next) =>{
            const job = await Job.findById(req.params.id);
            
            if (!job) {
                res.status(404).json({
                    success: false,
                    message: 'Job not found.'
                })
            }

            res.status(200).json({
                success:true,
                data:job
            });

        };
    b. open routes/jobs.js and add the following route and modify jobscontroller method
        const {
            getJobs,
            newJob,
            getJobsInRadius,
            updateJob,
            deleteJob,
            getJob
        } = require('../controllers/jobsController');

        router.route('/job/:id/:slug').get(getJob);
    c. Now open postman and create GET request with url "{{DOMAIN}}/api/v1/job/5ea305ecb40dbb2cfb967111/node-js-intern" or
        ""{{DOMAIN}}/api/v1/job/5ea305ecb40dbb2cfb967111/node-js-inter", it gives the result.
    d. To fix it, open controllers/jobsController.js and edit the following
        //Get single job with id and slug => /api/v1/job/:id/:slug
        exports.getJob = async (req, res, next) => {
            const job = await Job.find({ $and: [{ _id: req.params.id }, { slug: req.params.slug }] });

            if (!job || job.length === 0) {
                res.status(404).json({
                    success: false,
                    message: 'Job not found.'
                })
            }

            res.status(200).json({
                success: true,
                data: job
            });

        };
    e. Now open postman and create GET request with url "{{DOMAIN}}/api/v1/job/5ea305ecb40dbb2cfb967111/node-js-inter", it displays
        {
            "success": false,
            "message": "Job not found."
        }
    Finally save it as "Get single job by id and slug" and description "Get single job by providing id and slug."
10. Get Jobs Statistics using aggregation
    a. Now open postman and create couple of jobs using "create new job" with below details
        {
            "title": "Node JS Developer",
            "description": "Must be a full stack developer, able to implement everything in a MEAN or MERN stack paradigm (MongoDB, express, Angular and/or React, and Node.js.",
            "email":"employeer@gmail.com",
            "address":"651 Rr 2, Oquawka, IL, 61469",
            "company":"Knack Ltd",
            "industry":[
                "Information Technology"
                ],
            "jobType": "Internship",
            "minEducation": "Bachelors",
            "positions":10,
            "experience":"No Experience",
            "salary":95000
        }


        {
            "title": "Node JS Expert Developer",
            "description": "Must be a full stack developer, able to implement everything in a MEAN or MERN stack paradigm (MongoDB, express, Angular and/or React, and Node.js.",
            "email":"employeer@gmail.com",
            "address":"651 Rr 2, Oquawka, IL, 61469",
            "company":"Knack Ltd",
            "industry":[
                "Information Technology"
                ],
            "jobType": "Internship",
            "minEducation": "Bachelors",
            "positions":2,
            "experience":"No Experience",
            "salary":125000
        }
    Verify with "Get all Jobs" and you should have three results.
    b. open controllers/jobsController.js and add below details
        //Get stats about a topic(job) => /api/v1/stats/:topic
        exports.jobStats = async (req, res, next) => {
            const stats = await Job.aggregate([
                {
                    $match: { $text: { $search: "\"" + req.params.topic + "\"" } }
                },
                {
                    $group: {
                        _id: null,
                        avgSalary: { $avg: '$salary' }
                    }
                }

            ]);
            if (stats.length === 0) {
                return res.status(200).json({
                    success: false,
                    message: `No stats found for - ${req.params.topic}`

                })
            }
            res.status(200).json({
                success: true,
                data: stats
            })
        };
    c. Open routes/jobs.js and add the following route and modify jobscontroller method
        const {
            getJobs,
            newJob,
            getJobsInRadius,
            updateJob,
            deleteJob,
            getJob,
            jobStats
        } = require('../controllers/jobsController');

        router.route('/stats/:topic').get(jobStats);
    d. Now open postman and create GET request with url "{{DOMAIN}}/api/v1/stats/node". This request fails since we don't have an index
    e. open Mongo shell
        sudo mongod
        use jobs
        db.jobs.find()
        db.jobs.createIndex({title:"text"}) //creating index on title property. 
    f. Now open postman and create GET request with url "{{DOMAIN}}/api/v1/stats/node". This should give result like
        {
            "success": true,
            "data": [
                {
                    "_id": null,
                    "avgSalary": 78333.33333333333
                }
            ]
        }
    g. Now let's go back and some more values in controllers/jobsController.js
        //Get stats about a topic(job) => /api/v1/stats/:topic
        exports.jobStats = async (req, res, next) => {
            const stats = await Job.aggregate([
                {
                    $match: { $text: { $search: "\"" + req.params.topic + "\"" } }
                },
                {
                    $group: {
                        _id: {$toUpper:'$experience'},   //Here to group the id by experience, we use this
                        totalJobs:{$sum: 1},
                        avgPosition: { $avg: '$positions' },
                        avgSalary: { $avg: '$salary' },
                        minSalary: { $min: '$salary' },
                        maxSalary: { $max: '$salary' },
                    }
                }

            ]);
            if (stats.length === 0) {
                return res.status(200).json({
                    success: false,
                    message: `No stats found for - ${req.params.topic}`

                })
            }
            res.status(200).json({
                success: true,
                data: stats
            })
        };
    h. Now open postman and create GET request with url "{{DOMAIN}}/api/v1/stats/node". This should give result like
        {
            "success": true,
            "data": [
                {
                    "_id": "NO EXPERIENCE",
                    "totalJobs": 3,
                    "avgPosition": 4.333333333333333,
                    "avgSalary": 78333.33333333333,
                    "minSalary": 15000,
                    "maxSalary": 125000
                }
            ]
        }
    i. Now let's open compass and edit any two of the records experience to  '2 Years - 5 Years' and '5 Years+' and open postman and create GET request with url "{{DOMAIN}}/api/v1/stats/node". This should give result like
        {
            "success": true,
            "data": [
                {
                    "_id": "2 YEARS - 5 YEARS",
                    "totalJobs": 1,
                    "avgPosition": 1,
                    "avgSalary": 15000,
                    "minSalary": 15000,
                    "maxSalary": 15000
                },
                {
                    "_id": "5 YEARS+",
                    "totalJobs": 1,
                    "avgPosition": 10,
                    "avgSalary": 95000,
                    "minSalary": 95000,
                    "maxSalary": 95000
                },
                {
                    "_id": "NO EXPERIENCE",
                    "totalJobs": 1,
                    "avgPosition": 2,
                    "avgSalary": 125000,
                    "minSalary": 125000,
                    "maxSalary": 125000
                }
            ]
        }
    Save this request as "Get Job stats" and description "Get all job statistics"
Advance Global Error Handling
*****************************
1. Creating Error Handling Class
    a. create utils/errorHandler.js file with following details
        class ErrorHandler extends Error {
            constructor(message, statusCode) {
                super(message);
                this.statusCode = statusCode;

                Error.captureStackTrace(this, this.constructor)
            }
        }

        module.exports = ErrorHandler;
2. Creating Errors middleware
    a. create middlewares/errors.js file with following details
        
        module.exports = (err, req, res, next) => {
            err.statusCode - err.statusCode || 500;
            err.message = err.message || 'Internal Server Error.';

            res.status(err.statusCode).json({
                success: false,
                message: err.message
            });
        } 
3. Production vs development errors
    a. To seggregate both errors, we will replace middlewares/errors.js as follows
        module.exports = (err, req, res, next) => {
            err.statusCode = err.statusCode || 500;

            if (process.env.NODE_ENV === 'development') {
                res.status(err.statusCode).json({
                    success: false,
                    error: err,
                    errMessage: err.message,
                    stack: err.stack
                })
            }

            if (process.env.NODE_ENV === 'production') {
                let error = { ...err };
                error.message = err.message;

                res.status(err.statusCode).json({
                    success: false,
                    message: error.message || 'Internal Server Error.'
                })
            }
        }
    b. Open controllers/jobController.js and import
        const ErrorHandler = require('../utils/errorHandler');
       We will replace below portion of code in updateJob function  
            if (!job) {
                res.status(404).json({
                    success: false,
                    message: 'Job not found.'
                })
            }
            
        Replace it as below    
            if (!job) {
                return next(new ErrorHandler('Job not found',404));
            }
    c. Now if you open postman and try "update job"  with fake id like {{DOMAIN}}/api/v1/job/5ea2f29bab67e8755b2a7265. it returns results in html
            <!DOCTYPE html>
            <html lang="en">

            <head>
                <meta charset="utf-8">
                <title>Error</title>
            </head>

            <body>
                <pre>Error: Job not found<br> &nbsp; &nbsp;at exports.updateJob (/home/fpengine/mysrc/nodeapi/controllers/jobsController.js:51:21)<br> &nbsp; &nbsp;at processTicksAndRejections (internal/process/task_queues.js:97:5)</pre>
            </body>

            </html>
        it is because we haven't imported middlewares
    d. open app.js and edit the following details
            const errorMiddleware = require('./middlewares/errors');

            //middleware to handle errors
            app.use(errorMiddleware);
    e. Now if you open postman and try "update job"  with fake id like {{DOMAIN}}/api/v1/job/5ea2f29bab67e8755b2a7265. it returns results as below
            {
                "success": false,
                "error": {
                    "statusCode": 404
                },
                "errMessage": "Job not found",
                "stack": "Error: Job not found\n    at exports.updateJob (/home/fpengine/mysrc/nodeapi/controllers/jobsController.js:51:21)\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)"
            }
        you can even run as "npm run prod" and verify how it appears in production
4. Catching async errors
    a. To simulate the error, open postman and use "create new job" and in body remove title field and send the POST request, postman will stuck since response failed, however we don't see it because it's not handled and you can see it console.log as well. Either you can do try catch block or global handler class
    b. create middlewares/catchAsyncErrors.js as follows
        module.exports = func => (req, res, next) => 
            Promise.resolve(func(req,res,next))
            .catch(next);
    c. open controllers/jobController.js and add the following
        const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
        
        wrap catchAsyncErrors () function around newJob function as below
            // Create a new job => /api/v1/job/new
            exports.newJob = catchAsyncErrors ( async (req, res, next) => {
                const job = await Job.create(req.body); //since we will use global error handlers, we are not using try catch(promise) concept, instead we use await.
                //Also, since we use await, we need async function.
                res.status(200).json({
                    success: true,
                    message: 'Job Created',
                    data: job
                });
            });
    d. if you open postman and use "create new job" and in body remove title field and send the POST request, it returns the result as follows
        {
            "success": false,
            "error": {
                "errors": {
                    "title": {
                        "message": "Please enter job title",
                        "name": "ValidatorError",
                        "properties": {
                            "message": "Please enter job title",
                            "type": "required",
                            "path": "title"
                        },
                        "kind": "required",
                        "path": "title"
                    }
                },
                "_message": "Job validation failed",
                "message": "Job validation failed: title: Please enter job title",
                "name": "ValidationError",
                "statusCode": 500
            },
            "errMessage": "Job validation failed: title: Please enter job title",
            "stack": "ValidationError: Job validation failed: title: Please enter job title\n    at new ValidationError (/home/fpengine/mysrc/nodeapi/node_modules/mongoose/lib/error/validation.js:31:11)\n    at model.Document.invalidate (/home/fpengine/mysrc/nodeapi/node_modules/mongoose/lib/document.js:2555:32)\n    at /home/fpengine/mysrc/nodeapi/node_modules/mongoose/lib/document.js:2377:17\n    at /home/fpengine/mysrc/nodeapi/node_modules/mongoose/lib/schematype.js:1105:9\n    at processTicksAndRejections (internal/process/task_queues.js:79:11)"
        }
    e. Finally wrap all methods in catchAsyncErrors() method.
5. Handling Unhandled Promise Rejection
    a. To simulate this error, open config/config.env and edit
        DB_LOCAL_URI = mongodb://localhost:27017/jobs to 
        DB_LOCAL_URI = mongod://localhost:27017/jobs
        and now you get unhandled promise rejection
    b. open app.js and edit following
        create "const server = " variable for the server

        //Handling unhandled Promise Rejection

        process.on('unhandledRejection', err => {
            console.log(`Error: ${err.message}`);
            console.log('Shutting Down the server due to unhandled promise rejection');
            server.close(() => {
                process.exit(1);
            })
        });
        Now this handles the exception and prints the log, so go back and restore config/config.env file
6. Handling Uncaught Exceptions
    a. To simulate the error, open app.js and at the end add and save following
        console.log(dsdd);
    b. To handle this error, open app.js and before connecting to db(otherwise, if you create this at the end, it may not handle error), add the following
        //Handling uncaught exception
        process.on('uncaughtException',err => {
            console.log(`Error: ${err.message}`);
            console.log('Shutting down the server due to uncaught exception');
            process.exit(1);
        });
        Now this handles the exception and prints the log, so remove the last line
            console.log(dsdd);
7. Handle Unhandled Routes
    a. To simulate the error, open postman and send get request {{DOMAIN}}/api/v1/job and the response is 
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="utf-8">
            <title>Error</title>
        </head>

        <body>
            <pre>Cannot GET /api/v1/job</pre>
        </body>

        </html> 
    a. Open app.js and add the following after app.use('/api/v1/jobs') so that it captures the unhandled routes exceptions
        const errorHandler = require('./middlewares/errors');
        
        //Handle unhandled routes
        app.all('*',(req,res,next) => {
            next(new errorHandler(`${req.originalUrl} route not found`,404))
        });
    b. Now open postman and send get request {{DOMAIN}}/api/v1/job and the response is 
        {
            "success": false,
            "error": {
                "statusCode": 404
            },
            "errMessage": "/api/v1/job route not found",
            "stack": "Error: /api/v1/job route not found\n    at /home/fpengine/mysrc/nodeapi/app.js:48:10\n    at Layer.handle [as handle_request] (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/layer.js:95:5)\n    at next (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/route.js:137:13)\n    at next (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/route.js:131:14)\n    at next (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/route.js:131:14)\n    at next (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/route.js:131:14)\n    at next (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/route.js:131:14)\n    at next (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/route.js:131:14)\n    at next (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/route.js:131:14)\n    at Route.dispatch (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/route.js:112:3)\n    at Layer.handle [as handle_request] (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/layer.js:95:5)\n    at /home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/index.js:281:22\n    at param (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/index.js:354:14)\n    at param (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/index.js:365:14)\n    at Function.process_params (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/index.js:410:3)\n    at next (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/index.js:275:10)\n    at /home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/index.js:635:15\n    at next (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/index.js:260:14)\n    at Function.handle (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/index.js:174:3)\n    at router (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/index.js:47:12)\n    at Layer.handle [as handle_request] (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/layer.js:95:5)\n    at trim_prefix (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/index.js:317:13)\n    at /home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/index.js:284:7\n    at Function.process_params (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/index.js:335:12)\n    at next (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/index.js:275:10)\n    at jsonParser (/home/fpengine/mysrc/nodeapi/node_modules/body-parser/lib/types/json.js:110:7)\n    at Layer.handle [as handle_request] (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/layer.js:95:5)\n    at trim_prefix (/home/fpengine/mysrc/nodeapi/node_modules/express/lib/router/index.js:317:13)"
        }
8. Validation & Mongoose ID Errors
    a. To simulate the mongoose id error, open postman and use Update job and change id to gibberish value like {{DOMAIN}}/api/v1/job/ahjss89skjahsl
    you will get cast error.
    b. open middlewares/errors.js and import ErrorHandler add the following within production error handler condition


        //Wrong Mongoose Object ID error
        if(err.name ==='CastError'){
            const message = `Resource not found. Invaid: ${err.path}`;
            error = new ErrorHandler(message,404)
        }
    c. Now run npm run prod and open postman and use Update job and change id to gibberish value like {{DOMAIN}}/api/v1/job/ahjss89skjahsl
        {
            "success": false,
            "message": "Resource not found. Invaid: _id"
        }
    d. To simulate validation error, open postman and use Create new job and remove title and experience fields and send the POST request
        you will see multiple errors.
    e. Open middlewares/errors.js and add the following
        //Handling Mongoose validation Error //To handle multiple validation errors
        if(err.name==='ValidationError'){
            const message = Object.values(err.errors).map(value =>value.message);
            error = new ErrorHandler(message,400);
        }
        Also change "res.status(err.statusCode).json" to "res.status(error.statusCode).json"
    f. Run "npm run prod" and open postman and use Create new job and remove title and experience fields and send the POST request
        you will see response as dollows
        {
            "success": false,
            "message": "Path `experience` is required.,Path `jobType` is required.,Please enter job title"
        }
9. Using Error Handler + Bug Fixing
    a. open models/jobs and change below things for industry, jobType, experience
        required: [true,'Please enter industry for this job'],
        required: [true,'Please enter jobType'],
        required: [true,'Please enter min education for this job type'],
        required: [true,'Please enter experience required for this job'],
    b. open postman and use Create new job and remove title,jobtype and experience fields and send the POST request
        you will see following error when we run "npm run prod"
            {
                "success": false,
                "message": "Please enter experience required for this job,Please enter jobType,Please enter job title"
            }
    c. Apply error handler to all controller methods in getJob, deleteJob and jobStats functions
            return next(new ErrorHandler('Job not found',404));

            return next(new ErrorHandler('No stats found for - ${req.params.topic}',200));


