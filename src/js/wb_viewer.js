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
		this.menuControl = new MenuControl( $('#menu') );
		//alert(elems);
		$('#reply').insert({bottom:"<textarea id='textarea'></textarea><a class='button' href='#' onclick='document.postClose(); return false;'>Close</a><a class='button' href='#' onclick='document.postComment(); return false;'>Post</a>"});
		elems = JSON.parse(elems);
		for (e in elems) {
				var item_index = this.menuControl.addItem(elems[e].title);
				var pages = elems[e].children;
				for(p in pages)
				{
					this.menuControl.addSubItem(item_index, pages[p].page_id, pages[p].title);
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
                
                this.contentGenerator = new ContentGenerator(xmlDoc);
				
				if( $('#videos').innerHTML != '' ) {
					$('#videos').insert({top: '<video id="video" width="640" controls="controls">', bottom:'Your browser does not support the video tag.</video>'});
				    
                    jwplayer("video").setup({
						modes: [
							{ type: 'html5' },
							{ type: 'flash', src: 'utilities/jwplayer/player.swf' }
						]
					});                    
                }
		}
	}
	
    /**
    Generats the content
    */
    function ContentGenerator(xmlDoc)
    {
        this.tabControl = new TabControl( $('#tabs') );
        
        /**
    	Returns false if the url is not a video url, otherwise returns the video extension as a string
    	*/
    	this.getVideoType = function(url) {
    		var patt = /(\.avi|\.mp4)/ig;
    		var result = url.match(patt);
    		if(!result)
    				return false; 
    		return result[result.length - 1].replace('\.', '');
    	}
        
        /**
        Walks trough the folder recursively, adds links to the tab control and inserts video in the #video div
        */
        this.walk = function(folder, tab_index)
        {   
            var nodes = folder.childNodes;
            for(var n in nodes)
            {
                if('folder' == nodes[n].nodeName)
                    this.walk(nodes[n], tab_index);
                else if('bookmark' == nodes[n].nodeName)
                {
                    var hrefAttr;
                    if( nodes[n].hasAttributes() && ( hrefAttr = nodes[n].attributes.getNamedItem('href') ) )
                    {
                        var url = hrefAttr.firstChild.nodeValue;
                        var video_ext;
    					if( video_ext = this.getVideoType(url) ) {
    						$('#videos').insert({bottom:'<source src="' + url + '" type="video/' + video_ext + '" />'});
    					}
                        
                        var title;
                        if(nodes[n].nodeType == 1)
                        {
                            var titles = nodes[n].getElementsByTagName('title');
                            title = titles.length > 0 ? titles[0].firstChild.nodeValue : url;
                        }
                        else
                            title = url;
                        this.tabControl.addTabContent(tab_index, '<a href='+url+'>' + title + '<br />');
                    }
                }
            }
        }
        
        var nodes = xmlDoc.childNodes;
        for(var n in nodes)
        {       
            if( nodes[n].nodeType != 1 || nodes[n].nodeName != 'folder' )
                continue;
                
            var folders = nodes[n].childNodes;
            for(var f = 0; f < folders.length; f++)
            {
                if(folders[f].nodeType != 1)
                    continue;
                
                var titles = folders[f].getElementsByTagName('title');
                if('folder' == folders[f].nodeName)
                {
    			    var title = titles.length > 0 ? titles[0].firstChild.nodeValue : 'Tab';
                    var tab_index = this.tabControl.addTab(title);
                    this.walk(folders[f], tab_index);
                }
                else if('bookmark' == folders[f].nodeName)
                {
                    var title = titles.length > 0 ? titles[0].firstChild.nodeValue : 'Tab';
                    var hrefAttr;
                    if( folders[f].hasAttributes() && ( hrefAttr = folders[f].attributes.getNamedItem('href') ) )
                    {
                        var url = hrefAttr.firstChild.nodeValue;
                        $('#media').insert({bottom:'<a href=' + url + '>' + title + '<br />'});
                    }
                }
            }
        }
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