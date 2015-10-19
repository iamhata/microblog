var express = require('express');
var path = require('path');
var logger = require('morgan');//log
var fs = require('fs');
var busboy = require('connect-busboy');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes');
var flash = require('connect-flash'); 
var session = require('express-session');

var viewEngine = require('ejs-mate');//樣版引擎
//var viewEngine = require('ejs-locals');//樣版引擎
var partials = require('express-partials');


var app = express();

app.set('port',process.env.PORT ||3000);

app.engine('ejs', viewEngine); //樣本引擎
app.set('views', __dirname+'/views');//設計頁面模板位置，在views子目錄下
app.set('view engine', 'ejs');
app.set('view options', { layout:'layout.ejs' });
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use(busboy()); 
app.use(partials());

app.use(flash());
app.use(function(req, res, next){
  res.locals.flash = req.flash
  next()
});
app.use(session({ cookie: { maxAge: 60000 }, 
                  secret: 'microblogcythilya',
                  resave: false, 
                  saveUninitialized: false}));

app.use('/', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



app.use("/",function(req,res,next){

  req.locals.user = req.session.user;


  var err = req.flash('error');
  var success = req.flash('success');

  res.locals.error = err.length ? err : null;
  res.locals.success = success.length ? success : null;
   

  next();
});



module.exports = app;

app.listen(app.get('port'), function(req,res){
  console.log("Express server listening on http://localhost:"+app.get('port')+';press Ctrl+C to terminate.');
});

