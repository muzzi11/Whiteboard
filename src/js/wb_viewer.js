/**
* Here goes code to dynamically generate HTML in the web page.
*/
Viewer = function() {
	this.header = "header";
	this.menu = "menu";
	this.sidebar = "aside";
	this.main = "article";
	this.footer = "footer";
	
	//this.prototype.init = function() {
	//}
	
	Viewer.prototype.displayFunction = function(elems) {
		for (e in elems) {
			/// @TODO display elements in HTML.
		}
	}
	//this.init();
}