function fromJSON(message) {
    try {
        return JSON.parse(message);
    }
    catch (err) {
        return null;
    }
}

function toJSON(message) {
    try {
        // Not only objects like {...} but also standalone numbers, arrays,
        // functions, etc. will successfully be stringified
        return JSON.stringify(message);
    }
    catch (err) {
        return null;
    }
}

module.exports = { fromJSON, toJSON };