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
        }
    }
}