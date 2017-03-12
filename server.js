var request = require('request')

module.exports = {

    logEvent: function () {
        request({
            url: 'http://mano.padirbtuves.lt/event/log',
            method: 'POST',
            json: true,
            body: {
                type: 'door',
                value: 'open'
            }
        })
    }
}