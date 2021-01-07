
import { app } from "./app"
import { UI, Component } from "./ui"
import { mac2s, odump } from "./utils"
// var d3 =  require("d3-selection");
declare var $, MG, d3;
import * as moment from "moment"
let server = "http://localhost:8081/pcs/v1/platform"


export class Recharge extends Component {

	start() {

		let count = 0
		// this.setState({devices:null})
		this.schedule(() => {
			if (count++ == 0) {
				this.load()
			} else {
				console.log("刷新一次")
				this.refresh()
			}
			if (count > 5) {
				count = 0
			}
		}, 60)
		this.load()
	}

	load() {
		/* Do not reload if there is already a fetch ongoing */
		if (this.state.loading) return
		let url = server + "/shenzhentongmot/perso"
		fetch(url).then(resp => resp.json()).then(respJson => {
			this.setState({ loading: false, status: "ok", data: respJson.data })
		}).catch(e => {
			this.setState({ loading: false, status: "error", message: e })
			console.log("OOopps.. ", e, url)
		})
	}

	render(body, opt = {} as any) {

		document.title = "圈存"
		body = body.html("").append("div").style("margin", "5px").style("margin-top", "10px")
		//图表
		console.log(d3)

		let w = body.style("width").replace("px", ""), h = 100
		var x = d3.scaleTime().domain([new Date(1583823600000), new Date(1604286000000)]).range([10, w - 10])
		var y = d3.scaleLinear().domain([0, 10]).range([10, h - 3]);
		var line = d3.line().x((d) => x(d.CreateTime)).y((d) => y(d.Count)).curve(d3.curveBasis);
		let d3c = require("d3-scale-chromatic")
		let c = d3c.interpolateWarm
		// console.log(this.state.data)
		// let ww = x(3600*1000)-x(0)-.8


		var svg = body.c("div").append("svg:svg")
			.style("height", h + "px")
			.attr("width", w)
			.style("border", "1px solid #000000");
		//添加x坐标轴
		var xAxis = d3.axisBottom().scale(x)
		svg.append("g").call(xAxis).attr("transform", 'translate(10,45)')
		//添加y坐标轴
		var yAxis = d3.axisLeft().scale(y)
		svg.append("g").call(yAxis).attr("transform", 'translate(20,10)')
		svg.append("svg:path")
			.attr("d", line(this.state.data))
			.attr("height", h * (this.state.data.length + 1) + 5)
			.style("margin", 0)
			.attr("fill", "#8470FF")
			.style("border", "1px solid #98F5FF");

		// this.state.data.forEach((item,idx)=>{


		// 	svg.append("svg:text").
		// 		attr("y", idx*h+h-2).
		// 		attr("font-size", "8px").
		// 		attr("fill", "#888").
		// 		text(item.Count+" "+item.CreateTime);

		// // 	if (!item) return;

		// 	svg.append("svg:g").selectAll("bar")
		// 		.data(item.Count)
		// 	.enter().append("rect")
		// 		.style("fill", d=>c(d.v))
		// 		.style("stroke", "none")
		// 		.attr("x", (d) => x(d.t) )
		// 		.attr("width", d=>10 )
		// 		.attr("y", d => idx*h)
		// 		.attr("height", d => h-1 );
		// });

		// svg.append("g")
		// 	.attr("class", "x axis")
		// 	.attr("transform", "translate(0," + h*(this.state.data.length) + ")")
		// 	.call(d3.axisBottom().scale(x))


		let table = body.c("table", "sliced").style("margin-top", "20px").style("width", "100%")
		let header = table.c("thead").c("tr")
		let headerNames = ["城市", "状态", "哈喽", "开卡时间段"]
		headerNames.forEach(name => {
			header.c("td", "divider").style("border-top", "2px solid #888").c("center").html(name)
		})
		let tbody = table.c("tbody")
		if (this.state.loading && !this.state.data) {
			body.append("div").attr("class", "ui active centered inline loader")
			return
		}

		if (this.state.data) {
			this.state.data.forEach(item => {
				console.log(item)
				let tr = tbody.c("tr")
				tr.c("td", "divider").c("center").html(item.Count)
				tr.c("td", "divider").c("center").html(item.Count)
				tr.c("td", "divider").c("center").html(item.Count)
				tr.c("td", "divider").c("center").html(moment(item.CreateTime).format("yyyy-MM-DD HH:mm"))
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