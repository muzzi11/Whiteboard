/**
* Douglas Crawford's supplant renamed to interpolate.
* For all instances of the regex (b) wrapped between { and } (a)
* replace b with the member of o that matches b, or it stays the same.
* "test {test} {test3} {test} {t}".interpolate({test: "works", test2: 564, test3: "34"});
* resulting string "test works 34 works {t}"
*
* @param o Object containing members to be matched.
*/
String.prototype.interpolate = function (o) {
    return this.replace(/{([^{}]*)}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
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