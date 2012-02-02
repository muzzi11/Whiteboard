/**
* Here goes code for implementing API functions.
* The API is used to communicate between the server and the client.
*/

Client = function(displayFunc) {
	this.ajax = null;
	this.serverUrl = null;
	
	//Set/Reset initial values.
	this.init = function(displayFunc){
		var index = window.location.href.lastIndexOf('/');
		this.serverUrl = index >= 0 ? window.location.href.substr(0, index) : 'http://' + window.location.host;
		this.serverUrl += '/';
	}
	
	/**
	* Internal default success handler.
	*/
	Client.prototype.successHandler = function(response) {
		//alert(response);
		if (response !='')
		var elems = JSON.parse(response);
		///@TODO Format data to something useful.
		this.me.displayHandler(elems);
	}
	
	/**
	* Verify whether the user is logged in or not. 
	*/
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
	
	/**
	* Retrieve the page sitemap/menu info from the server.
	*/
	Client.prototype.loadPage = function(pageNr, handler) {
		var ajax = new Ajax(handler, this.serverUrl);
		ajax.me = this;
		ajax.request("query", "GET", "?q=sitemap");
	}
	
	/**
	* Retrieve the page content from the server.
	*/
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
	
	/**
	* Retrieve the comments for a page from the server.
	*/
	Client.prototype.loadComments = function(pageNr, userID, handler) {
		var ajax = new Ajax(handler, this.serverUrl);
		ajax.me = this;
		ajax.me.displayHandler = handler;
		ajax.request("query", "GET", "?q=comments&page={nr}&user={user}".interpolate({nr:pageNr, user:userID}));
	}
	
	/**
	* Insert comment into the database, and retrieve the result.
	*/
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
		
	}
	
	/**
	* Test whether a user us a teacher.
	*/
	Client.prototype.getIsTeacher = function(userID) {
		var alphaNum = /[0-9][A-z]+/gi;
		return alphaNum.test(userID);
	}
	
	Client.prototype.setUserID = function() {
		var ajax = new Ajax(function(response) {
			document.userID = response;
		}, this.serverUrl);		
		ajax.request("authentication", "GET", "?user");
	}
	
	//Call init by default.
	this.init(displayFunc);
}