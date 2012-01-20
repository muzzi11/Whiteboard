/**
* Here goes code for implementing API functions.
* The API is used to communicate between the server and the client.
*/

Client = function(displayFunc) {
	this.ajax = null;
	this.serverUrl = null;
	//this.displayHandler = 0;
	
	this.init = function(displayFunc){
		this.serverUrl = "localhost";
		//this.displayHandler = displayFunc;
		this.ajax = new Ajax(this.successHandler, this.serverUrl);
		this.ajax.me = this;
	}
	
	Client.prototype.successHandler = function(response) {
		//alert(response);
		
		var elems = eval('('+response+')');
		///@TODO Format data to something useful.
		this.me.displayHandler(elems);
	}
	
	Client.prototype.loadPage = function(pageNr) {
		this.ajax.request("Whiteboard/src/php/query.php", "GET", "?q=sitemap");
	}
	
	Client.prototype.loadContent = function(pageNr, handler) {
		this.ajax.me.displayHandler = handler;
		this.ajax.request("Whiteboard/src/php/query.php", "GET", "?q=content&page={nr}".interpolate({nr:pageNr}));
	}
	
	
	this.init(displayFunc);
}