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
Allows for easy list generation.
Creates an unordered list DOM element and appends it to parent_element.
*/
function ListControl(parent_element)
{
    this.ul = document.createElement('ul');
    parent_element.appendChild(this.ul);
    this.items = new Array();
    
    /**
    Creates a list item element and appends it to this.ul and adds it to this.items
    Returns the created <li> element.
    */
    this.addItem = function()
    {
        var index = this.items.length;
        
        this.items.push( document.createElement('li') );
        this.ul.appendChild( this.items[index] );
        
        return this.items[index];
    }
}

/**
function MenuControl(parent_element)
{
    function MenuItem(parent_element, label)
    {
        this.item = document.createElement('div');
        this.item.innerHTML = label ? label : 'Label';
        parent_element.appendChild(this.item);
        
        this.sub_items = document.createElement('div');
        this.label.appendChild(this.sub_items);
        this.listControl = new ListControl(this.sub_items);
        
        this.addItem = function(label)
        {
            return this.listControl.addItem();
        }
    }
    
    this.parent_element = parent_element;
    this.listControl = new ListControl(parent_element);
    this.items = new Array();
    
    this.addItem = function()
    {
        this.listControl.addItem()
        
    }
    
    this.onClick = function()
    {
        
    }
}*/

function MenuControl(parent_element)
{
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