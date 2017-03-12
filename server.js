var request = require('request')
<<<<<<< HEAD

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
=======
var storage = require('node-persist')

storage.init()

var clientId = process.env.GO_CLIENT_ID
if (clientId == null) {
    console.log("Client id is not specified. Use GO_CLIENT_ID env variable.")
}

module.exports = {
    getTagInfo: function (tagId, cachedCallback, callback) {
        var cachedInfo = storage.getItem(tagId)

        if (cachedInfo != null) {
            cachedCallback(cachedInfo)
        }

        var url = "http://mano.padirbtuves.lt/auth/nfc?id=" + tagId

        request({
            url: url,
            json: true
        }, function (error, response, tagInfo) {
            console.log("Tag : " + tagInfo.id)
            console.log("Response : " + tagInfo.valid)

            if (!error && response.statusCode === 200 && tagInfo.valid) {
                storage.setItem(tagId, tagInfo)
            } else {
                storage.removeItem(tagId)
                tagInfo.valid = false
            }
            callback(tagInfo)
        })
    },

    sendEvent: function (eventName) {
        var url = "http://mano.padirbtuves.lt/event?clientId=" + clientId + "&eventName=" + eventName

        request({
            url: url,
            json: true
        }, function (error, response, body) {
            // What to do with response?
        })
    },


}
>>>>>>> 045aa28de95fb5b06884d149c9952942af49904c
