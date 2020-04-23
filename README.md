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