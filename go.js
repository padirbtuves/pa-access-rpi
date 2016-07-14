var request = require('request')
var storage = require('node-persist')
var Gpio = require('tm-onoff').Gpio
var cache = require('js-cache')
var nfc = require('nfc').nfc
var alarm = require('./alarm')

var lockPin = new Gpio(2, 'out')

var lockTimeoutId = null

storage.init()
alarm.init()

function handleTag(tag) {
	var tagInfo = storage.getItem(tag.id)

	if (tagInfo != null) {
		openDoor(tagInfo)
	} 

	getTagInfo(tag.id, openDoor)
}

function openDoor(tagInfo) {
	if (tagInfo.valid && lockTimeoutId == null) {
		alarm.disableAlarm()

		lockPin.write(1)
		lockTimeoutId = setTimeout(function() {
			lockPin.write(0)
			lockTimeoutId = null
		}, 5000)
	}
}

function getTagInfo(tagId, callback) {
	var url = "http://mano.padirbtuves.lt/auth/nfc?id=" + tagId

	request({
	    url: url,
	    json: true
	}, function (error, response, tagInfo) {
	    if (!error && response.statusCode === 200 && tagId.valid) {
	        storage.setItem(tagId, tagInfo)
	        callback(tagInfo)
	    } else {
	    	storage.removeItem(tagId)
	    }
	})
}

function convertTagId(tagId) {
    return parseInt(tagId.split(":").reverse().join(''), 16)
}

new nfc.NFC().on('read', function(tag) {
	tag.id = convertTagId(tag.uid)

	var cachedTag = cache.get(tag.uid)
	if (cachedTag == null) {
		handleTag(tag)
	}

	cache.set(tag.uid, tag, 1000)
}).start()

function exit() {
	lockPin.unexport()
}

process.on('SIGINT', exit)