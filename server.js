var request = require('request')
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
            if (!error && response.statusCode === 200 && tagInfo.valid) {
                storage.setItem(tagId, tagInfo)
                callback(tagInfo)
            } else {
                storage.removeItem(tagId)
            }
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
