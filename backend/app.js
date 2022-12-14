const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const routes = require('./routes'); // Add routes to the Express app

const { environment } = require('./config');
const isProduction = environment === 'production'; // will be true if the environment is in production

const app = express();

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

module.exports = app;
