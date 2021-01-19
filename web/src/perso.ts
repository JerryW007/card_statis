
import { app } from "./app"
import { UI, Component } from "./ui"
import { mac2s, odump } from "./utils"
import * as _ from "lodash"
declare var $, MG, d3;

let server = "http://localhost:8081/pcs/v1/platform"

export class Perso extends Component {

	start() {

		let count = 0
		this.schedule(() => {
			if (count++ == 0) {
				this.load()
			} else {
				this.refresh()
			}
			if (count > 5) {
				count = 0
			}
		}, 60)
		this.load()
	}

	load() {
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
		this.state.data = [{ key: 0, value: "47" }, { key: 25, value: "90" }, { key: 50, value: "05" }, { key: 75, value: "73" }, { key: 100, value: "47" }, { key: 125, value: "01" }, { key: 150, value: "21" }, { key: 175, value: "98" }, { key: 200, value: "01" }, { key: 225, value: "00" }, { key: 250, value: "83" }, { key: 275, value: "13" }, { key: 300, value: "22" }, { key: 325, value: "72" }, { key: 350, value: "45" }, { key: 375, value: "94" }, { key: 400, value: "86" }, { key: 425, value: "49" }, { key: 450, value: "48" }, { key: 475, value: "10" }, { key: 500, value: "00" }, { key: 525, value: "00" }, { key: 550, value: "00" }, { key: 575, value: "51" }, { key: 600, value: "00" }, { key: 625, value: "00" }, { key: 650, value: "04" }, { key: 675, value: "19" }, { key: 700, value: "47" }, { key: 725, value: "37" }, { key: 750, value: "48" }, { key: 775, value: "00" }, { key: 800, value: "10" }, { key: 825, value: "00" }, { key: 850, value: "00" }, { key: 875, value: "00" }, { key: 900, value: "00" }, { key: 925, value: "05" }, { key: 950, value: "35" }, { key: 975, value: "24" }, { key: 1000, value: "41" }];
		document.title = "个人化"
		if (!this.state && !this.state.data) {			
			body.html("Sorry, something wrong happend...").append("div").html(this.state.message)
			return
		}
		body = body.html("");
		let margin = { left: 30, right: 30, top: 20, bottom: 20 };
		var center = body.c("center").attr("margin", "10");
		//加载执行了三次
		center.html("分钟开卡统计")
		let height = 100;
		let width = window.innerWidth;

		const svg = center.c("svg:svg").attr("viewBox", [0, 0, width, height]);
		let x = d3.scaleLinear().domain([0, 1000]).range([0, width - margin.left - margin.right]);
		var xAxis = d3.axisBottom().scale(x).ticks(10); //range 包含起点和终点位置
		let y = d3.scaleLinear().domain([0, 100]).range([height - margin.bottom, margin.bottom]);
		let revertY = d3.scaleLinear().domain([height - margin.bottom, margin.bottom]).range([0, 100])
		let yAxis = d3.axisLeft(y).ticks(5).tickSizeInner(3).tickSizeOuter(0); //range 包含起点和终点位置
		svg.c("g").call(xAxis).attr("transform", 'translate(' + margin.left + ',' + (height - margin.bottom) + ')');
		svg.c("g").call(yAxis).attr("transform", 'translate(' + margin.left + ',0)');
		let line = d3.line().x(d => x(d.key + margin.left - 10)).y(d => y(d.value))
		let path = svg.append("path")
			.datum(this.state.data)
			.attr("fill", "none")
			.attr("stroke", "steelblue")
			.attr("stroke-width", 1)
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("d", line);
		let tip = svg.append("svg:text")
			.attr("font-size", "15px")
			.attr("fill", "#888")
			
		path.on("mouseover", (event) => {
			var xPosition = event.clientX;
			var yPosition = event.clientY - height + margin.top * 2;
			tip.attr("x", xPosition)
				.attr("y", yPosition - 10)
				.style("display", "")
				.text(parseInt(revertY(yPosition)));
		})
		// .on("mouseout", function (event) {
		// 	tip.style("display", "none");
		// });

		super.render(body);
	}

}

