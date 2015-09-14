import mongoose from 'mongoose'

mongoose.connect('mongodb://mongodb-1:27017/test')

var db = mongoose.connection

db.on('error', function (err) {
	console.log('Connection error: ', err.message);
})

db.once('open', function callback () {
	console.log('connected to db!');
})

module.exports = mongoose;