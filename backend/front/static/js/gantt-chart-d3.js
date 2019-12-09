/**
 * Gantt chart visualizer for D3 library
 *
 * @author Dimitry Kudrayvtsev
 * @author Valery Sukhomlinov <valery.sukhomlinov@booking.com>
 * @license Apache-2.0
 * @version 2.1
 */


/**
 * Append title tooltip element to SVG objects for tasks with desc attribute set
 * @param {object} d
 * @param {integer} i
 */
function descFunction (d, i) {
    if (d.desc != undefined) {
        d3.select(this).append('title').text(d.desc);
    }
}

/**
 * Gantt chart object
 * @returns {gantt}
 */

var amphasize = false;
d3.gantt = function () {
    var FIT_TIME_DOMAIN_MODE = "fit";
    var FIXED_TIME_DOMAIN_MODE = "fixed";

    var margin = {
        top: 20,
        right: 40,
        bottom: 20,
        left: 150
    };
    var timeDomainStart = d3.time.day.offset(new Date(), -3);
    var timeDomainEnd = d3.time.hour.offset(new Date(), +3);
    var timeDomainMode = FIT_TIME_DOMAIN_MODE;// fixed or fit
    var taskTypes = [];
    var taskStatus = [];
    var height = document.body.clientHeight - margin.top - margin.bottom - 5;
    var width = document.body.clientWidth - margin.right - margin.left - 5;
    var container = "body";

    var tickFormat = "%H:%M";
    var mab;
    var clicks=0,DELAY=500;
    /**
     * Create new SVG object and render chart in it
     * @param {object} tasks - array of tasks
     * @returns {gantt}
     */
    function gantt(tasks) {

        initTimeDomain(tasks);
        initAxis();

        var svg = d3.select(container)
            .append("svg")
            .attr("class", "chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .call(d3.behavior.zoom().x(xScale).on("zoom", zoomed));
        
        svg.append("g")
            .attr("clip-path","url(#clip)")
            .attr("class", "gantt-chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")

    
        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height)

        svg = d3.select("g")
        svg.selectAll(".chart")
            .data(tasks, keyFunction).enter()
            .append("rect")
            .attr("employee",(d)=>d.employee_info.id)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("class", classNameFunction)
            // .attr("class", "area")
            .attr("y", (d)=>y(d.taskName))
            .attr("x",(d)=>x(d.startDate))
            // .attr("transform", rectTransform)
            .attr("height", function (d) {
                return y.rangeBand();
            })
            .attr("width", function (d) {
                return (x(d.endDate) - x(d.startDate));
            })
            .on('mouseover', function(d){
                // console.log(d);
                // var tag = "Floor: " + parseInt(d.taskName / 10) /  + " Zone: " + d.taskName % 10 +"<br/>" + 
                // "Name: " + d.employee_info["First Name"] + "<br/>" + 
                // "Department: " + d3.select(this).data()[0].startTime + "<br/>" + 
                // "Timestamp: " + d3.select(this).data()[0].endTime;
                // d3.select('#tooltip')
                //     .style("left", d3.event.pageX+"px")
                //     .style("top", d3.event.pageY+"px")
                //     .select('#value')
                //     .text(tag);
                
                // $(this).attr("opacity","1");
                d3.select('#tooltip').classed('hidden', false);
            })
            .on('click',(d,i)=>{
                clicks++;  //count clicks

                if(clicks === 1) {

                    timer = setTimeout(function() {

                        clicks = 0;             //after action performed, reset counter
                        if(amphasize==false){
                            $(".chart rect").attr("opacity","0.05");
                        }
                        console.log(d);
                        $(`.chart rect[employee=${d.employee_info.id}]`).attr("opacity","1");
                        amphasize=true;
                    }, DELAY);

                } else {

                    clearTimeout(timer);    //prevent single-click action
                    $(`.chart rect`).attr("opacity","1");
                    amphasize=false;
                    clicks = 0;             //after action performed, reset counter
                }
                
            })
            // .on('dbclick',function(d,i){
            // })
            .on('contextmenu',function(d,i){
                $(`.chart rect[employee=${d.employee_info.id}]`).attr("opacity","0.05");
            })
            .on('mouseout', function(d){
                d3.select('#tooltip').classed('hidden', true);
            })
            .on('mousemove', function(d){ // 좀있다 라벨에 bold체 추가할 것
                var tag = "<b>Floor</b>: " + d.status + " <b>Zone</b>: " + d.taskName % 10 + "</br>" +
                "<b>Name:</b> " + d.employee_info["First Name"] + " " + d.employee_info["Last Name"] +  "</br>" + 
                "<b>Department:</b> " + Object.keys(Department)[d.employee_info["Department"]]+ "</br>" + 
                "<b>Timestamp:</b> " + hoverTime(d.startDate,d.endDate);
                d3.select('#tooltip')
                    .style("left", d3.event.pageX+20+"px")
                    .style("top", d3.event.pageY-10+"px")
                    .select('#value')
                    .html(tag);
            })
            .each(descFunction);

        mab = svg.selectAll("rect");
        
        d3.select("svg").append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin.left + ", " + (height  - margin.bottom)+ ")")
            // .attr("transform", "translate(0, " + (height  - margin.bottom) + ")")
            .transition()
            .call(xaxis)

            
        d3.select("svg").append("g").attr("class", "y axis").transition().call(yAxis)
            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
        hideTicksWithoutLabel();
        return gantt;
    };

    var classNameFunction = function(d) {
        if (taskStatus[d.status] == null) {
            return "bar";
        }
        return taskStatus[d.status];
    }

    /**
     * Update existing SVG chart with new tasks
     * @param {object} tasks - list of tasks (old and new ones)
     * @returns {gantt}
     */
    gantt.redraw = function (tasks) {

        initTimeDomain(tasks);
        initAxis();

        var svg = d3.select("svg");
        var ganttChartGroup = svg.select(".gantt-chart");
        var rect = ganttChartGroup.selectAll("rect").data(tasks, keyFunction);
        mab = rect;
        rect.enter()
            .insert("rect", ":first-child")
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("class", classNameFunction)
            .each(descFunction)
            .transition()
            .attr("y", (d)=>y(d.taskName))
            .attr("x",(d)=>x(d.startDate))
            // .attr("transform", rectTransform)
            .attr("height", function (d) {
                return y.rangeBand();
            })
            .attr("width", function (d) {
                return (x(d.endDate) - x(d.startDate));
            });

        rect.transition()
            .attr("x",(d)=>x(d.startDate))
            // .attr("transform", rectTransform)
            .attr("height", function (d) {
                return y.rangeBand();
            })
            .attr("width", function (d) {
                return (x(d.endDate) - x(d.startDate));
            });

        rect.exit().remove();

        svg.select(".x").transition().call(xAxis);
        svg.select(".y").transition().call(yAxis);
        console.log("redraw");
        console.log(mab);
        svg.call(zoom);
        return gantt;
    };

    gantt.margin = function (value) {
        if (!arguments.length)
            return margin;
        width = width + margin.left + margin.right;
        margin = value;
        width = width - margin.left - margin.right;
        return gantt;
    };

    gantt.timeDomain = function (value) {
        if (!arguments.length)
            return [timeDomainStart, timeDomainEnd];
        timeDomainStart = +value[0], timeDomainEnd = +value[1];
        return gantt;
    };

    /**
     * @param {string} value  - The value can be "fit" - the domain fits the data or "fixed" - fixed domain.
     */
    gantt.timeDomainMode = function (value) {
        if (!arguments.length)
            return timeDomainMode;
        timeDomainMode = value;
        return gantt;

    };

    /**
     * @param {object} value - array of strings with possible task types
     * @returns {*}
     */
    gantt.taskTypes = function (value) {
        if (!arguments.length)
            return taskTypes;
        taskTypes = value;
        return gantt;
    };

    /**
     * @param {object} value - mapping to CSS styles depending on task type
     * @returns {*}
     */
    gantt.taskStatus = function (value) {
        if (!arguments.length)
            return taskStatus;
        taskStatus = value;
        return gantt;
    };

    gantt.width = function (value) {
        if (!arguments.length)
            return width + margin.left + margin.right;
        width = +value - margin.left - margin.right;
        return gantt;
    };

    gantt.height = function (value) {
        if (!arguments.length)
            return height;
        height = +value;
        return gantt;
    };

    gantt.tickFormat = function (value) {
        if (!arguments.length)
            return tickFormat;
        tickFormat = value;
        return gantt;
    };

    /**
     * @param {string} value - string selector for chart container
     * @returns {*}
     */
    gantt.container = function(value) {
        if (!arguments.length)
            return container;
        container = value;
        return gantt;
    }

    /**
     * Calculate key for given task for chart rendering/updating
     * @param {object} d
     * @returns {*}
     */
    var keyFunction = function (d) {
        return d.startDate + d.taskName + d.endDate;
    };

    var rectTransform = function (d) {
        return "translate(" + x(d.startDate) + "," + y(d.taskName) + ")";
    };

    var x = d3.time.scale().domain([timeDomainStart, timeDomainEnd]).range([0, width]);

    var y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([0, height - margin.top - margin.bottom], .1);

    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
        .tickSize(8).tickPadding(8);

    var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);

    var newDomain = [];
    var xScale =  d3.svg.axis().scale(x);
    var xaxis = d3.svg.axis().scale(xScale);

    var initTimeDomain = function (tasks) {
        if (timeDomainMode === FIT_TIME_DOMAIN_MODE) {
            if (tasks === undefined || tasks.length < 1) {
                timeDomainStart = d3.time.day.offset(new Date(), -3);
                timeDomainEnd = d3.time.hour.offset(new Date(), +3);
                return;
            }
            tasks.sort(function (a, b) {
                return a.endDate - b.endDate;
            });
            timeDomainEnd = tasks[tasks.length - 1].endDate;
            tasks.sort(function (a, b) {
                return a.startDate - b.startDate;
            });
            timeDomainStart = tasks[0].startDate;
        }
    };

    var initAxis = function () {
        x = d3.time.scale().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);
        y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([0, height - margin.top - margin.bottom], .1);
        xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
            .tickSize(0).tickPadding(8);

        yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);
        xScale =  d3.time.scale().domain([timeDomainStart, timeDomainEnd]).range([0, width]);
        xaxis = d3.svg.axis().scale(xScale);
    };

    function zoomed() {
        xaxis.scale(xScale);
        d3.select(".x.axis").call(xaxis.scale(xScale));
        mab.attr("transform", "translate(" + [d3.event.translate[0],0] + ")scale(" + [d3.event.scale,1] + ")");
    }
      
    var zoom = d3.behavior.zoom()
        .x(x)
        .scaleExtent([1, 20])
        .on("zoom", zoomed);
    var xscale = d3.scale.linear();
    var xzoom = d3.behavior.zoom()
        .x(x)
        .on("zoom", zoomed);
    var hideTicksWithoutLabel = function() {
        //hide ticks without label
        d3.selectAll(".y.tick")[0].forEach(function(g) {
            if (d3.select(g).select("text").text() == "") {
            d3.select(g).style("display", "none");
            } else {
            d3.select(g).style("display", "");
            }
        })
        }
        
    return gantt;
};
