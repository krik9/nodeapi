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
    c. Download and install mongo shell based on your OS and run "sudo mongo" to start the shell and execute "show dbs;" to see if it works
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
Adding Filters to API
*********************
1. Advanced Filter for Jobs
    a. create utils/apiFilters.js with following details
        class APIFilters {
            constructor(query, queryStr) {
                this.query = query;
                this.queryStr = queryStr;
            }

            filter() {
                const queryCopy = { ...this.queryStr };
                //Advance Filter using lt, lte, gt, gte
                let queryStr = JSON.stringify(queryCopy);
                queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

                this.query = this.query.find(JSON.parse(queryStr));
                return this;

            }
        }

        module.exports = APIFilters;
    b. open controllers/jobsController.js and add the following
        const APIFilters=require('../utils/apiFilters');

        add below two lines in get all jobs function
        const apiFilters = new APIFilters(job.find(),req.query).filter();
        const jobs = await apiFilters.query;

    c. Now open mongo compass and edit one of the document jobType to Permanent
    d. Now open postman GET all jobs request and add query string ?jobType=Permanent(ex: {{DOMAIN}}/api/v1/jobs?jobType=Permanent)and send request
        you should see one result. you can also try query string ?salary[gt]=100000 and you should see one result

2. Sorting Jobs
    a. open utils/apiFilters.js and ammend the following
        Add below lines in filter function
            //Removing fields from the query
            const removeFields = ['sort'];
            removeFields.forEach(e1=>delete queryCopy[e1]);
        Also, add sort function 
            sort(){
                if(this.queryStr.sort){
                    const sortBy=this.queryStr.sort.split(',').join(' ');
                    this.query=this.query.sort(sortBy);
                }else{
                    this.query = this.query.sort('-postingDate')
                }
                return this;
            }
    b. open controllers/jobsController.js and add sort() function call as well as below
        const apiFilters = new APIFilters(Job.find(),req.query)
                        .filter()
                        .sort();
    c. Open postman and send request as "{{DOMAIN}}/api/v1/jobs?sort=-salary,JobType" to sort by salary in descending order and JobType. 
        if we have two same salaries, then it will sort between them using jobType.
        because of else, it will always sort the data by posting date in descending order.
        To combine both filter and sort and test you can do something like 
            {{DOMAIN}}/api/v1/jobs?salary[gt]=90000&sort=salary
3. Limiting fields for Jobs
    a. open utils/apiFilters.js and ammend the following
            const removeFields = ['sort','fields'];
        Also, add limitFields() function
            limitFields() {
                if (this.queryStr.fields) {
                    const fields = this.queryStr.fields.split(',').join(' ');
                    this.query = this.query.select(fields);
                }else{
                    this.query=this.query.select("-__v"); //To exclude this field by default
                }
                return this;
            }
    b. open controllers/jobsController.js and add limitFields() function call as well as below
        const apiFilters = new APIFilters(Job.find(),req.query)
                        .filter()
                        .sort()
                        .limitFields();
    c. Now open postman and try the following
        {{DOMAIN}}/api/v1/jobs?salary[gt]=90000&sort=salary&fields=lastDate,salary
4. Search Jobs by Query
    a. open utils/apiFilters.js and ammend the following
            const removeFields = ['sort','fields','q'];
        Also, add searchByQuery() function
            searchByQuery() {
                if (this.queryStr.q) {
                    const qu = this.queryStr.q.split('-').join(' ');
                    this.query = this.query.find({ $text: { $search: "\"" + qu + "\"" } });  
                                                    //this works on title because we already created index
                }
                return this;
            }
    b. open controllers/jobsController.js and add searchByQuery() function call as well as below
            const apiFilters = new APIFilters(Job.find(),req.query)
                        .filter()
                        .sort()
                        .limitFields()
                        .searchByQuery();
    c. Now open postman and try the following
        {{DOMAIN}}/api/v1/jobs?salary[gt]=90000&sort=salary&fields=lastDate,salary&q=node-js.
            Note: this works on title because we already created index. Also for q param, it is case insensitive.
5. Adding Pagination
    a. open utils/apiFilters.js and ammend the following
            const removeFields = ['sort', 'fields', 'q','page','limit'];
        Also, add pagination() function
                pagination() {
                    const page = parseInt(this.queryStr.page, 10) || 1;
                    const limit = parseInt(this.queryStr.limit, 10) || 10;
                    const skipResults = (page - 1) * limit;

                    this.query = this.query.skip(skipResults).limit(limit);

                    return this;
                }
    b. open controllers/jobsController.js and add pagination() function call as well as below
         const apiFilters = new APIFilters(Job.find(),req.query)
                        .filter()
                        .sort()
                        .limitFields()
                        .searchByQuery()
                        .pagination();
    c. Now open postman and try the following
        {{DOMAIN}}/api/v1/jobs?limit=2&page=2
        This displays page two with limit of 2 records per page.

