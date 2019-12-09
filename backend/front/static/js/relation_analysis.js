// example();

// function example() {

/* proxy data js 에서 땡겨옴. */
/** buildingNumber data를 이용할것 */
/**
 * [
 * building: {11: 1}
    employee: 60
    floor: 1
    floorzone: 11
    id: 0
    prox-id: "vawelon001"
    timestamp: Tue May 31 2016 00:05:00 GMT+0900 (한국 표준시) {}
    zone: 1
    ]
 */

// department enum;
// const Department = {
//     Administration:0,
//     Engineering:1,
//     Executive:2,
//     Facilities:3,
//     HR:4,
//     InformationTechnology:5,
//     Security:6
// }

function get_gantt_data(){
    var buildingPerProxyId = {};
    for(let i in buildingNumber){
        let row = buildingNumber[i];
        if(buildingPerProxyId[row["prox-id"]]===undefined){
            buildingPerProxyId[row["prox-id"]]=[];
        }
        buildingPerProxyId[row["prox-id"]].push(row);
    }
    
    var gantt_data = [];
    for(let k in buildingPerProxyId){
        let data = buildingPerProxyId[k];
        for(let j=0;j<data.length-1;j++){
            let tmp = {};
            tmp.startDate = data[j].timestamp;
            tmp.endDate = data[j+1].timestamp;
            tmp.taskName = data[j].floorzone;
            tmp["prox-id"] = k;
            tmp.status = data[j].floor;
            tmp["employee_info"] = employeedata[data[j].employee];
            gantt_data.push(tmp);
        }
    }
    return gantt_data;
}

function get_gantt_data_in_department(department_list){
    var buildingPerProxyId = {};
    for(let j in department_list){
        department = department_list[j];
        for(let i in buildingNumber){
            let row = buildingNumber[i];
            if(employeedata[row.employee].Department==department){
                if(buildingPerProxyId[row["prox-id"]]===undefined){
                    buildingPerProxyId[row["prox-id"]]=[];
                }
                buildingPerProxyId[row["prox-id"]].push(row);
            }
        }
    }
    console.log(buildingPerProxyId)
    
    var gantt_data = [];
    for(let k in buildingPerProxyId){
        let data = buildingPerProxyId[k];
        for(let j=0;j<data.length-1;j++){
            let tmp = {};
            tmp.startDate = data[j].timestamp;
            tmp.endDate = data[j+1].timestamp;
            tmp.taskName = data[j].floorzone;
            tmp["prox-id"] = k;
            tmp.status = data[j].floor;
            tmp["employee_info"] = employeedata[data[j].employee];
            gantt_data.push(tmp);
        }
    }
    return gantt_data;
}

function get_gantt_data_in_employee(employee){
    var buildingPerProxyId = {};
    for(let i in buildingNumber){
        let row = buildingNumber[i];
        if(row.employee==employee){
            if(buildingPerProxyId[row["prox-id"]]===undefined){
                buildingPerProxyId[row["prox-id"]]=[];
            }
            buildingPerProxyId[row["prox-id"]].push(row);
        }
    }

    console.log(buildingPerProxyId)
    
    var gantt_data = [];
    for(let k in buildingPerProxyId){
        let data = buildingPerProxyId[k];
        for(let j=0;j<data.length-1;j++){
            let tmp = {};
            tmp.startDate = data[j].timestamp;
            tmp.endDate = data[j+1].timestamp;
            tmp.taskName = data[j].floorzone;
            tmp["prox-id"] = k;
            tmp.status = data[j].floor;
            tmp["employee_info"] = employeedata[data[j].employee];
            gantt_data.push(tmp);
        }
    }
    return gantt_data;
}



