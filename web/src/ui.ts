// import { resolve } from 'universal-router';
var store = require("store2")
var d3 = require("d3-selection");
import { ActivityMonitor, ACTIVE, INACTIVE } from 'browser-activity-monitor'
const monitor = new ActivityMonitor(document)
declare var $, Router, Promise;
import UniversalRouter from 'universal-router';

var defaultHeight = 200;
var defaultWidth = '100%';

d3.selection.prototype.c = function(obj,cla,sty,con) {
	let o =this.append(obj)
	if (cla) o.attr("class",cla)
	if (sty) {
		for (let k in sty) {
			o.style(k,sty[k])
		}
	}
	if (con) {
		o.html(con)
	}
    return o;
}

export class Component {
    updateRoute;
    active = true;
    state = {} as any;
    parameters = {};
    updated = true;

    constructor(public div = null, private visible = false){
        let className = getObjectClass(this);
        let components = window["components"] = window["components"] || [];
        components[className] = {
            name: className,
            instance: this
        };
        this.componentDidMount()
    }

    componentDidMount() {}

    setVisible(v) {
		var ov = this.visible;
		this.visible = v;
		//if (v) console.log("visible",this)
		if (v&&!ov) {
			//console.log("set",getObjectClass(this),v?"visible":"invisible")
			//console.log("start",this)
			this.start();
			if (this.div) this.refresh();
		}
		if (!v&&ov) {
			//console.log("set",getObjectClass(this),v?"visible":"invisible")
			//console.log("stop",this)
			this.stop();
		}
    }
    
    isVisible() {
		return (this.active && this.visible)?true:false;
    }
    
	setActive(a) {
		//console.log("set",getObjectClass(this),a?"active":"inactive")
		this.active = a;
    }
    
    setState(state,updated=false) {

		//console.log(new Date(),"set state",getObjectClass(this),this.isVisible()?"visible":"invisible")
		this.componentWillUpdate(state,this.state)

		// let updated = false;
		for (var k in state) {
			if (this.state[k]!=state[k]) {
				updated = true
			}
			this.state[k]=state[k];
		}

		this.updated = updated;

		if (this.div) {
			if (this.visible) {
				this.refresh();
			}
		}

		if (this.updateRoute && this.isVisible()) {
			// console.log("update route for ",this)
			this.updateRoute(this.state);
		}

    }
    
    componentWillUpdate(s1,s2) {}
	render(div) {};
	route(params) {
		if (!params) params = {}
		for (var p in this.parameters) {
			if (!params[p]) {
				var v = this.parameters[p]
				if (typeof v == "function") v=v();
				params[p]=v
			}
		}
		this.setState(params)
	}

	refreshTimeout
	refresh() {
		if (!this.updated) {
			// console.log("render ** skip **",this)
			return
		}
		
		clearTimeout(this.refreshTimeout)
		this.refreshTimeout = setTimeout(()=>{

			try { 
				// console.log("render",this)
				this.render(this.div) 
				this.updated = false;
			}
			catch (e) {
				this.div.append("div")
					// .style("position","absolute")
					// .style("top","50px")
					.style("background-color","yellow")
					.style("padding","5px")
					.html("Oooops..."+e.toString())
				throw(e)
			}
		},10);

	}

	start() {}

	private scheduler = null;
	schedule(cb,time) {
		if (this.scheduler) {
			clearTimeout(this.scheduler)
		}
		if (this.isVisible) {
			cb()
		}
		this.scheduler = setTimeout(()=>{
			this.scheduler = undefined
			this.schedule(cb,time)
		},time*1000);
	}

	stop() {
		/* Stop the schedule if any */
		if (this.scheduler) clearTimeout(this.scheduler)
		this.scheduler = undefined
	}


	childComponents = {}
	addChildComponent(name, component,div) {

		if (!this.childComponents[name]) {
			let child = Component.create(component)
			this.childComponents[name]=child	
		}

		let child = this.childComponents[name]
		child.setVisible(this.isVisible);
		div.node().appendChild(child.div.node())	
		return child
	}

    /* ---------------------------- */

    static refresh(component)
    {
        let className = getComponentClass(component);
        let components = window["components"];
        
        let instance = null
        for (let id in components) 
        {
            let c = components[id];
            if (c.name == className) 
            {
                let oldInstance = components[id].instance;
                let state  = oldInstance.state;
                var newInstance = new component(oldInstance.div,oldInstance.visible);
                components[id].instance = newInstance;
                newInstance.setState(state);
                instance = newInstance
            }
        }
        return instance
    }

    static create(component, opt?: any) {
        let id = getComponentClass(component);
        if (opt&&opt.id) id += "-"+opt.id;
        var o = document.getElementById(id);
        if (!o) {
        	let div =d3.select(document.createElement("div")).attr("id",id)
            let c = new component(div);
            return c;
        } else {
        	//console.log("Component",id,"found - refreshing only")
            return Component.refresh(component);
        }
    }

}

interface TabCtrl {
	component:Component;
	params; // router context`
	title;
	path;
	menu;
	div;

	select:()=>void;
}

class Tabs extends Component {
    routes = [];
    options = [];
    main;
    menu;

    componentDidMount(){
        window.onhashchange = () => {
            this.route()
        }
    }

