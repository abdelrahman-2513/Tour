const path = require('path')
const express = require('express');
const userRouter = require('./routes/userRouter');
const tourRouter = require('./routes/tourRouter');
const reviewRouter = require('./routes/reviewRouter');
const bookingRouter = require('./routes/bookingRouter');
const viewRouter = require('./routes/viewRouter');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser')

const DB = process.env.DATABASE_CONN.replace('<PASSWORD>', process.env.DATABASE_PASS);

mongoose.connect(DB, {

}).then(() => {
    console.log('Successfully connected to DB')
})







const app = express();


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// using static folders as css and Java script!!!!
app.use(express.static(path.join(__dirname, 'public')))
//1) for security of http requests
// app.use(helmet());

// app.use(helmet.contentSecurityPolicy({ directives: { scriptSrc: ["'self'", "https://cdn.maptiler.com"] } }));


//2) for limiting the requests from saame ip
const limiter = rateLimit({
    max: 100,
    windowsMS: 60 * 60 * 1000,
    message: 'Sorry you have tried alot of requests please wait a hour!'
})

app.use('/api', limiter);



//reading static files
app.use(express.static(`${__dirname}/public`))

//reading files from body into req.body
app.use(express.json({
    limit: '10kb'
}));
app.use(cookieParser());
// data sanitizer from milisious query

app.use(mongoSanitize());

// data santizier from bad fomr of data

app.use(xss());

//to prevent params pollution (repeating what cant be repeated) you can set what can be duplicated

app.use(hpp(
    [
        'maxGroupSize',
        'difficulty',
        'ratingsAverage',
        'retingsQuantity'
    ]
));





/// routers
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);






app.listen(3000, () => {
    console.log('ported on port 3000');
})