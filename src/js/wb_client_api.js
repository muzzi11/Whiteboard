/**
* Here goes code for implementing API functions.
* The API is used to communicate between the server and the client.
*/

Client = function() {
	this.ajax = null;
	this.serverUrl = null;
	this.successHandler = null;
	this.displayHandler = null;
	this.init = function(){
		this.serverUrl = "localhost";
		
		this.ajax = new Ajax(this.successHandler, this.serverUrl);
	}
	
	this.prototype.successHandler = function(response) {
		alert(response);
		var elems;
		///@TODO Format data to something useful.
		displayHandler(elems);
	}
	
	this.prototype.loadPage = function(pageNr) {
		this.ajax.request("query.php", "GET", "q=sitemap");
	}
	
	
	this.init();
}