import express from 'express'
import fs from 'fs'
import path from 'path'
import stream from 'stream'
import streamTo from 'stream-to-buffer'
import imgur from 'imgur'

var router = express.Router()

var Photo = require('../models/photo.js')

var db = require('../mongoose')

function uploadToImgur (file, callback) {
	var xhttp = new XMLHttpRequest()
	var fd = new FormData()

	fd.append('image', file)

	xhttp.open('POST', 'https://api.imgur.com/3/image')
	xhttp.setRequestHeader('Authorization', 'Client-ID 8a5be3bd07efdf9');
	xhttp.onreadystatechange = function () {
		if (xhttp.status === 200 && xhttp.readyState === 4) {
			var res = JSON.parse(xhttp.responseText)
			var link = res.data.link
			callback(link)
		}
	};
	xhttp.send(fd)
}

function upload (file, callback) {
	imgur.setClientId('8a5be3bd07efdf9')

	imgur.uploadBase64(new Buffer(file).toString('Base64'))
		.then(function (json) {
			callback(null, json.data.link)
		})
		.catch(function (err) {
			callback(err.message);
		})
}

router.get('/', function (req, res){
	res.json({
		msg: 'test'
	})
})

router.post('/upload', function (req, res, next) {
	var fstream
	req.pipe(req.busboy)
	var photo = new Photo()

	if (!req.busboy) {
		console.log('error busboy was not loadded on to middleware')
		return;
	}

	req.busboy.on('field', function (key, value) {
		photo[key] = value;
	})

	req.busboy.on('file', function (fieldname, file, filename) {
		console.log('Uploading: ' + filename)

		console.log('user_id: ' + JSON.stringify(req.body))

		streamTo(file, function (err, buffer) {
			if (err) {
				console.log(err)
			}
			upload(buffer, function (err, link) {
				if (err) {
					res.statusCode = 500;
					return res.json({
						error: err
					})
				}
				req.busboy.on('field', function(key, value) {
					console.log('value is: ' + value);
				})
				// var photo = new Photo({
				// 	image_url: link,
				// 	user_id: req.body.user_id,
				// 	group_id: req.body.group_id,
				// 	views: 0
				// })

				photo.image_url = link
				photo.views = 0

				photo.save(function (err) {
					if (!err) {
						console.log('New Photo created with id: %s', photo.id);
						return res.json({
							status: 'OK',
							photo: photo
						})
					} else {
						res.statusCode = 500;
						return res.json({
							error: 'Server error: ' + JSON.stringify(err)
						})
					}
				})

				// console.log('the url is: ' + link)
				// res.json({
				// 	img_url: link
				// })
			})
		})
	})


})

router.get('/list', function (req, res) {
	Photo.find(function (err, photos) {
		if (err) {
			res.statusCode = 500;
			console.log('Error occurred: ', res.statusCode, err.message)
			return res.json({
				error: 'Server error'
			})
		}
		return res.json(photos)
	})
});


router.get('/list/:group_id', function (req, res) {
	// if (!req.params.group_id) {
	// 	Photo.find(function (err, photos) {
	// 		if (err) {
	// 			res.statusCode = 500;
	// 			console.log('Error occurred: ', res.statusCode, err.message)
	// 			return res.json({
	// 				error: 'Server error'
	// 			})
	// 		}
	// 		return res.json(photos)
	// 	})
	// }

	Photo.findOne({'group_id': req.params.group_id}, function (err, photo) {
		if (err) {
			res.statusCode = 500;
			console.log('Error occurred: ', res.statusCode, err.message)
			return res.json(err);
		}

		return res.json(photo);
	})

})

router.get('/view/:id', function (req, res) {
	if (!req.params.id) {
		res.statusCode = 404;
		return res.json({
			error: 'You did not provide an id'
		})
	}

	Photo.findById(req.params.id, function (err, photo) {
		if (err) {
			res.statusCode = 500;
			console.log('Error occurred: ', res.statusCode, err.message)
			return res.json(err);
		}

		photo.views++;

		photo.save(function (err) {
			if (err) {
				console.log('failed to increment views on photo ', photo)
				res.redirect(photo.image_url);
			}
		})
	});
})

module.exports = router;