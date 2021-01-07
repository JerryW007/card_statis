declare var $, d3;
import * as _ from 'lodash'

export class d3Util {

    static margin = { left: 30, bottom: 20, right: 30, top: 20 }
    /**
     * 
     * @param position 位置,长，款 (x,y,height,width)
     * @param title 标题
     * @param data 数据 [{key,value}]
     * @param options 配置 {margin:{left,right,top,bottom},ticksX,ticksY,lineColor}
     */
    static normalLine(position: any, target, title, data, options: any) {
        target.html(title);
        let height = position.height ? position.height : 100;
        let width = position.width ? position.width : window.innerWidth;
        let positionX = position.x ? position.x : 0;
        let positionY = position.y ? position.y : 0;
        let margin = d3Util.margin;
        if (options.margin != null) margin = options.margin;
        const svg = target.c("svg:svg").attr("viewBox", [positionX, positionY, width, height]);
        let maxX = Math.max(_.map(data, "key"));
        let maxY = Math.max(_.map(data, "value"));
        let x = d3.scaleLinear().domain([0, maxX]).range([margin.left, width - margin.right - margin.left])
        let y = d3.scaleLinear().domain([0, maxY]).range([height - margin.bottom, margin.bottom])
        let ticksX = options.ticksX ? options.ticksX : 10;
        let ticksY = options.ticksY ? options.ticksY : 10;
        var xAxis = d3.axisBottom().scale(x).ticks(ticksX); //range 包含起点和终点位置
        let yAxis = d3.axisLeft().scale(y).ticks(ticksY).tickSizeInner(3).tickSizeOuter(0); //range 包含起点和终点位置
        svg.c("g").call(xAxis).attr("transform", 'translate(' + margin.left + ',' + (height - margin.bottom) + ')');
        svg.c("g").call(yAxis).attr("transform", 'translate(' + margin.left + ',0)');
        let line = d3.line().x(d => x(d.key + margin.left - 10)).y(d => y(d.value))
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", options.lineColor ? options.lineColor : "steelblue")
            .attr("stroke-width", 1)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", line);
    }
}
