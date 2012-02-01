/**
Creates a tab control and corresponding DOM elements and appends them to parentElement.
No elements are created if addTab is never called.
*/
function TabControl(parentElement)
{
    this.tabs = new Array();
    this.current_tab = -1;
    
    function Tab(parentElement, label)
    {
        this.content = '';
        this.li = document.createElement('li');
        this.li.innerHTML = label == undefined ? 'Tab' : label;
        parentElement.appendChild(this.li);
        
        this.activate = function(state)
        {
            if(state)
                this.li.setAttribute('class', 'current_item');
            else
            {
                if( this.li.hasAttribute('class') )
                    this.li.removeAttribute('class');
            }
        }
    }
    
    /**
    Creates the document elements and sets the appropriate attributes. Automatically called by this.addTab().
    */
    this.init = function()
    {
        if(this.tabs.length != 0)
            return;

        this.control = document.createElement('div');
        this.tab_bar = document.createElement('div');
        this.list = document.createElement('ul');
        this.content = document.createElement('div');
    
        this.control.setAttribute('class', 'tab_control');
        this.tab_bar.setAttribute('class', 'tabs');
        this.content.setAttribute('class', 'tab_content');
        
        parentElement.appendChild(this.control);
        this.control.appendChild(this.tab_bar);
        this.control.appendChild(this.content);
        this.tab_bar.appendChild(this.list);
    }
    
    /**
    Adds a tab to the control, if no label is specified it will be labeled 'Tab'.
    Returns the index of the tab.
    */
    this.addTab = function(label)
    {
        this.init();
        var last_index = this.tabs.length;
        
        this.tabs.push( new Tab(this.list, label) );
        this.tabs[last_index].li.onclick = bind( this, function(){this.activateTab(last_index)} );
        
        if(this.current_tab < 0 || this.current_tab >= last_index)
            this.activateTab(last_index);
            
        return last_index;
    }
    
    /**
    Activates the tab specified by index and shows it's content.
    */
    this.activateTab = function(index)
    {
        if(index < 0 || index >= this.tabs.length || index == this.current_tab)
            return;
        
        if(this.current_tab >= 0 && this.current_tab < this.tabs.length)
            this.tabs[this.current_tab].activate(false);
        this.current_tab = index;
        this.tabs[index].activate(true);
        
        this.content.innerHTML = this.tabs[index].content;
    }
    
    /**
    Sets the content of the specified tab and updates the textNode if the tab is currently active.
    */
    this.setTabContent = function(index, content)
    {
        if(index >= 0 && index < this.tabs.length)
        {
            this.tabs[index].content = content;
            if(index == this.current_tab)
                this.content.innerHTML = content;
        }
    }
    
    this.addTabContent = function(index, content)
    {
        if(index < 0 || index >= this.tabs.length)
            return;
            
        this.tabs[index].content += content;
        if(index == this.current_tab)
            this.content.innerHTML = this.tabs[index].content;
    }
}

/**
MenuControl for easy folder like navigation:
[+]MenuItem
[-]AnotherMenuItem
    SubMenuItem
    Another SubMenuItem

Creates the neccesary DOM elements and appends them to parent_element. 
*/
function MenuControl(parent_element)
{
    /**
    Contains a <div> for the item's label and a <ul> for the SubMenu.
    */
    function MenuItem(parent_element, label)
    {   
        this.folded = true;
        this.items = new Array();
        
        this.label = document.createElement('div');
        this.label.innerHTML = label ? label : 'Section';
        this.label.setAttribute('class', 'menu_item_folded');
        parent_element.appendChild(this.label);
        
        this.ul = document.createElement('ul');
        this.ul.style.display = 'none';
        parent_element.appendChild(this.ul);
        
        /// Toggles between folded and unfolded display of the menu item
        this.toggleFold = function()
        {
            this.folded = !this.folded;
            if(this.folded)
            {
                this.ul.style.display = 'none';
                this.label.setAttribute('class', 'menu_item_folded');
            }
            else
            {
                this.ul.style.display = 'block';
                this.label.setAttribute('class', 'menu_item_unfolded');
            }
        }
    }
    
    this.parent_element = parent_element;
    this.menu_items = new Array();
    this.sub_items = new Array();
    this.cur_sub_item = -1;
    
    /**
    Adds a menu item to the control.
    Returns the index of the MenuItem added to this.menu_items
    */
    this.addItem = function(label)
    {
        var index = this.menu_items.length;
        this.menu_items.push( new MenuItem(this.parent_element, label) );
        
        this.menu_items[index].label.onclick = bind(this, function()
        {
            this.menu_items[index].toggleFold();
        });
        
        //unfold first menu item
        if(index == 0)
            this.menu_items[index].toggleFold();
        
        return index;
    }
    
    /**
    Adds a sub item to an already existing menu item.
    @param index returned by previous call to this.addItem
    @param page_id is the id of the page the sub item will load in on click.
    */
    this.addSubItem = function(index, page_id, label)
    {
        if(index < 0 || index >= this.menu_items.length)
            return;
        
        var sub_index = this.sub_items.length;
        var li = document.createElement('li'); 
        li.innerHTML = label ? label : 'item';
        this.menu_items[index].ul.appendChild(li);
        this.sub_items.push(li);
        
        li.onclick = bind(this, function()
        {
            document.loadContent(page_id);
            if(this.cur_sub_item >= 0)
            {
                if( this.sub_items[this.cur_sub_item].hasAttribute('class') )
                    this.sub_items[this.cur_sub_item].removeAttribute('class');
            }
            this.cur_sub_item = sub_index;
            this.sub_items[this.cur_sub_item].setAttribute('class', 'cur_item');
        });
    }
}