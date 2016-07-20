var Gpio = require('onoff').Gpio
var cache = require('js-cache')
var nfc = require('nfc').nfc
var alarm = require('./alarm')
var server = require('./server')

var lockPin = new Gpio(5, 'out')
var soundPin = new Gpio(6, 'out')

var lockTimeoutId = null

alarm.init()

function handleTag(tag) {
    server.getTagInfo(tag.id, openDoor, openDoor)
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
    alarm.tearDown()
}

console.log("Started")

//process.on('SIGINT', exit)