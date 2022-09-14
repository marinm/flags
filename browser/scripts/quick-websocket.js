import {fromJSON, toJSON} from './json.js';

function newWebSocket(url) {
    try {
        return new WebSocket(url);
    }
    catch (error) {
        return null;
    }
}

export default
function QuickWebSocket({
    url,
    onError,
    onOpen,
    onMessage,
    onClose
}) {
    const socket = newWebSocket(url);

    // Is there a better way to handle this?
    if (!socket) return null;

    // Does this API handle ping-pong in the background?

    onError   = onError   || function noop() {};
    onOpen    = onOpen    || function noop() {};
    onMessage = onMessage || function noop() {};
    onClose   = onClose   || function noop() {};


    const wrapper = {
        send:
        function(data) {
            const stringified = toJSON(data);

            // Ignore non-stringifiable data
            if (data != null) socket.send(stringified);
        },

        close:
        function() {
            socket.close();
        }
    };

    socket.onerror   = (event) => onError(wrapper, event);
    socket.onopen    = (event) => onClose(event);
    socket.onmessage = (event) => onMessage(wrapper, toJSON(event.data));

    socket.addEventListener('error',
        function(event) {
            console.error(event);
            onError();
        }
    );

    socket.addEventListener('open',
        function(event) {
            onOpen(wrapper);
        }
    );

    socket.addEventListener('message',
        function(event) {
            const parsed = fromJSON(event.data);

            // Only forward messages that could be parsed
            if (parsed != null) onMessage(wrapper, parsed);
        }
    );

    socket.addEventListener('close',
        function(event) {
            // There are a lot of close codes to consider
            // Assume the user wants it to always stay open
            console.log('Connection closed');
            onClose();

            // Try to reconnect?
        }
    );

    return wrapper;
};