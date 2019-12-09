//  TODO : add visualization guis 

var svgHeight = 1000;

// proxyout.csv 추출한 object array
/*
    [
        {
            floor: "1"
            prox-id: "earpa001"
            timestamp: "2016-05-31 00:20:00"
            zone: "1"
        },
        ... 
    ]
*/
var proxyout = [],
/**
 * [
 *  {
 *      employee: 60
        floor: 1
        floorzone: 11
        id: 0
        prox-id: "vawelon001"
        timestamp: Tue May 31 2016 00:05:00 GMT+0900 (Korean Standard Time) {}
        zone: 1
 *  }
 * ]
 */
    proxydata = [],
    /*
     [
        {
            Department: 0
            First Name: "Mat"
            Last Name: "Bramar"
            Office: 3100
            id: 0
        },
        ... 
    ]
    */
    employeedata = [];

// department enum;
const Department = {
    Administration:0,
    Engineering:1,
    Executive:2,
    Facilities:3,
    HR:4,
    InformationTechnology:5,
    Security:6
}

function getDepartmentByValue(value){
    return Object.keys(Department).find(key => Department[key] === value);
}


function preprocess_proxy_data(data){
    var result = []
    for(let i=0;i<data.length;i++){
        var tmp = {};
        let row = data[i]
        tmp['id'] = i;
        for(const [k,v] of Object.entries(row)){
            if(k=="prox-id"){
                tmp[k] = row[k];
                // TODO: employee의 명단을 이용해서 reference 키를 만들어야함.
                // tmp[]
            }else if(k=="floor" || k=="zone"){
                if(row[k]=="Server Room"){
                    tmp[k]=9;
                } 
                else tmp[k] = parseInt(row[k]);
            }else if(k=="timestamp"){
                tmp[k] = new Date(row[k]);
            }
        }
        result.push(tmp);
    }
    return result;
}

function preprocess_employee_data(data){
    var result = []
    for(let i=0;i<data.length;i++){
        var tmp = {};
        let row = data[i]
        tmp['id'] = i;
        for(const [k,v] of Object.entries(row)){
            if(k=="Department"){
                tmp[k] = Department[row[k].replace(" ","")];
                // TODO: employee의 명단을 이용해서 reference 키를 만들어야함.
                // tmp[]
            }else if(k=="Last Name" || k=="First Name"){
                tmp[k] = row[k];
            }else if(k=="Office"){
                tmp[k] = parseInt(row[k]);
            }
        }
        result.push(tmp);
    }
    return result;
}

// curry를 이용해 미리 변경할 리스트 변수를 함수에 넣어주고, 리턴받은 함수를 ajax callback함수로 실행한다.
const proxyOutCallback = (d)=>{
    csv_successFunction(proxyout)(d,', ');
    proxydata = preprocess_proxy_data(proxyout);
}

const employeeCallback = (d)=>{
    let tmp = [];
    csv_successFunction(tmp)(d,',');
    employeedata = preprocess_employee_data(tmp);
}

$.ajax({
    url: '/static/data/BuildingProxSensorData/csv/Employee\ List.csv',
    dataType: 'text',
    async:false,
  }).done(employeeCallback);

$.ajax({
    url: '/static/data/BuildingProxSensorData/csv/proxOut-MC2.csv',
    dataType: 'text',
    async:false,
  }).done(proxyOutCallback);

//   proxydata에 명단 reference id 추가함.
for(let i in proxydata){
    let row = proxydata[i];
    let tmp = row['prox-id'].replace(/([0-9]+)/,'');
    if(tmp=="jsanjorge"){
        tmp = "ssanjorge jr.";
    }else if(tmp=="rmieshaber"){
        tmp = "rmies haber"
    }
    // console.log(tmp);
    let count=0;
    for(let j in employeedata){
        let row2 = employeedata[j];
        let tmpp = row2['First Name'][0].toLowerCase()+row2['Last Name'].toLowerCase().replace(/(-.+)/,'');
        if(tmp==tmpp){
            proxydata[i]['employee'] = row2.id;
            break;
        }
    }
    if(proxydata[i]['employee']==undefined){
        console.error("there is some undefined reference column");
    }
}

