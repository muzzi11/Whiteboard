/**
* Here goes code for implementing API functions.
* The API is used to communicate between the server and the client.
*/

Client = function(displayFunc) {
	this.ajax = null;
	this.serverUrl = null;
	//this.displayHandler = 0;
	
	this.init = function(displayFunc){
        var index = window.location.href.lastIndexOf('/');
        this.serverUrl = index >= 0 ? window.location.href.substr(0, index) : 'http://' + window.location.host;
        this.serverUrl += '/';

		//this.displayHandler = displayFunc;
		//this.ajax = new Ajax(this.successHandler, this.serverUrl);
		//this.ajax.me = this;
	}
	
	Client.prototype.successHandler = function(response) {
		//alert(response);
		if (response !='')
		var elems = eval('('+response+')');
		///@TODO Format data to something useful.
		this.me.displayHandler(elems);
	}
	
	Client.prototype.loadPage = function(pageNr, handler) {
		var ajax = new Ajax(handler, this.serverUrl);
		ajax.me = this;
		ajax.request("query", "GET", "?q=sitemap");
	}
	
	Client.prototype.loadContent = function(pageNr, handler) {
		var ajax = new Ajax(handler, this.serverUrl);
		ajax.me = this;
		ajax.me.displayHandler = handler;
		ajax.request("query", "GET", "?q=content&page={nr}".interpolate({nr:pageNr}));
	}
	Client.prototype.loadComments = function(pageNr, userID, handler) {
		var ajax = new Ajax(handler, this.serverUrl);
		ajax.me = this;
		ajax.me.displayHandler = handler;
		ajax.request("query", "GET", "?q=comments&page={nr}&user={user}".interpolate({nr:pageNr, user:userID}));
	}
	Client.prototype.postComment = function(pageNr, userID, comment, handler) {
		var ajax = new Ajax(handler, this.serverUrl);
		ajax.me = this;
		ajax.me.displayHandler = handler;
		ajax.request("query", "GET", "?q=comments&page={nr}&user={user}&post='{post}'".interpolate({nr:pageNr, user:userID, post:comment}));
		
		//this.ajax.request("Whiteboard/src/php/query.php", "GET", "?q=comments&page={nr}&user={user}".interpolate({nr:pageNr, user:userID}));
	}
	
	
	this.init(displayFunc);
}