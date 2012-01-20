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
			
			$('menu').insert({bottom: html});
		}
		document.click = function(nr) {
				var pages = document.sitemap[nr].children;
				$('aside').insert('');
				for(p in pages) {					
					var menu_item = "<a href='#' onclick='document.loadContent({page_id});' >{title}</a>";
					menu_item = menu_item.interpolate(pages[p]);
					$('aside').insert({bottom:menu_item});
				}
			}
		document.loadContent = function(page_id) {
			document.api.loadContent(page_id, document.genContent);
		}
		document.genContent = function(response) {
			$('article').insert("<h1>{desc}</h1><section>{data}</section>".interpolate(response));
			parse = new DOMParser();
			alert(parse.parseFromString(response.data, "text/xml"));
			/*for(i in items) {
					var items = "<section>{data}</section>";
					items = menu_item.interpolate(pages[p]);
					$('aside').insert({bottom:menu_item});
				}*/
		}
		document.sitemap = elems;
	}
	
	Viewer.prototype.reSubMenu = function(nr, content) {
		alert(nr+"	"+document.sitemap);
	}
	
	this.init();
}