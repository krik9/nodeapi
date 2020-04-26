const express = require('express');
const app = express();

const dotenv = require('dotenv');

//Import the database
const connectDatabase = require('./config/database');

const errorMiddleware = require('./middlewares/errors');
const errorHandler = require('./utils/errorHandler');

//setting up config.env file variables
dotenv.config({ path: './config/config.env' });

//Handling uncaught exception
process.on('uncaughtException',err => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to uncaught exception');
    process.exit(1);
});


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

app.all('*',(req,res,next) => {
    
    next(new errorHandler(`${req.originalUrl} route not found`,404))
});

//middleware to handle errors
app.use(errorMiddleware);

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
    console.log(`Server started on PORT ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
});

//Handling unhandled Promise Rejection

process.on('unhandledRejection', err => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting Down the server due to unhandled promise rejection');
    server.close(() => {
        process.exit(1);
    })
});