Authentication, Users & Authorization
*************************************
1. Create User Model
    a. create models/users.js with the following data
        const mongoose = require('mongoose');
        const validator = require('validator');

        const userSchema = new mongoose.Schema({
            name: {
                type: String,
                required: [true, 'Please enter your name']
            },
            email: {
                type: String,
                required: [true, 'PLease enter your email address'],
                unique: true,
                validate: [validator.isEmail, 'Please enter valid email address']
            },
            role: {
                type: String,
                enum: {
                    values: ['user', 'employeer'],
                    message: 'Please select correct role'
                },
                default: 'user'
            },
            password: {
                type: String,
                required: [true, 'Please enter password for your account'],
                minlength: [8, 'your password must be at least 8 characters long'],
                select: false
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            resetPasswordToken: String,
            resetPasswordExpire: Date

        });

        module.exports = mongoose.model('User', userSchema);
2. Encrypting Password while Registration
    a. create controllers/authController.js and add the following data 
        const User = require('../models/users');
        const catchAsyncErrors = require('../middlewares/catchAsyncErrors');


        //Register a new user => /api/v1/register
        exports.registerUser = catchAsyncErrors(async (req, res, next) => {
            const { name, email, password, role } = req.body;

            const user = await User.create({
                name,
                email,
                password,
                role
            });

            res.status(200).json({
                success: true,
                message: 'User is registered.',
                data: user
            });
        });
    b. create routes/auth.js and add the following
        const express = require('express');
        const router = express.Router();

        const { registerUser} = require('../controllers/authController');

        router.route('/register').post(registerUser);

        module.exports = router;
    c. open app.js and add the following lines
        const auth = require('./routes/auth');
        app.use('/api/v1', auth);
    d. open postman and add the following
        right click on nodeapi folder and click on "Add Folder" and create folder with name as "Authentication" and 
        description as "All routes related to authentication like: register a new user, login in user, password reset etc." 
        Click on newly created Authentication folder and click on create request (+) button and change it to post request
        and then click on headers and click on presets and then click on "Set JSON Header".
        Click on Body and choose raw and format JSON and then type the body as follows
        {
            "name":"test user",
            "email":"test@gmail.com",
            "password":"simple1234",
            "role":"employeer"
        } 
        Now choose the url as "{{DOMAIN}}/api/v1/register" and click send. In successful scenario, it sends something like
        {
            "success": true,
            "message": "User is registered.",
            "data": {
                "role": "employeer",
                "_id": "5ec8ba0b50e9421efc532f1c",
                "name": "test user",
                "email": "test@gmail.com",
                "password": "simple1234",
                "createdAt": "2020-05-23T05:52:11.936Z",
                "__v": 0
            }
        }
    e. if you notice the response/mongo db records, password is stored in plain text, to make sure, we encrypt the password,
        we use bcryptjs. 
        npm i --save bcryptjs

        Now modify models/user.js and append
        const bcrypt = require('bcryptjs');

        // Encrypting passwords before saving
        userSchema.pre('save', async function (next) {
            this.password = await bcrypt.hash(this.password,10)
        });
    f. Now if you retry sending same request from postman, you will see an error saying, duplicate key error and you can see
         the error code 11000, so open middlewares/errors.js and append below code for production scenario. 
                // Handle mongoose duplicate key error 
                if(err.code === 11000){
                    const message = `Duplicate ${Object.keys(err.keyValue)} entered.`;
                    error = new ErrorHandler(message,400);
                }
    g. Now if you send a new request from postman as below.
        {
            "name":"test user",
            "email":"tst@gmail.com",
            "password":"simple1234",
            "role":"user"
        }
       response will be 
        {
            "success": true,
            "message": "User is registered.",
            "data": {
                "role": "user",
                "_id": "5ec8d6b5a93caf3208bda2ba",
                "name": "test user",
                "email": "tst@gmail.com",
                "password": "$2a$10$GpM0tJNZen2h3NH7QjSfCekm28uG48JjOEYzfmJTnZs.32kTkFi4m",
                "createdAt": "2020-05-23T07:54:29.807Z",
                "__v": 0
            }
        }
        so we can see that password is encrypted.
    h.  Now open postman and click on save to save the request as follows. 
            Request Name: "Register User"
            Request Description: "Register user with email, password & role. Encrypted password will be saved in database."
            choose Authentication folder and click on "save to Authentication".
3. Generate JSON Web Token
    a. we use json web token to verify our users. refer "jwt.io" website. basically it has 3 parts like headers, payload and 
        verify signature. so install jsonwebtoken package 
        npm i --save jsonwebtoken
    b. open models/users.js and append the following
        const jwt = require('jsonwebtoken');

        // Return JSON Web Token
        userSchema.methods.getJWTToken = function () {
            return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_TIME
            });
        }
        }
    c. open config/config.env and append the following
        //Make some gibberish powerful string 
        JWT_SECRET = dfdfkffhdhdld0380370833ccdb
        //Token expires after 7 days
        JWT_EXPIRES_TIME = 7d
    d. open controllers/authController.js and append the following
        //create JWT token
        const token = user.getJWTToken();

        Replace data:user with token in response // you can simply specify token here instead of token:token

         res.status(200).json({
            success: true,
            message: 'User is registered.',
            token
        });
    e. delete user records from mongodb and resend the earlier post request in postman with url: {{DOMAIN}}/api/v1/register
        you will see the response like this
            {
                "success": true,
                "message": "User is registered.",
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlYzkxNzc1YmIxMzhhNWEwZTI1N2YzNCIsImlhdCI6MTU5MDIzNzA0NSwiZXhwIjoxNTkwODQxODQ1fQ.QvZEE_B41f9ym9QxbsJLt4YRrnumkR2MC1gOc6Y4KIY"
            }
