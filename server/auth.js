const { createHmac } = require('node:crypto');

const {
    APP_KEY
} = process.env;

module.exports = {
    hmac:
    function(message) {
        const algorithm = 'sha256';
        const key = APP_KEY;

        return createHmac(algorithm, key).update(message).digest('hex');
    }
}