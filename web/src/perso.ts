
import {app} from "./app"
import {UI,Component} from "./ui"
import {mac2s,odump} from "./utils"
declare var $, MG, d3;

let server = "http://localhost:8081/pcs/v1/platform"

export class Perso extends Component {

	start() {

		let count = 0
		this.schedule(()=>{
			if (count++==0) {
				this.load()
			} else {
				this.refresh()
			}
			if (count>5) {
				count = 0
			}
		},60)
		this.load()
	}

	load(){
		if (this.state.loading) return	
		let url = server + "/shenzhentongmot/perso"
		fetch(url).then(resp => resp.json()).then(respJson => {
			this.setState({loading:false,status:"ok",data:respJson.data})
		}).catch(e => {
			this.setState({loading:false,status:"error",message:e})
			console.log("OOopps.. ",e,url)
		})
	}

	render(body, opt={} as any) {
		document.title = "个人化"
		if (!this.state && !this.state.data) {
			console.log("1111")
			body.html("Sorry, something wrong happend...").append("div").html(this.state.message)
			return
		}
		// body.c("center").c("span","ui very large  header").html("分钟开卡统计")
		// let w = body.style("width").replace("px",""),h=15
		// let x = d3.scaleTime().domain([.2,0]).range([10, 100]);
		// super.render(body);
	}

}

