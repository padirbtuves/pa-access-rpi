ar Gpio = require('onoff').Gpio

var doorPin = new Gpio(2, 'in', 'falling')
var sirenPin = new Gpio(4, 'out')
var alarmSwitch = new Gpio(17, 'in', 'falling')

var alarmActivated = false
var alarmTriggered = false

module.exports = {

    init: function () {
        doorPin.watch(function (err, value) {
            console.log("Door pin " + value)
                // if alarm is activated and door get opened, trigger alarm
            if (alarmActivated) {
                this.triggerAlarm()
            }
        })

        alarmSwitch.watch(function (err, value) {
            this.enableAlarm()
        })
    },

    tearDown: function () {
        doorPin.unexport()
        sirenPin.unexport()
        alarmSwitch.unexport()
    },

    triggerAlarm: function () {
        if (!alarmTriggered) {
            alarmTriggered = true
            sirenPin.write(1)
            this.notifyServer()

            // Keep siren for 30 minutes or until disabled
            setTimeout(function () {
                this.disableAlarm()
            }, 60000 * 30)
        }
    },

    notifyServer: function () {
        var url = "http://mano.padirbtuves.lt/auth/alarm"

        request({
            url: url,
            json: true
        }, function (error, response, body) {
            // What to do with response?
        })
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
}