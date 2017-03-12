var request = require('request')
var storage = require('node-persist')
var Gpio = require('onoff').Gpio
var cache = require('js-cache')
var nfc = require('nfc').nfc
var alarm = require('./alarm')

var lockPin = new Gpio(5, 'out')
var soundPin = new Gpio(6, 'out')

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
        soundPin.write(1)
        
        setTimeout(function () {
            soundPin.write(0)
        }, 10)

        lockTimeoutId = setTimeout(function () {
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
        console.log("Tag : " + tagInfo.id)
        if (!error && response.statusCode === 200 && tagInfo.valid) {
            storage.setItem(tagId, tagInfo)
            callback(tagInfo)
        } else {
            storage.removeItem(tagId)
        }
    })
}

function convertTagId(tagId) {
    return parseInt(tagId.split(":").reverse().join(''), 16).toString()
}

new nfc.NFC().on('read', function (tag) {
    tag.id = convertTagId(tag.uid)

    var cachedTag = cache.get(tag.uid)
    if (cachedTag == null) {
        handleTag(tag)
    }

    cache.set(tag.uid, tag, 1000)
}).start()

function exit() {
    lockPin.unexport()
    soundPin.unexport()
}

console.log("Started")