4. Login User & Assign Token
    a. open controllers/authController.js and append the following
        const ErrorHandler = require('../utils/errorHandler');

        // Login user => /api/v1/login
        exports.loginUser = catchAsyncErrors(async (req, res, next) => {
            const { email, password } = req.body;

            //checks if email/password is not entered by user
            if (!email || !password) {
                return next(new ErrorHandler('Please enter email & password', 400));
            }

            // Finding user in database
            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                return next(new ErrorHandler('Invalid Email or Password', 401));
            }

            // Check if Password is correct
            const isPasswordMatched = await user.comparePassword(password);

            if (!isPasswordMatched) {
                return next(new ErrorHandler('Invalid Email or Password', 401));
            }

            // Create JSON web Token
            const token = user.getJWTToken();

            res.status(200).json({
                success: true,
                token
            })

        });
    b. open models/users.js and append the following
        // Compare user password in database password
        userSchema.methods.comparePassword = async function (enterPassword) {
            return await bcrypt.compare(enterPassword, this.password);
        }
    c. open routes/auth.js and append the following
        const { 
            registerUser,
            loginUser
        } = require('../controllers/authController');
        
        router.route('/login').post(loginUser);
    d. open postman and click on create request (+) button and change it to post request
        and then click on headers and click on presets and then click on "Set JSON Header".
        Click on Body and choose raw and format JSON and then type the body as follows
        {
            "email":"tst@gmail.com",
            "password":"simple123"
        }
        response should be 
        {
            "success": false,
            "error": {
                "statusCode": 401
            },
            "errMessage": "Invalid Email or Password",
            "stack": "Error: Invalid Email or Password\n    at /home/fpengine/mysrc/nodeapi/controllers/authController.js:46:21"
        }
        same thing should happen in case of incorrect email or/and password.
        After entering correct email and password, you should get something like
            {
                "success": true,
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlYzkxNzc1YmIxMzhhNWEwZTI1N2YzNCIsImlhdCI6MTU5MDI0ODUwOCwiZXhwIjoxNTkwODUzMzA4fQ.SGvA7-0wA-Rw9EZn9tZdzKs5MtNXElM83rbg42jx_oo"
            }
        Now open postman and click on save to save the request as follows. 
            Request Name: "Login User"
            Request Description: "Login user with email & password"
            choose Authentication folder and click on "save to Authentication".

5. Sending JWT Token in Cookie
    a.create utils/jwtToken.js and add the following 
        // Create and send token and save in cookie
        const sendToken = (user, statusCode, res) => {
            //create JWT Token
            const token = user.getJWTToken();

            // Options for cookie
            const options = {
                expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000),
                httpOnly: true
            }

            res
                .status(statusCode)
                .cookie('token', token, options)
                .json({
                    success: true,
                    token
                });
        }

        module.exports = sendToken;
    b. now install cookie-parser
        npm i --save cookie-parser
    c. open app.js and append the following
        const cookieParser = require('cookie-parser');

        //set cookie-parser
        app.use(cookieParser());
    d. open controllers/authController.js and append the following
        const sendToken = require('../utils/jwtToken');

        Replace this
            //create JWT token
            const token = user.getJWTToken();

            res.status(200).json({
                success: true,
                message: 'User is registered.',
                token
            });
        with 
            sendToken(user, 200,res); in registerUser method. 
        similarly do the same in loginUser method and replace
                // Create JSON web Token
                const token = user.getJWTToken();

                res.status(200).json({
                    success: true,
                    token
                })
        with 
            sendToken(user, 200,res);
    e. open config/config.env and add the following 
        COOKIE_EXPIRES_TIME = 7
    f. open postman and click on "Login user" post request and click on send 
        you can now observe the cookie in response with expiry time and httpOnly: true
    h. open utils/jwtToken.js and add the following
            if(process.env.NODE_ENV === 'production') {
                options.secure = true
            }
        if you run npm run prod and if you have ssl, only then you will see the cookie. 

