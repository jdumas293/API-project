const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const routes = require('./routes'); // Add routes to the Express app
const { ValidationError } = require('sequelize'); // Sequelize error handler

const { environment } = require('./config');
const isProduction = environment === 'production'; // will be true if the environment is in production

const app = express(); // Initialize Express


app.use(morgan('dev')); // for logging information about requests and responses
app.use(cookieParser()); // for parsing cookies
app.use(express.json()); // for parsing JSON bodies of requests


// Security Middleware
if (!isProduction) {
    // enable cors only in development
    app.use(cors());
}

// helmet helps set a variety of headers to better secure your app
app.use(
    helmet.crossOriginResourcePolicy({
        policy: "cross-origin"
    })
);

// Set the _csrf token and create req.csrfToken method
app.use(
    csurf({
        cookie: {
            secure: isProduction,
            sameSite: isProduction && "Lax",
            httpOnly: true // CanNOT be read by JavaScript
        }
    })
);


app.use(routes); // Connect all the routes


// Error Handling Middleware
// Catch unhandled requests and forward to error handler
app.use((_req, _res, next) => {
    const err = new Error("The requested resource couldn't be found.");
    err.title = "Resource Not Found";
    err.errors = ["The requested resource couldn't be found."];
    err.status = 404;
    next(err); // error handlers defined after this middleware will be invoked
});

// Sequelize Error-Handler
app.use((err, _req, _res, next) => {
    // check if error is a Sequelize error
    if (err instanceof ValidationError) {
        err.errors = err.errors.map((e) => e.message);
        err.title = 'Validation error';
    }
    next(err);
});

// Error Formatter Error-Handler
app.use((err, _req, res, _next) => {
    res.status(err.status || 500);
    console.error(err);
    res.json({
        title: err.title || 'Server Error',
        message: err.message,
        errors: err.errors,
        stack: isProduction ? null : err.stack
    });
});

module.exports = app;