/* ------------- d3 library 사용방법 ----------------- */
// var tasks = [
// {"startDate":new Date("Sun Dec 09 01:36:45 EST 2012"),"endDate":new Date("Sun Dec 09 02:36:45 EST 2012"),"taskName":"E Job","status":"RUNNING"},
// {"startDate":new Date("Sun Dec 09 04:56:32 EST 2012"),"endDate":new Date("Sun Dec 09 06:35:47 EST 2012"),"taskName":"A Job","status":"RUNNING"},
// {"startDate":new Date("Sun Dec 09 06:29:53 EST 2012"),"endDate":new Date("Sun Dec 09 06:34:04 EST 2012"),"taskName":"D Job","status":"RUNNING"},
// {"startDate":new Date("Sun Dec 09 05:35:21 EST 2012"),"endDate":new Date("Sun Dec 09 06:21:22 EST 2012"),"taskName":"P Job","status":"RUNNING"},
// {"startDate":new Date("Sun Dec 09 05:00:06 EST 2012"),"endDate":new Date("Sun Dec 09 05:05:07 EST 2012"),"taskName":"D Job","status":"RUNNING"},
// {"startDate":new Date("Sun Dec 09 03:46:59 EST 2012"),"endDate":new Date("Sun Dec 09 04:54:19 EST 2012"),"taskName":"P Job","status":"RUNNING"},
// {"startDate":new Date("Sun Dec 09 04:02:45 EST 2012"),"endDate":new Date("Sun Dec 09 04:48:56 EST 2012"),"taskName":"N Job","status":"RUNNING"},
// {"startDate":new Date("Sun Dec 09 03:27:35 EST 2012"),"endDate":new Date("Sun Dec 09 03:58:43 EST 2012"),"taskName":"E Job","status":"SUCCEEDED"},
// {"startDate":new Date("Sun Dec 09 01:40:11 EST 2012"),"endDate":new Date("Sun Dec 09 03:26:35 EST 2012"),"taskName":"A Job","status":"SUCCEEDED"},
// {"startDate":new Date("Sun Dec 09 03:00:03 EST 2012"),"endDate":new Date("Sun Dec 09 03:09:51 EST 2012"),"taskName":"D Job","status":"SUCCEEDED"},
// {"startDate":new Date("Sun Dec 09 01:21:00 EST 2012"),"endDate":new Date("Sun Dec 09 02:51:42 EST 2012"),"taskName":"P Job","status":"SUCCEEDED"},
// {"startDate":new Date("Sun Dec 09 01:08:42 EST 2012"),"endDate":new Date("Sun Dec 09 01:33:42 EST 2012"),"taskName":"N Job","status":"FAILED"},
// {"startDate":new Date("Sun Dec 09 00:27:15 EST 2012"),"endDate":new Date("Sun Dec 09 00:54:56 EST 2012"),"taskName":"E Job","status":"SUCCEEDED"},
// {"startDate":new Date("Sun Dec 09 00:29:48 EST 2012"),"endDate":new Date("Sun Dec 09 00:44:50 EST 2012"),"taskName":"D Job","status":"SUCCEEDED"},
// {"startDate":new Date("Sun Dec 09 07:39:21 EST 2012"),"endDate":new Date("Sun Dec 09 07:43:22 EST 2012"),"taskName":"P Job","status":"RUNNING"},
// {"startDate":new Date("Sun Dec 09 07:00:06 EST 2012"),"endDate":new Date("Sun Dec 09 07:05:07 EST 2012"),"taskName":"D Job","status":"RUNNING"},
// {"startDate":new Date("Sun Dec 09 08:46:59 EST 2012"),"endDate":new Date("Sun Dec 09 09:54:19 EST 2012"),"taskName":"P Job","status":"RUNNING"},
// {"startDate":new Date("Sun Dec 09 09:02:45 EST 2012"),"endDate":new Date("Sun Dec 09 09:48:56 EST 2012"),"taskName":"N Job","status":"RUNNING"},
// {"startDate":new Date("Sun Dec 09 08:27:35 EST 2012"),"endDate":new Date("Sun Dec 09 08:58:43 EST 2012"),"taskName":"E Job","status":"SUCCEEDED"},
// {"startDate":new Date("Sun Dec 09 08:40:11 EST 2012"),"endDate":new Date("Sun Dec 09 08:46:35 EST 2012"),"taskName":"A Job","status":"SUCCEEDED"},
// {"startDate":new Date("Sun Dec 09 08:00:03 EST 2012"),"endDate":new Date("Sun Dec 09 08:09:51 EST 2012"),"taskName":"D Job","status":"SUCCEEDED"},
// {"startDate":new Date("Sun Dec 09 10:21:00 EST 2012"),"endDate":new Date("Sun Dec 09 10:51:42 EST 2012"),"taskName":"P Job","status":"SUCCEEDED"},
// {"startDate":new Date("Sun Dec 09 11:08:42 EST 2012"),"endDate":new Date("Sun Dec 09 11:33:42 EST 2012"),"taskName":"N Job","status":"FAILED"},
// {"startDate":new Date("Sun Dec 09 12:27:15 EST 2012"),"endDate":new Date("Sun Dec 09 12:54:56 EST 2012"),"taskName":"E Job","status":"SUCCEEDED"},
// {"startDate":new Date("Sat Dec 08 23:12:24 EST 2012"),"endDate":new Date("Sun Dec 09 00:26:13 EST 2012"),"taskName":"A Job","status":"KILLED"}
// ];

var tasks = get_gantt_data();

// var taskStatus = {
//     "SUCCEEDED" : "bar",
//     "FAILED" : "bar-failed",
//     "RUNNING" : "bar-running",
//     "KILLED" : "bar-killed"
// };

var taskStatus = {
    1 : "floor1",
    2 : "floor2",
    3 : "floor3"
}

// var taskNames = [ "D Job", "P Job", "E Job", "A Job", "N Job" ];
var taskNames = buildings;
taskNames=taskNames.sort((a,b)=>b-a);

console.log(taskNames);

tasks.sort(function(a, b) {
    return a.endDate - b.endDate;
});
var maxDate = tasks[tasks.length - 1].endDate;
tasks.sort(function(a, b) {
    return a.startDate - b.startDate;
});
var minDate = tasks[0].startDate;

var format = "%H:%M";

var gantt = d3.gantt().taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format);


var tasks1 = 

$(function(){
    $("input:checkbox").click(function(){
        dept_list = []
        $("input:checkbox").each(function(data) {
            // console.log($(this).is(':checked'))
            if($(this).is(':checked')) {
                dept_list.push(Department[$(this).attr('dept')]);
            }
        });
        console.log(dept_list)
        if(d3.select("svg")[0][0] != null){
            d3.select("svg").remove();
        }
        if($("input:checkbox:checked").length != 0){
            gantt(get_gantt_data_in_department(dept_list));
        }
    });
})


// gantt(tasks);

// };

// /** this is for zooming function */
// var xAxis = d3.axisBottom(x),
//     yAxis = d3.axisLeft(y);