    render(div){
        if (!this.menu) {
            div.html("")
            this.menu = div.append("div").attr("class","ui top fixed small pointing menu").style("margin",0)
            this.main = div.append("div").style("height","100%")
        }
        this.menu.html("")
        this.main.html("")
        this.menu.append("a").attr("class","item").style("cursor","pointer").style("padding",0).append("img").attr("src","favicon.ico").style("height","24px").style("width","40px").style("margin","5px").on("click", () => {
            (window as any).location = "#home"
        })
        if (this.state.tabs) {
            this.state.tabs.forEach(tab => {
                this.menu.append("a").attr("class","item " + (tab.active ? "active" : "")).style("font-size","80%").html(tab.title).on("click", () => {
                    this.select(tab)
                })

                this.main.node().appendChild(tab.div.node())
                tab.div.style("padding-top","42px").style("height","100%").style("overflow","scroll").style("display",tab.active ? "block" : "none")
            })
        }        
        
        if (!this.state.options) return;

        let optionMenu = this.menu.append("div").attr("class","right menu")
        this.state.options.forEach(option => {
           
            if (option.type == "menu") {
                let item = optionMenu.append("div").attr("class","ui dropdown item")
                let stitle = item.append("span").html(option.title)
                item.append("i").attr("class","dropdown icon")
                let menu = item.append("div").attr("class","menu")
                
                option.values.forEach(v => {
                    let name = v;
                    if (option.names) v = option.names(v);
                    menu.append("a").attr("class","item").html(name).attr("date-value",v).on("click", () => {
                        option.select(v)
                    })
                })
                option.item = item;
                $(item.node()).dropdown().dropdown("set selected", option.selected)
            } else if (option.type == "login") {}
        })

    }

    set title(title) {
        this.setState({title})
    }

    add(title,component:Component = undefined) {

		var path = "/"+title;
		if (component) {
			for (var p in component.parameters) path+="/:"+p;
			path=path.replace(/ /g,"-")
			component.updateRoute = state => {

				var cpath = path
				for(var k in state) {
					cpath = cpath.replace(":"+k,state[k])
				}

				if (window.top.location.hash!="#"+cpath) {
					//console.log("[route]","update route to",cpath,"from",window.top.location.hash,"for",component)
					window.top.location.hash = cpath
				}
			}
		}

		let div = d3.select(document.createElement("div"))
		let tab = {path,title,component,div} as TabCtrl;
		component.div = div

		tab.select = () => this.select(tab)

		this.routes.push({
			path: path,
			action: context =>{
				tab.params = context.params
				return tab
			}
		});

		if (path!="/"+title) {
			this.routes.push({
				path: "/"+title,
				action: context =>{
					tab.params = {}
					return tab
				}
			});
		}

		let tabs = this.state.tabs||[]
		tabs.push(tab)
		this.setState({tabs})

		return tab

    }
    
    optionMenu(title, values, names, actions) {

		function select(v) {
			store.set("opt-menu-"+title,v)
			option.selected = v
			$(option.item.node()).dropdown("set selected",v)
			actions(v)
		}

		let option = {
			type:"menu",
			title,
			values,
			actions,
			item:null,
			select,
			selected:store.get("opt-menu-"+title)||values[0]
		}

		let options = this.state.options||[]
		options.push(option)
		this.setState({options})
		actions(option.selected)
		return { select }
    }
    
    select(ntab: TabCtrl) {
        if (this.state.tabs) {
			this.state.tabs.forEach(tab=>{
				let selected = ntab.div==tab.div
				tab.component.setVisible(selected);
				tab.active = selected
			})
		}

		document.title = ntab.title
		ntab.component && ntab.component.route(ntab.params)
		this.setState({tabs:this.state.tabs,selected:ntab})
    }

    route() {
        let path = window.top.location.hash.substr(1)
        // console.log(path)
        // new UniversalRouter({}).resolve(this.routes, {path}).then(tab => {

		// 	// console.log("Routing to ",tab)
		// 	this.select(tab)F
		  
		// }).catch(()=>{

		// 	/* Nothing... then default page is fine! */
		// 	// console.log("route unknown...'"+path+"' :",this.routes)
		// 	if (this.state.tabs) {
		// 		this.select(this.state.tabs[0]);
		// 	}

		// });
	}
}

export class UI extends Component {
    paused = false;
    refreshCb;
    tabs:Tabs;

    errorTimeout;
    errorDiv;
    tabsDiv;

    constructor(private body) {
        super(body)
        let root = document.body
        while (root.hasChildNodes()) root.removeChild(root.childNodes[0])
        document.body.appendChild(body.node())
        body.html("").style("height","100%")
        this.refreshCb = []

		var element = document.createElement("style")
		// element.type = "text/css"
		element.setAttribute("type","text/css")
		var cssFile = require("./style.css")
        element.innerHTML = cssFile
        document.body.appendChild(element)

        d3.select(window).on('resize', () => {
            this.refresh()
        })

        window.onerror = (msg) => {
            console.log(msg)
            this.errorNtf(msg)
        }
        monitor.on(ACTIVE,() => {
            this.paused = false;
            this.refresh()
        })

        monitor.on(INACTIVE, ()=>{
            this.paused = true;
        })
        this.tabsDiv = this.body.append("div").style("height","100%")
        this.tabs = new Tabs(this.tabsDiv)
        this.tabs.setVisible(true)
        this.errorDiv = this.body.append('div').style("positin","fixed")
        this.tabsDiv.style("display","block")        
			
    }

    errorNtf(msg){

    }

}

function getObjectClass(obj) {
    if (obj && obj.constructor && obj.constructor.toString) {
        var arr = obj.constructor.toString().match(
            /function\s*(\w+)/);

        if (arr && arr.length == 2) {
            return arr[1];
        }
    }

    return undefined;
}


function getComponentClass(component) {
    var arr = component.toString().match(/function\s*(\w+)/);
    let className = (arr && arr.length == 2) ? arr[1] : "xxx";
    return className;
}