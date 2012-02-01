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
		var elems = JSON.parse(response);
		///@TODO Format data to something useful.
		this.me.displayHandler(elems);
	}
	
	Client.prototype.verifyAuth = function(pageNr, handler) {
		var ajax = new Ajax(handler, this.serverUrl);
		ajax.me = this;
		//ajax.me.displayHandler = handler;
		ajax.me.displayHandler = function(response) {
			if(response=='true') {
				$('#login a').attributes.href = this.serverUrl + 'authentication?login&service=index.html';
				$('#login a').insert('LOGOUT');
			} else {
				$('#login a').attributes.href = this.serverUrl + 'authentication?logout&service=index.html';
				$('#login a').insert('LOGIN');
			}
		};
		ajax.request("query", "GET", "?q=verify");
	}
	
	Client.prototype.loadPage = function(pageNr, handler) {
		var ajax = new Ajax(handler, this.serverUrl);
		ajax.me = this;
		ajax.request("query", "GET", "?q=sitemap");
	}
	
	Client.prototype.loadContent = function(pageNr, handler) {
				this.verifyAuth(null, function(response) {
			if(response=='true') {
				$('#login a').attributes.href = this.serverUrl + 'authentication?login&service=index.html';
				$('#login a').insert('Logout');
			} else {
				$('#login a').attributes.href = this.serverUrl + 'authentication?logout&service=index.html';
				$('#login a').insert('Login');
			}
		});
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
	Client.prototype.postComment = function(pageNr, userID, comment, handler, parent, cmd) {
		var ajax = new Ajax(handler, this.serverUrl);
		ajax.me = this;
		ajax.me.displayHandler = handler;
		ajax.request("query", "GET", "?q=comments&page={nr}&user={user}&post='{post}'{parent}{cmd}".interpolate({
			nr:pageNr,
			user:userID, 
			post:comment, 
			parent: parent == null || typeof parent === 'undefined' ? '' : "&parent={parent}".interpolate({
					parent: parent
				}),
			cmd: cmd == null ? '' : cmd
			})
		);
		
		//this.ajax.request("Whiteboard/src/php/query.php", "GET", "?q=comments&page={nr}&user={user}".interpolate({nr:pageNr, user:userID}));
	}
	
	Client.prototype.getIsTeacher = function(userID) {
		var alphaNum = /[0-9][A-z]+/gi;
		return alphaNum.test(userID);
	}
	
	
	this.init(displayFunc);
}