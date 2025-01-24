function fromJSON(string) {
    try {
        return JSON.parse(string);
    }
    catch (error) {
        return null;
    }
}

function toJSON(object) {
    try {
        return JSON.stringify(object);
    }
    catch (error) {
        return null;
    }
}

export {fromJSON, toJSON};