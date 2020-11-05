
import {app} from "./app"
import {UI,Component} from "./ui"
import {mac2s,odump} from "./utils"
declare var $, MG, d3;
import * as moment from "moment"
let server = "http://localhost:8081/pcs/v1/platform"


export class Recharge extends Component {

	start() {

		let count = 0
		// this.setState({devices:null})
		this.schedule(()=>{
			if (count++==0) {
				this.load()
			} else {
				console.log("刷新一次")
				this.refresh()
			}
			if (count>5) {
				count = 0
			}
		},60)
		this.load()
	}

	load(){
		/* Do not reload if there is already a fetch ongoing */
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

		document.title = "圈存"
		body = body.html("").append("div").style("margin","5px").style("margin-top","10px")
		
		//图表
		
		let table = body.c("table", "sliced").style("margin-top","20px").style("width","100%")
		let header = table.c("thead").c("tr")
		let headerNames = ["城市", "状态", "哈喽", "开卡时间段"]
		headerNames.forEach(name => {
			header.c("td","divider").style("border-top","2px solid #888").c("center").html(name)
		})
		let tbody = table.c("tbody")
		if (this.state.loading && !this.state.data) {
			body.append("div").attr("class","ui active centered inline loader")
			return
		}
		
		if (this.state.data) {
			this.state.data.forEach(item => {
				console.log(item)
				let tr = tbody.c("tr")
				tr.c("td","divider").c("center").html(item.Count)
				tr.c("td","divider").c("center").html(item.Count)
				tr.c("td","divider").c("center").html(item.Count)
				tr.c("td","divider").c("center").html(moment(item.CreateTime).format("yyyy-MM-DD HH:mm"))
			})
		}
		// if (!this.state.devices) return

		// let body = div.html("")
		// div.c("h1","ui header").html("Bricked Devices")
		// 	.c("small").style("color","#888").style("font-weight","normal")
		// 	.html(" (Seen but not reporting)")
		// super.render(div.c("div"))

		super.render(body)
	}
}