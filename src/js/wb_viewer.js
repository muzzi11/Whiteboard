/**
* Here goes code to dynamically generate HTML in the web page.
*/
Viewer = function() {
	this.header = "header";
	this.menu = "menu";
	this.sidebar = "aside";
	this.main = "article";
	this.footer = "footer";
	//this.displayFunction.me = this;
	this.init = function() {
		//this.displayFunction = Viewer.displayFunction;
	}
	
	this.displayFunction = function(elems) {
		for (e in elems) {
			/// @TODO display elements in HTML.
			//alert(elems[e].title);
			var html = "<a href='#' onclick='alert(\"{title}\");' >{title}</a>";
			html = html.interpolate(elems[e]);
			$('menu').insert({bottom: html});
		}
	}
	
	this.init();
}