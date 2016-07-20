var Gpio = require('onoff').Gpio
var server = require('./server')

var doorPin = new Gpio(2, 'in', 'falling')
var sirenPin = new Gpio(4, 'out')
var alarmSwitch = new Gpio(17, 'in', 'falling')

var alarmActivated = false
var alarmTriggered = false

module.exports = {

    init: function () {
        doorPin.watch(function (err, value) {
            server.sendEvent("door")
            
                // if alarm is activated and door get opened, trigger alarm
            if (alarmActivated) {
                this.triggerAlarm()
            }
        })

        alarmSwitch.watch(function (err, value) {
            this.enableAlarm()
        })
    },

    triggerAlarm: function () {
        if (!alarmTriggered) {
            alarmTriggered = true
            sirenPin.write(1)
            server.sendEvent("alarm")

            // Keep siren for 30 minutes or until disabled
            setTimeout(function () {
                this.disableAlarm()
            }, 60000 * 30)
        }
    },

    enableAlarm: function () {
        // when alarm switch is pressed, wait 10 seconds and activate alarm
        setTimeout(function () {
            alarmActivated = true
        }, 10000)
    },

    disableAlarm: function () {
        alarmActivated = false
        alarmTriggered = false
        sirenPin.write(0)
    },

    tearDown: function () {
        doorPin.unexport()
        sirenPin.unexport()
        alarmSwitch.unexport()
    },
}