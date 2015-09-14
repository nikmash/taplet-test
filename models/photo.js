import mongoose from 'mongoose'
var Schema = mongoose.Schema;

var Photo = new Schema({
	image_url: {
		type: String,
		required: true
	},
	user_id: {
		type: String,
		required: true
	},
	group_id: {
		type: String,
		required: true
	},
	views: {
		type: Number,
		required: true
	}
})


module.exports = mongoose.model('Photo', Photo);