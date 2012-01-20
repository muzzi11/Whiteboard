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
			var html = "<a href='#' onclick='document.click({num});' >{title}</a>";
			elems[e].num = e;//alert(elems[e].children);
			html = html.interpolate(elems[e]);
			//var obj = eval(html.interpolate(elems[e]));
			document.click = function(nr) {
				var pages = document.sitemap[nr].children;
				$('aside').insert('');
				for(p in pages) {					
					var menu_item = "<a href='#' onclick='alert(\"{page_id}\");' >{title}</a>";
					menu_item = menu_item.interpolate(pages[p]);
					$('aside').insert({bottom:menu_item});
				}
			}
			$('menu').insert({bottom: html});
		}
		document.sitemap = elems;
	}
	
	Viewer.prototype.reSubMenu = function(nr, content) {
		alert(nr+"	"+document.sitemap);
	}
	
	this.init();
}