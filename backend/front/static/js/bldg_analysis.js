var start = false;


$(function(){
    $("input:checkbox").click(function(){
        list_area = []
        list_column = []
        list_request = []

        list_global_floor = []
        list_global_column = []
        
        
        result = []
        $("input:checkbox[name=area_selection]").each(function(data) {
            // console.log($(this).is(':checked'))
            if($(this).is(':checked')) {
                list_area.push(" F_"+$(this).attr('floor')+"_Z_"+$(this).attr('zone'))
            }
        });
        $("input:checkbox[name=column_selection]").each(function(data) {
            // console.log($(this).is(':checked'))
            if($(this).is(':checked')) {
                list_column.push(" "+$(this).attr('value'))
            }
        });
        $("input:checkbox[name=global_floor]").each(function(data) {
            // console.log($(this).is(':checked'))
            if($(this).is(':checked')) {
                list_global_floor.push($(this).attr('value'))
            }
        });
        $("input:checkbox[name=global_selection]").each(function(data) {
            // console.log($(this).is(':checked'))
            if($(this).is(':checked')) {
                list_global_column.push($(this).attr('value'))
            }
        });
        $("input:checkbox[name=global_selection2]").each(function(data) {
            // console.log($(this).is(':checked'))
            if($(this).is(':checked')) {
                list_request.push(" "+$(this).attr('value'))
            }
        });
        if(($("input:checkbox[name=column_selection]:checked").length != 0 && $("input:checkbox[name=area_selection]:checked").length != 0)||($("input:checkbox[name=global_floor]:checked").length != 0 && $("input:checkbox[name=global_selection]:checked").length != 0)||$("input:checkbox[name=global_selection2]:checked").length != 0){
            list_area.forEach(function (item1,index,array){
                list_column.forEach(function (item2, index2, array2){
                    list_request.push(item1+item2)
                });
            });
            list_global_floor.forEach(function (item1,index,array){
                list_global_column.forEach(function (item2, index2, array2){
                    list_request.push(" "+item1+" "+item2)
                });
            });
            for(let i in org_data){
                if(i==org_data.length-1 || i=="columns") break;
                let tmp = {};
                tmp["timestamp"] = new Date(org_data[i]["Date/Time"]);//한국표준시 -> 원래 시간대
                for(let j in list_request){
                    if(list_request[j]=="Date/Time"){

                    }else{
                        tmp[list_request[j]] = parseFloat(org_data[i][list_request[j]]);
                    }
                }
                result.push(tmp);
            }
            //Read the data
            function draw_graph(data) {
                d3.select("svg").remove();
                var svg = d3.select("#my_dataviz")
                            .append("svg")
                            .attr("width", width+200 + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom)
                            .append("g")
                            .attr("transform",
                                "translate(" + margin.left + "," + margin.top + ")");
                // y_value regularization
                function draw_multiple_line(data){

                    
                    // color palette
                    var res = data.map(function(d){ return d.key }) // list of group names
                    console.log(res);
                    var color = d3.scaleOrdinal()
                    .domain(d3.extent(data, function(d) { return d.key; }))
                            .range(colors)

                     // Add X axis --> it is a date format
                     var x = d3.scaleLinear()
                     .domain(d3.extent(data[0].values, function(d) {return d.timestamp; }))
                     .range([ 0, width ]);

                     var min = 10000,max=0;
                    for(let i in data){
                        let datum = data[i];
                        let range = d3.extent(datum.values,(d)=>d[datum.key]);
                        if(range[0]==null || range[1]==null) continue;
                        min = min>range[0]?range[0]:min;
                        max = max<range[1]?range[1]:max;
                        svg.append("circle").attr("cx",width).attr("cy",20+i*30).attr("class","legend_circle").attr("r", 6).style("fill", color(datum.key))
                        svg.append("text").attr("x", width+20).attr("y", 20+i*30).attr("class","legend_text").text(datum.key).style("font-size", "15px").attr("alignment-baseline","middle")
    
                    }


                    // Add Y axis
                    var y = d3.scaleLinear()
                        .domain([min-0.01*(max-min),max])
                        .range([ height, 0 ]);


                    // 축 그리기
                    svg.append("g")
                        .attr("transform", "translate(0," + height + ")")
                        .attr("class","x_axis")
                        .call(d3.axisBottom(x).ticks(20).tickFormat((d)=>getTime(d)));
                    svg.append("g")
                        .attr("class","y_axis")
                        .call(d3.axisLeft(y));
                    // for(let index in data){
                            console.log("띠용");

                            // 축 그리기
                        // svg.append("g")
                        //     .attr("transform", "translate(0," + height + ")")
                        //     .attr("class","x_axis")
                        //     .call(d3.axisBottom(x).ticks(10));
                        // svg.append("g")
                        //     .attr("class","y_axis")
                        //     .call(d3.axisLeft(y));
                            
    
                    // Draw the line
                    svg.selectAll(".line")
                        .data(data)
                        .enter()
                        .append("path")
                        .attr("class","line")
                        .attr("fill", "none")
                        .attr("stroke", (d)=>color(d.key))
                        .attr("stroke-width", 1.5)
                        .attr("d", function(d){
                            console.log(d);
                        return d3.line()
                            .x(function(d) { return x(d.timestamp); })
                            .y(function(dd) { 
                                return y(dd[d.key]); 
                            })
                            (d.values)
                        })
                }

                let keys = Object.keys(data[0]);
                keys.shift();
                console.log(keys);
                // // group the data: I want to draw one line per group
                let sumstat = [];
                for(let key in keys){
                    let tmp = d3.nest() // nest function allows to group the calculation per level of a factor
                    .key(function(d) {return keys[key];})
                    .entries(data);
                    sumstat.push(tmp[0]);
                }
                // console.log(data)
                console.log(sumstat)
                draw_multiple_line(sumstat);
                // Add X axis --> it is a date format
                // var x = d3.scaleLinear()
                //     .domain(d3.extent(data, function(d) { return d.timestamp; }))
                //     .range([ 0, width ]);
                // svg.append("g")
                //     .attr("transform", "translate(0," + height + ")")
                //     .call(d3.axisBottom(x).ticks(10));

                // // Add Y axis
                // var y = d3.scaleLinear()
                //     .domain([0, 400])
                //     .range([ height, 0 ]);
                // svg.append("g")
                //     .call(d3.axisLeft(y));

                // // color palette
                // // var res = sumstat.map(function(d){ return d.key }) // list of group names
                // var color = d3.scaleOrdinal()
                // .domain(d3.extent(sumstat, function(d) { return d.key; }))
                //     .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

                // // Draw the line
                // svg.selectAll(".line")
                //     .data(sumstat)
                //     .enter()
                //     .append("path")
                //         .attr("fill", "none")
                //         .attr("stroke", function(d){ return color(d.key) })
                //         .attr("stroke-width", 1.5)
                //         .attr("d", function(d){
                //             console.log(d);
                //         return d3.line()
                //             .x(function(d) { return x(d.timestamp); })
                //             .y(function(d) { 
                //                 let keys = Object.keys(d)[0];
                //                 return y(d[Object.keys(d)[1]]); 
                //             })
                //             (d.values)
                //         })
            }
            console.log(result);
            draw_graph(result);
        }
    });
});