export default
function $(selector) {

    const nodes = document.querySelectorAll(selector);

    return {
        append: function(element) {
            nodes.forEach(n => n.append(element));
            return this;
        },

        attr: function(name, value) {
            nodes.forEach(n => n.setAttribute(name, value));
            return this;
        },
    
        text: function(contents) {
            nodes.forEach(n => n.innerHTML = contents);
            return this;
        },
    
        addClass: function(name) {
            nodes.forEach(n => n.classList.add(name));
            return this;
        },
    
        removeClass: function(name) {
            nodes.forEach(n => n.classList.remove(name));
            return this;
        },
    
        toggleClass: function(name) {
            nodes.forEach(n => n.classList.toggle(name));
            return this;
        },

        css: function(property, value) {
            nodes.forEach(n => n.style[property] = value);
            return this;
        },

        onKeyup: function(char, callback) {
            const keyMap = {
                'a': 65, 'b': 66,
                'c': 67, 'd': 68,
                'e': 69, 'f': 70,
                'g': 71, 'h': 72,
                'i': 73, 'j': 74,
                'k': 75, 'l': 76,
                'm': 77, 'n': 78,
                'o': 79, 'p': 80,
                'q': 81, 'r': 82,
                's': 83, 't': 84,
                'u': 85, 'v': 86,
                'w': 87, 'x': 88,
                'y': 89, 'z': 90,
            };

            const code = keyMap[char];

            // Do nothing for chars not in [a-z]
            if (code === undefined) return;

            nodes.forEach(n => n.addEventListener('keyup',
                function(event) {
                    if (event.keyCode === code) callback();
                }
            ));
        },
    }
}