var employeeToproxy = {}
var departmentToemployee = {}
for(let j in employeedata){
    let tmp = [];
    for(let i in proxydata){
        if(proxydata[i].employee==j){
            tmp.push(parseInt(i));
        }
    }
    employeeToproxy[j]=tmp;
}
for(let i in Department){
    let tmp = [];
    for(let j in employeedata){
        if(employeedata[j].Department == Department[i]){
            tmp.push(parseInt(j));
        }
    }
    departmentToemployee[i]=tmp;
}

// merge floor and zone;
for(let i in proxydata){
    let row = proxydata[i];
    let tmp = row.floor*10+row.zone;
    proxydata[i]["floorzone"] = tmp;
}

// each zone people number data
var inbuilding = employeedata.map((a)=>0);
/**
 * [
 *  {
 *      building: {11: 1}
        employee: 60
        floor: 1
        floorzone: 11
        id: 0
        prox-id: "vawelon001"
        timestamp: Tue May 31 2016 00:05:00 GMT+0900 (한국 표준시) {}
        zone: 1
 *  } 
 * ]
 */
var buildingNumber = [];
for(let i in proxydata){
    let row = proxydata[i];
    let new_row = Object.assign({},row);
    new_row["building"] = {};
    // row["employee"] = pro
    
    if( inbuilding[row.employee] == row.floorzone  ){
        continue;
    }
    if(inbuilding[row.employee]!=0){
        new_row["building"][inbuilding[row.employee]] = -1;
    }
    new_row["building"][row.floorzone] = 1;
    inbuilding[row.employee] = row.floorzone;  
    buildingNumber.push(new_row);
}
// 여기까지 데이터 전처리 과정
// 여기부터 데이터 가공 
const buildings = [11,12,13,14,15,16,17,18,
                    21,22,23,24,25,26,27,
                    31,32,33,34,35,36,39];
var si = {"-1":0,"1":0};
// building zone에서 time에 따라 해당 zone에 사람이 얼마나 있는지 데이터로 뽑아냄.                    
function people_in_zone(floorzone){
    let count=0;
    let tmp = [];
    for(let i=0;i<buildingNumber.length;i++){
        if(buildingNumber[i].building!=undefined){
            for(let e in buildingNumber[i].building){
                if(e==floorzone){
                    si[buildingNumber[i].building[e]]++;
                    count+=buildingNumber[i].building[e];
                    if(count < 0) console.error("count should not be negative");
                    let ttmp = {};
                    ttmp["timestamp"] = buildingNumber[i].timestamp;
                    ttmp["people"] = count;
                    tmp.push(ttmp);
                }
            }
        }
    }
    return tmp;
}

// department                    
function people_in_zone_by_department(floorzone){
    let count=0;
    let start = false;
    let starttime;
    let tmpendtime;
    let result = [];
    let now_building = {};
    for(let i in Department){
        now_building[i] = 0;
    }
    for(let i=0;i<buildingNumber.length;i++){
        let row = buildingNumber[i];
        if(buildingNumber[i].building!=undefined){
            if(start==false){
                starttime = buildingNumber[i].timestamp.valueOf();
                tmpendtime = starttime+5*60*1000;
                start = true;
            }
            
            for(let e in buildingNumber[i].building){
                if(e==floorzone){
                    while(buildingNumber[i].timestamp>tmpendtime){
                        let tmp = {};
                        tmp["timestamp"] = new Date(tmpendtime);
                        tmp["people"] = Object.assign({},now_building);
                        result.push( Object.assign({},tmp));
                        tmpendtime += 5*60*1000;
                    }
                    let department = getDepartmentByValue(employeedata[row.employee].Department);
                    now_building[department]+=buildingNumber[i].building[e];
                    count ++;
                }
            }
        }
    }
    return result;
}


var building_data = {};
buildings.map((i)=>{building_data[i]=people_in_zone(i)});


// set the dimensions and margins of the graph
var margin = {top: 60, right: 230, bottom: 50, left: 50},
    width = 1800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
var _data ,_sumstat ,_stackDate;
var svg = d3.select("#prox1")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height+200 + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")")
            .attr("style", "text-anchor:middle; font-family: sans-serif; font-size:12px");

var pointAttrs = {
    x: function(d) { return xScale(d.x); },
    dy: function(d) { return yScale(d.y[1]-y[0]); }
};
      // append the svg object to the body of the page
