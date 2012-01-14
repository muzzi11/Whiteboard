/**
* Douglas Crawford's supplant renamed to interpolate.
* For all instances of the regex (b) wrapped between { and } (a)
* replace b with the member of o that matches b, or it remains blank/excluded.
* "test {test} {test3} {test} {t}".interpolate({test: "works", test2: 564, test3: "34"});
* resulting string "test works 34 works"
*
* @param o Object containing members to be matched.
*/
String.prototype.interpolate = function (o) {
    return this.replace(/{([^{}]*)}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : '';
        }
    );
};

/**
* unified selector, returns element that matches e.
* @param e css selector rule.
*/
$ = function(e) {
	/// @TODO implement cross-browser compatibility
	/// @TODO implement unified single & multi-element selection
	return typeof e == "string" ? document.querySelector(e) : e;
};

/**
* unified selector for DOM elements, return element that matches e.
* @param e css selector rule.
*/
Element.prototype.select = function(e) {
	/// @TODO implement cross-browser compatibility
	/// @TODO implement unified single & multi-element selection
	return typeof e == "string" ? this.querySelector(e) : e;
};

/**
* insert method for elements.
* @param h HTML to insert, if h.top and/or h.bottom exist,
* append HTML before or after original contents.
*/
Element.prototype.insert = function(h) {
	if(h.top || h.bottom) {
		this.innerHTML = ("{top}"+this.innerHTML+"{bottom}").interpolate({
			top: h.top,
			bottom: h.bottom
		});
	} else {
		this.innerHTML = h;
	}
 }
 
 /**
 * replace the current element with another element.
 * @param e The new element.
 */
 Element.prototype.replace = function(e) {
 	this.parentNode.replaceChild(e, this);
 }
 
 Element.prototype.css = function(o) {
	this.class.style = o;
	return this.class;
}

Element.prototype.addClass = function(s) {
	classList = this.getClass() != '' && this.getClass() != null ? this.getClass() +' '+ s : s;
	this.setClass(classList);
}

Element.prototype.setClass = function(s) {
	this.setAttribute('class', s);
}

Element.prototype.getClass = function() {
	return this.getAttribute('class');
}

Element.prototype.removeClass = function(s) {
	classList = this.getClass();
	var reg = new RegExp(s, 'g');
	classList = classList.replace(reg, '');
	this.setClass(classList);
}