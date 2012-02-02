/**
* Here goes code to dynamically generate HTML in the web page.
*
* Brackets are oddly indented 
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
		var menuControl = new MenuControl( $('#menu') );
		//alert(elems);
		$('#reply').insert({bottom:"<textarea id='textarea'></textarea><a class='button' href='#' onclick='document.postClose(); return false;'>Close</a><a class='button' href='#' onclick='document.postComment(); return false;'>Post</a>"});
		elems = JSON.parse(elems);
		for (e in elems) {
				var item_index = menuControl.addItem(elems[e].title);
				var pages = elems[e].children;
				for(p in pages)
				{
					menuControl.addSubItem(item_index, pages[p].page_id, pages[p].title);
				}
		}

		document.loadContent = function(page_id) {
			$(document.viewer.article).page_id = page_id;
			$('#textarea').parent = null;
			$('#reply').hide();
			$('#comments').show();
			$('#comments').insert('');
			//document.userID = null;
			document.api.loadContent(page_id, document.genContent);
			document.api.loadComments(page_id, document.userID, document.genComments);
		
		}
		
		document.genContent = function(response) {
			response = JSON.parse(response);
			$("#desc").insert("{desc}".interpolate(response));
				$(document.viewer.article).insert('');
				$('#tabs').insert('');
				try {
					if(window.DOMParser) {
						parser = new DOMParser();
						xmlDoc = parser.parseFromString(response.data, "text/xml");
					} else { // Internet Explorer
						xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
						xmlDoc.async = false;
						xmlDoc.loadXML(response.data);
					}  
			} catch(e) {
					alert(e.message);
				}
				
				$('#videos').insert('');
				
				var tabControl = new TabControl( $('#tabs') );
				document.DOMWalker(xmlDoc, tabControl);
				
				if( $('#videos').innerHTML != '' ) {
					$('#videos').insert({top: '<video id="video" width="640" controls="controls">', bottom:'Your browser does not support the video tag.</video>'});
				}
				jwplayer("video").setup({
						modes: [
							{ type: 'html5' },
							{ type: 'flash', src: 'utilities/jwplayer/player.swf' }
						]
					});
		}
	}
	
	/**
	* Ugly as a mofo, bare with me.
	*/
	document.DOMWalker = function(doc, tabControl, tab_index, level) {
		if(!level)
				var level = 0;
		if(tab_index == undefined)
				var tab_index = -1;
				
		var nodes = doc.childNodes;
		for(var i = 0; i < nodes.length; i++) {
				var tabs = '';
				for(var t = 1; t < level; t++)
					tabs += '...';
									
				if('folder' == nodes[i].nodeName) {
					var titles = nodes[i].getElementsByTagName('title');
					if(titles.length > 0)
					{
						if(level == 1) {
								tab_index = tabControl.addTab(titles[0].firstChild.nodeValue);
						} else if(level > 0) {
								tabControl.addTabContent(tab_index, tabs + '<em>' + titles[0].firstChild.nodeValue + '</em><br />');
								//$('.tab_content').insert({bottom:tabs + '<em>' + titles[0].firstChild.nodeValue + '</em><br />'});
						}
						
						document.DOMWalker(nodes[i], tabControl, tab_index, level + 1);
					}
				} else if('bookmark' == nodes[i].nodeName) {
					var url = nodes[i].attributes[0].firstChild.nodeValue;
					
					var video_ext;
					if( video_ext = document.getVideoType(url) ) {
						$('#videos').insert({bottom:'<source src="' + url + '" type="video/' + video_ext + '" />'});
					}
					if(tab_index < 0)
						$(document.viewer.article).insert({bottom:tabs + '<a href=' + url + '>' + nodes[i].getElementsByTagName('title')[0].firstChild.nodeValue + '<br />'});
					else
						tabControl.addTabContent(tab_index, tabs + '<a href=' + url + '>' + nodes[i].getElementsByTagName('title')[0].firstChild.nodeValue + '<br />');
				}
								
				//tab_index = -1;
		}
	}
	
	/**
	* Chewbacca
	* Returns false if the url is not a video url
	*/
	document.getVideoType = function(url) {
		var patt = /(\.avi|\.mp4)/ig;
		var result = url.match(patt);
		if(!result)
				return false; 
		return result[result.length - 1].replace('\.', '');
	}
					
	document.genComments = function(comments) {
		if(!(document.userID === 'string' || document.userID == '')) {
			return false;
		}
		$('#comments').insert("<a class='button' href='' onclick='document.reply(null); return false;'>Post comment</a>");
		if(comments != ''){alert(comments);
			
			comments = JSON.parse(comments);
			//alert(typeof comments);
			var comment = "<section class='{class}' style='margin-left:{indent}px;'><b>{user}</b>	{date}	<a href='#' onclick='document.reply({id}); return false;'>No.{nr}</a>	<span style='right:20px; position:relative; float:right;'>[<a href='#' onclick='document.reply({id}); return false;'>reply</a>][<a href='#' onclick='document.editComment({id}); return false;'>edit</a>][<a href='#' onclick='document.deleteComment({id}); return false;'>delete</a>]</span><hr />{text}</section>";
			var count = 0;
			for (c in comments) {
				count++;
				comments[c].nr = count;
				if (comments[c].parent == 0) {
					comments[c].class = document.api.getIsTeacher(comments[c].user) ? 'teacher' : 'student';
					$('#comments').insert({bottom:comment.interpolate(comments[c])});
					var reply = function(coments, id, level) {
						//limit number of thread levels
								if(level > 3)
									level = 3;
									
						var count = 0;
						for (r in comments) {
							count++;
							if(id == comments[r].parent) {
								comments[r].indent = level * 20;
								comments[r].nr = count;
								comments[r].class = document.api.getIsTeacher(comments[c].user) ? 'teacher' : 'student';
								$('#comments').insert({bottom:comment.interpolate(comments[r])});
								reply(comments, comments[r].id, level+1);
							}
						}
					}
					reply(comments, comments[c].id, 1);
				}
			}
				if( $('#comments').offsetHeight > 500 )
					$('#comments').insert({bottom:"<a class='button' href='' onclick='document.reply(null); return false;'>Post comment</a>"});
			$('#textarea').value = '';
		}
		$('#comments').innerHTML = $('#comments').innerHTML.replace( /((https?|http):\/\/(www\.)?[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi,
			function (all, url) {
				var ytregex = /((https?|http):\/\/(www\.)?(youtube|youtu\.be)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
				
				if (ytregex.test(url))
				{
			
					return '<iframe style="max-width: 100%; height: auto;" src="http://www.youtube.com/embed/{url}" frameborder="0" allowfullscreen></iframe>'.interpolate({
							url: url.split(/[=&]/)[1]
						});
				}	
				else{
					return '<a href="{url}">{url}</a>'.interpolate({url:url});
				}
			});
		}
		
	document.postComment = function() {
		document.api.postComment($(document.viewer.article).page_id, document.userID, escape($('textarea').value), document.genComments, $('textarea').parent, $('textarea').cmd);
		document.postClose();

		//document.sitemap = elems;
	}
	document.postClose = function() {
		$('#textarea').parent = null;
		$('#textarea').value = '';
		$('#reply').hide();
	}
	document.reply = function(parent) {
		$('#textarea').parent = parent;
		$('#reply').show();
	}
	document.editComment = function(id) {
		$('#textarea').cmd = '&edit='+id;
		$('#reply').show();
	}
		document.deleteComment = function(id) {
			document.api.postComment($(document.viewer.article).page_id, document.userID, $('textarea').value, document.genComments, $('textarea').parent, '&del='+id);
	
	}

	Viewer.prototype.reSubMenu = function(nr, content) {
		alert(nr+"	"+document.sitemap);
	}
	
	this.init();
}