6. Protect Routes from Unauthorized Users
    a. comment the following code for now in utils/jwtToken.js
            // if(process.env.NODE_ENV === 'production') {
            //     options.secure = true
            // }
    b. To allow only authorised users to create a job, we need a request header called "Authorization" that starts with Bearer and space and then token. For this, we need to create middlewares/auth.js as follows

        const jwt = require('jsonwebtoken');
        const User = require('../models/users');
        const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
        const ErrorHandler = require('../utils/errorHandler');

        //check if user is authenticated or not
        exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
            let token;

            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
            }

            if (!token) {
                return next(new ErrorHandler('Login first to access the resource.', 401));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);

            next();

        });
    c. open routes/jobs.js and add the following
        const { isAuthenticatedUser } = require('../middlewares/auth');

        and modify new job route as below
        router.route('/job/new').post(isAuthenticatedUser, newJob);
    d. open postman and click on create new job and send the request, now the response will be 401 and error message: "Login
        first to access the resource."
            Now click on "Login user" and send login post request from postman and copy the token from response 
            click on create new job request and for  "Headers" add key as "Authorization" and for value, paste the copied token. change the title to "PHP intern" in body and send the post request. This will create the new job.
    e. Now go to routes/jobs.js and do add the authorization for put and delete job routes as follows. 
        router.route('/job/:id')
        .put(isAuthenticatedUser, updateJob)
        .delete(isAuthenticatedUser, deleteJob);

7. Store JWT Token in Postman
    a. open postman and go to "Login user" post request and go to Tests and write a small script as follows
        pm.environment.set("token",pm.response.json().token)
    b. Now send a login post request and click on "environment quick look" i.e eye button on top right corner to verify the
        presence of token variable.
    c. Now click on "create new job" post request and go to "Authorization" tab and select Type as "Bearer Token" and set the 
        Token value as "{{token}}" and finally save the request. 
    d. change the title to "C intern" in body and send the request and this will create a job.

8. Authorize User Roles & Permissions
    a. 
    
9. Adding User in Jobs
10. Generate forgot Password Token
11. Send Password Recovery Email
12. Reset New Password
13. Handle Wrong JWT Token & Expire JWT Error
14. Logout User

Users & Admin Routes
********************
1. Show User Profile
2. Change/Update Password
3. Update User Data
4. Delete Current User
5. Apply to Job with Resume (PDF or DOCX)
6. Fixing Job Check Error
7. Add Vitual Property & Populate User
8. Delete files associated with User
9. Show all jobs by Current Employer
10. Show all jobs applied by Current User
11. Admin - Show all User
12. Admin - Delete User
13. Check Owner before update & delete Job

RESTful API Security issues
***************************
1. Implementing Rate Limit
2. Setting Security HTTP Headers
3. Data Sanitization
4. Prevent Parameter Pollution
5. Enabling CORS (Cross-Origin Resource Sharing)




MONGO DB 
********
personsCollection.aggregate(
    { $match: {'addresses.city': 'Boston'} },
    { $unwind: '$addresses' },
    { $match: {'addresses.city': 'Boston'} },
    { $group: {'_id': null, 'content': {$addToSet: '$addresses' }}}
)

db.fxlives.aggregate(
    { $match: {'currencyPairs.currencyPair':' EUR/USD'} }, 
    { $unwind: '$currencyPairs' },
    { $match: {'currencyPairs.currencyPair':' EUR/USD'} }, 
    { $group: {'_id': null, 'content': {$addToSet: '$currencyPairs' }}}
)

db.fxlives.aggregate({ $match: {'currencyPairs.currencyPair':' EUR/USD'} },{ $unwind: '$currencyPairs' }{ $match: {'currencyPairs.currencyPair':' EUR/USD'} } { $group: {'_id': null, 'content': {$addToSet: '$currencyPairs' }}})



db.articles.find(
  { stock : { $elemMatch : { country : "01", "warehouse.code" : "02" } } }
).pretty();

db.fxlives.find({currencyPairs:{$elemMatch : { currencyPair:"EUR/USD"}}}).pretty();