function set_svg(floorzone){
    
    function zoomed() {
        var t = d3.event.transform, xt = t.rescaleX(x);
        svg.select(".axis--x").call(xAxis.scale(xt));
        svg.selectAll(".path").attr("d", d3.area().x(function(d) { return xt(d.data.timestamp); })
                                            .y0(function(d) {return y(d[0]); })
                                            .y1(function(d) { return y(d[1]); }));
      }

    var zoom = d3.zoom()
            .scaleExtent([1, 64])
            .translateExtent([[0, 0], [width, height]])
            .extent([[500, 0], [width-500, height]])
            .on("zoom", zoomed);


    d3.select("svg").remove();


    d3.select("#prox1")
        .append("svg")
        .attr("width", width+margin.left+margin.right)
        .attr("height", height+200 + margin.top + margin.bottom)
    d3.select("svg").append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height+1000)
    var svg =    d3.select("#prox1").select("svg").append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")

        
     

    let tmpdata = people_in_zone(floorzone);
    var stackedData = d3.stack()
                        .keys(Object.keys(Department))
                        .value(function(d, key){
                            return d.people[key]
                        })
                        (people_in_zone_by_department(floorzone));
    console.log(stackedData.length);
    var x = d3.scaleLinear()
                .domain(d3.extent(tmpdata, function(d) { return d.timestamp; }))
                .range([ 0, width ]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "axis axis--x")
        .call(d3.axisBottom(x).ticks(10).tickFormat((d)=>getTime(d)));
                
                  // Add Y axis
    var y = d3.scaleLinear()
                .domain([0, d3.max(tmpdata, function(d) { return +d.people; })*1.2])
                .range([ height, 0 ]);
    svg.append("g")
            .call(d3.axisLeft(y));
    
    var xAxis = d3.axisBottom(x).ticks(10).tickFormat((d)=>getTime(d)),
        yAxis = d3.axisLeft(y); 
    // color palette
    var color = d3.scaleOrdinal()
        .domain(Object.keys(Department))
        .range(colors)
    
    for(depart in Department){
        svg.append("circle").attr("cx",30).attr("cy",height+50+Department[depart]*30).attr("r", 6).style("fill", color(depart))
        svg.append("text").attr("x", 70).attr("y",height+50+Department[depart]*30).text(depart).style("font-size", "15px").attr("alignment-baseline","middle")
    }
    // Show the areas
    svg
    .selectAll("mylayers")
    .data(stackedData)
    .enter()
    .append("path")
    .attr("class","path")
        .style("fill", (d)=>color(d.key))
        .attr("d", d3.area()
        .x(function(d, i) {return x(d.data.timestamp); })
        .y0(function(d) {return y(d[0]); })
        .y1(function(d) { return y(d[1]); })
    ).attr('pointer-events', 'visibleStroke')
    .on("mouseover", function(d) {
      d3.select(this)
          .attr('fill-opacity', 0.3);
    })                  
    .on("mouseout", function(d) {
      d3.select(this)
          .attr('fill-opacity', 1);
    });

    let d1 = tmpdata[tmpdata.length-1].timestamp,
        d0 = tmpdata[0].timestamp;

    d3.select("svg").call(zoom).transition()
      .duration(1500)
      .call(zoom.transform, d3.zoomIdentity
          .scale(width / (x(d1) - x(d0)))
          .translate(-x(d0), 0));
    console.log(x(-100));
}

 // Create Event Handlers for mouse
 function handleMouseOver(d, i) {  // Add interactivity
    console.log(d,i);
    // Use D3 to select element, change color and size
    d3.select(this).attr({
      fill: "orange",
      r: radius * 2
    });

    // Specify where to put label of text
    svg.append("text").attr({
       id: "t" + d.x + "-" + d.y + "-" + i,  // Create an id for text so we can select it later for removing on mouseout
        x: function() { return xScale(d.x) - 30; },
        y: function() { return yScale(d.y) - 15; }
    })
    .text(function() {
      return [d.x, d.y];  // Value of the text
    });
  }

function handleMouseOut(d, i) {
    // Use D3 to select element, change color back to normal
    d3.select(this).attr({
      fill: "black",
      r: radius
    });

    // Select text by id and then remove
    d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location
  }
