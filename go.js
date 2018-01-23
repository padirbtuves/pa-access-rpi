var Gpio = require('onoff').Gpio
var server = require('./server')

var lockPin = new Gpio(5, 'out')
var soundPin = new Gpio(6, 'out')

var lockTimeoutId = null

function openDoor(tagInfo) {
    if (lockTimeoutId == null) {
        lockPin.write(1)
        soundPin.write(1)

        setTimeout(function() {
            soundPin.write(0)
        }, 10)

        lockTimeoutId = setTimeout(function() {
            lockPin.write(0)
            lockTimeoutId = null
        }, 5000)
    }
}

setInterval(function() {
    server.getLock(function(locked) {
        if (!locked) {
            openDoor()
        }
    })
}, 1000)

console.log("Started")