/**
Creates a tab control and corresponding DOM elements and appends them to parentElement.
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