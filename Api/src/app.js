require('app-module-path').addPath(__dirname);
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

/* ===================
    Route Declaration
====================*/
let indexRouter = require('routes/index');
let candidatesRouter = require('routes/candidates');
let entriesRouter = require('routes/entries');
let competitionsRouter = require('routes/competitions');
let magazinesRouter = require('routes/magazines');
let termsRouter = require('./routes/terms');
let winnersRouter = require('routes/winners');
let uploadRouter = require('routes/upload');
let staffRouter = require('routes/staff');

let cors = require('cors');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

// use cors for all aPI endpoints
let corsOptions = {
  origin: '*',
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Content-Length',
    'X-Requested-With',
    'Accept'
  ],
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* ==============
    Endpoints
==============*/
app.use('/', indexRouter);
app.use('/entries', entriesRouter);
app.use('/candidates', candidatesRouter);
app.use('/competitions', competitionsRouter);
app.use('/magazines', magazinesRouter);
app.use('/terms', termsRouter);
app.use('/winners', winnersRouter);
app.use('/upload', uploadRouter);
app.use('/staff', staffRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    error: 500
  });
});

module.exports = app;
