import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import methodOverride from 'method-override'
import busboy from 'connect-busboy'

var app = express();

//Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use(methodOverride())
app.use(busboy())

//Expose uploads
// app.use(express.static('uploads'))

app.use('/static/uploads', express.static('uploads'));

var api = require('./routes/api');

// Setup Mongoose
var db = require('./mongoose');

// Use Routes
app.use('/api', api);


// catch 404 and forward to error handler
app.use(function(req, res, next){
    res.status(404);
    console.log('%s %d %s', req.method, res.statusCode, req.url);
    res.json({ 
    	error: 'Not found' 
    });
    return;
})

// error handlers
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    console.log('%s %d %s', req.method, res.statusCode, err.message);
    res.json({ 
    	error: err.message 
    });
    return;
})

app.set('port', 7000)

var server = app.listen(7000, function() {
	console.log('Express server listening on port ' + server.address().port);
})

module.exports = app;