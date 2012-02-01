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
        $('#reply').insert({bottom:"<textarea id='textarea'></textarea><a id='post' href='#' onclick='document.postComment(); return false;'>POST</a>	<a href='#' onclick='document.postClose(); return false;'>CLOSE</a>"});
        elems = eval('('+elems+')');
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
			document.userID = '1';
			document.api.loadContent(page_id, document.genContent);
			document.api.loadComments(page_id, document.userID, document.genComments);
		
		}
        
		document.genContent = function(response) {
			response = eval('('+response+')');
			$("#desc").insert("{desc}".interpolate(response));
            $(document.viewer.article).insert('');
            $('#blabla').insert('');
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
            
            var tabControl = new TabControl( $('#blabla') );
            document.DOMWalker(xmlDoc, tabControl);
            
            if( $('#videos').innerHTML != '' ) {
                $('#videos').insert({top: '<video width="640" controls="controls">', bottom:'Your browser does not support the video tag.</video>'});
            }
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
		//alert(comments);
        $('#comments').insert("<a class='post' href='' onclick='document.reply(null); return false;'>Post comment</a>");
        if(comments != ''){
    		comments = eval('('+comments+')');
    		var comment = "<section style='margin-left:{indent}px;'><b>{user}</b>	{date}	<a class='reply' href='' onclick='document.reply({id}); return false;'>Reply</a><br />{text}</section>";
    		var count = 0;
    		for (c in comments) {
    			count++;
    			comments[c].nr = count;
    			if (comments[c].parent == 0) {
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
    							$('#comments').insert({bottom:comment.interpolate(comments[r])});
    							reply(comments, comments[r].id, level+1);
    						}
    					}
    				}
    				reply(comments, comments[c].id, 1);
    			}
    		}//alert('');
    		$('#textarea').value = '';
        }
	}
		
	document.postComment = function() {
		//alert($('#textarea').parent);
		//alert("PAGE:	"+$('article').page_id+'\nUSER:	'+document.userID+'\nPOST:	'+$('#textarea').value+'\n');
		document.api.postComment($(document.viewer.article).page_id, document.userID, $('textarea').value, document.genComments, $('textarea').parent);
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

	Viewer.prototype.reSubMenu = function(nr, content) {
		alert(nr+"	"+document.sitemap);
	}
	
	this.init();
}