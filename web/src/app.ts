import {UI,Component} from "./ui" 
import {Perso} from "./perso"
import {Recharge} from "./recharge"

declare var module: any;
if (module.hot) {
	module.hot.accept();
}

class About extends Component {
	render(div) {
		div.html(`<br><center><a href='http://wangchao@snowballtech.com'>wangchao@snowballtech.com</a></center>`) 
	}

}
export var ui = Component.create(UI);
ui.tabs.add("perso",Component.create(Perso));
// ui.tabs.add("recharge",Component.create(Recharge));
// ui.tabs.route();
export var app = {
    openCard: function(){
        console.log("sss")
    }
}