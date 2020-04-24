const express = require('express');
const app = express();

const dotenv = require('dotenv');

//Import the database
const connectDatabase = require('./config/database');

//setting up config.env file variables
dotenv.config({ path: './config/config.env' });

//connecting to database
connectDatabase();

//setup body parser
app.use(express.json());

// //creating own middleware
// const middleware = (req, res, next) => {
//     console.log("Hello from middleware");
//     //setting up user variable globally
//     req.user = 'krik9';
//     req.requestMethod = req.method;
//     req.urlpath = req.url;
//     next();
// };

// app.use(middleware);

//Importing all routes
const jobs = require('./routes/jobs');

app.use('/api/v1', jobs);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server started on PORT ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
});