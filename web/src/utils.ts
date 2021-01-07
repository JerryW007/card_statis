
declare var moment;

export function mac2s(m) {
	m = Number(m).toString(16)
	while (m.length<2*6) {
		m = '0'+m
	}
	let s = ""
	for (let i=0;i<m.length;i+=2) {
		if (i) s+=":"
		s += m.substr(i,2)
	}
	return s
}

export function xodump(title,o) {
	return "<div class='ui header'>"+title+"</div>"+odump(o)
}

export function odump(o,d=0) {
	if (typeof o != "object") return o;
	let s = ""
	for (var k in o) {
		let val = odump(o[k],d+1)
		if (k=="checktime") {
			val = moment(o[k]).from(moment())
		} else if (k=="lineName") {
			val = o[k].replace(/\//g,", ")
		}
		k = "<span style='color:#888'>"+k+"</span>"
		s += "<li>"+k+": "+val
	}
	if (d==0) return s
	return "<ul>"+s+"</ul>"
}

export function influxConvert(s) {
	if (!s.data) return undefined
	if (!s.data[0].Series) return undefined

	let cols = s.data[0].Series[0].columns
	let values = s.data[0].Series[0].values

	values.forEach(x=>{x.time=new Date(x[0])})
	values.sort((a,b)=>a.time-b.time)

	let pt = undefined
	let l = values.map(x=>{
		let v = {
			time: x.time,
			hole: (pt&&pt<x.time-1000*60*60),
		}
		cols.forEach((c,i)=>{if (i) v[c]=x[i]})
		pt = x.time
		return v
	})
	return l
}
