import { createHmac } from 'node:crypto';

const {
    APP_KEY
} = process.env;

export default {
    hmac:
    function(message) {
        const algorithm = 'sha256';
        const key = APP_KEY;

        return createHmac(algorithm, key).update(message).digest('hex');
    }
}