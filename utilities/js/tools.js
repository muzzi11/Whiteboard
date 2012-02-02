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
}

/**
* unified selector, returns element that matches e.
* @param e css selector rule.
*/
$ = function(e) {
	/// @TODO implement cross-browser compatibility
	/// @TODO implement unified single & multi-element selection
	/// @TODO fix selection to context of element.
	var parent = document;//typeof this === "function" ? document : this;
	return typeof e == "string" ? parent.querySelector(e) : e;
}
/*
$.prototype.foreach = function(func) {
	for(elem in this) {
		func(elem);
	}
}

$.prototype.addNewElement = function(o) {
	var elem = this.createElement(o.tag, o.attribs);
	if(o.top || o.bottom) {
		this.insert(o);
	} else {
		this.insert({bottom: elem});
	}
	this.insert();
}*/

/**
* unified selector for DOM elements, return element that matches e.
* @param e css selector rule.
*/
Element.prototype.select = $;/*function(e) {
	/// @TODO implement cross-browser compatibility
	/// @TODO implement unified single & multi-element selection
	return typeof e == "string" ? this.querySelector(e) : e;
};*/

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
* TODO: Implement properly. Unused / untested.
* Bind a function to an element's click event.
* @param func Function to bind.
*/
Element.prototype.eventClick = function(func) {
	this.onclick = func;
}

/**
* replace the current element with another element.
* @param e The new element.
*/
Element.prototype.replace = function(e) {
	this.parentNode.replaceChild(e, this);
}

/**
* Replace the element's style with another style.
* @param o Object of containing the style with which to replace the current style.
*/
Element.prototype.css = function(o) {
	this.class.style = o;
	return this.class;
}

/**
* Add a class to the class attribute of an element.
* @param s String of the class name to add.
*
*/
Element.prototype.addClass = function(s) {
	classList = this.getClass() != '' && this.getClass() != null ? this.getClass() +' '+ s : s;
	this.setClass(classList);
}

/**
* Set the class attribute of an element.
* @param s String of the class name.
*/
Element.prototype.setClass = function(s) {
	this.setAttribute('class', s);
}

/**
* Return the class attribute of an element.
*/
Element.prototype.getClass = function() {
	return this.getAttribute('class');
}

/**
* Remove a class from an element.
* @param s String to represent the regular expression of the class to remove.
*
*/
Element.prototype.removeClass = function(s) {
	classList = this.getClass();
	var reg = new RegExp(s, 'g');
	classList = classList.replace(reg, '');
	this.setClass(classList);
}

/**
* Hide element by setting the display to 'none'.
*/
Element.prototype.hide = function() {
	this.style.display = "none";
}

/**
* Show element by removing 'none'.
*/
Element.prototype.show = function() {
	if(this.style.display == "none") {
		this.style.display = "";
	}
}


/**
* Ajax object defines and manages an Ajax context.
* @param success Success handler function.
* @param server Server url.
*/
Ajax = function(success, server) {
	this.httpRequestObject = null;
	this.successFunc = null;
	this.asyncFlag = null;
	this.method = null;
	this.url = null;
	this.serverUrl = server;
	this.me = this;
	
	// initialize stuff
	Ajax.prototype.init = function () {
		this.httpRequestObject = this.getHttpRequestObject();
		this.setDefaults();
	}
	
	// pre-processing relocation of the Ajax response.
	Ajax.prototype.successHandler = function(response) {
		this.successFunc(response);
	}
	
	//Reset the default states.
	Ajax.prototype.setDefaults = function() {
		//this.httpRequestObject.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		this.httpRequestObject.onreadystatechange = this.stateHandler;
		this.successFunc = success;
		this.httpRequestObject.me = this;
		this.asyncFlag = true;
		this.method = 'POST';
	}
	
	//Get the actual object the standard cross-browser way.
	Ajax.prototype.getHttpRequestObject = function() {
		var httpRequest = null;
		if (window.XMLHttpRequest) { // Mozilla, Safari, ...  
			httpRequest = new XMLHttpRequest();
		} else if (window.ActiveXObject) { // IE
			try {
				httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
			}
			catch (e) {
				try {
					httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
				}
				catch (e) {}
			}
		}
		if (!httpRequest) {
			alert('Giving up :( Cannot create an XMLHTTP instance');
			return false;
		}
		return httpRequest;
	}
	
	//Handle the different states of the Ajax object
	Ajax.prototype.stateHandler = function() {
		switch(this.readyState) {
			case 0: /*uninitialized*/ ; break;
			case 1: /*loading*/ ; break;
			case 2: /*loaded*/ ; break;
			case 3: /*interactive*/ ; break;
			case 4: /*complete*/ {
				if (this.status === 200) {
					this.me.successHandler(this.responseText);
				} else if (this.status != 0) {
					/// @TODO add parameter for empty response handling.
					// Just ignore empty reponses for now and alert only on error.
					alert("ERROR: "+this.status);
				}
				//this.httpRequestObject.close();
			} ; break;
		}
	}
	
	/***
	* Ajax request does all of the interesting stuff, making the request to the server.
	* @param url Relative path url.
	* @param method Set method of the request, for example 'GET', 'POST'
	* @param queryString The query sent to the url / server.
	**/
	Ajax.prototype.request = function(url, method, queryString) {
		var u = url==null ? this.url : url;
		var m = method==null ? this.method : method;
		//alert(this.serverUrl+'/'+u+'\n'+m+'\n'+queryString);
		this.httpRequestObject.open(m, this.serverUrl+u+queryString, this.asyncFlag);
		this.httpRequestObject.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		this.httpRequestObject.send(null);
	}
	
	this.init();
}

/***
* @TODO comment function please!
*
**/
function bind(scope, func) {
	return function () {
		func.apply(scope, arguments);
	};
}