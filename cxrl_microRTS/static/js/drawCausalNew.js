function drawCausalGraphNew(){
    const nodes_p1 = ["Num Ally Base", "Num Ally Barrack", "Num Ally Worker", "Num Ally Light", "Num Ally Heavy", "Num Ally Ranged"];
    const nodes_p2 = ["Num Enemy Basse", "Num Enemy Barrack", "Num Enemy Worker", "Num Enemy Light", "Num Enemy Heavy", "Num Enemy Ranged"];
    let causal_div = d3.select('#cs_graph').node().getBoundingClientRect();
    const causal_pan_margin = { top: 30, right: 50, bottom: 50, left: 50 },
    causal_pan_width  = causal_div.width - causal_pan_margin.left - causal_pan_margin.right,
    causal_pan_height = causal_div.height - causal_pan_margin.top  - causal_pan_margin.bottom;

    const rect_node_w = 180;
    const rect_node_h = 60;

    // Create the x and y scales
    let x_band_p1 = d3.scaleBand()
    .range([0, causal_pan_width])
    .domain(nodes_p1)
    .padding(0.2);

    let x_band_p2 = d3.scaleBand()
    .range([0, causal_pan_width])
    .domain(nodes_p2)
    .padding(0.2);


    let y = d3.scaleLinear()
        .range([causal_pan_height, 0])
        .domain([0, 100]);

    let causal_svg = d3.select("#cs_graph").append('svg')
	.attr("width",causal_pan_width + causal_pan_margin.left + causal_pan_margin.right)
	.attr("height",causal_pan_height + causal_pan_margin.top + causal_pan_margin.bottom)
    .attr("id","causal_svg");


    let causal_g = causal_svg.append("g")
        .attr("transform", "translate(" + causal_pan_margin.left + "," + causal_pan_margin.top + ")")
        .attr("id","causal_g");

    d3.select("#causal_g")
    .append('svg:defs')
    .attr("class", "arrow_causal")
    .append('svg:marker')
    .attr('id', 'arrow_causal')
    .attr('viewBox',  '0 -5 10 10' )
    .attr("refX", 10)
    .attr("refY", 0)
    .attr('markerWidth', 8)
    .attr('markerHeight', 8)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .style("fill", "black")
    .attr("opacity", 1);

    d3.select("#causal_g")
    .append('svg:defs')
    .attr("class", "arrow_causal_lp")
    .append('svg:marker')
    .attr('id', 'arrow_causal_lp')
    .attr('viewBox',  '0 -5 10 10' )
    .attr("refX", 5)
    .attr("refY", 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto-start-reverse')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .style("fill", "black")
    .attr("opacity", 1);


    /* node p1 */
    let node_objs_p1 = causal_g.selectAll(".node_obj_p1")
                                .data(nodes_p1);

    //enter new nodes
    let nodeG_p1 = node_objs_p1.enter()
                                .append("g")
                                .attr("class", "node_obj_p1");

    //enter rect
    nodeG_p1.append("rect")
    .attr("class", "node_p1")
    .attr("rx", 6)
    .attr("ry", 6)
    .attr("width", rect_node_w)
    .attr("height", rect_node_h);

    nodeG_p1.append("text")
    .attr("class", "node_label_p1")
    .text((d) =>d)
    .attr("x",rect_node_w/2)
    .attr("y",rect_node_h*0.3)
    .attr("text-anchor",'middle')
    .attr("font-size", 15)
    .attr("font-family", "sans-serif")
    .style("fill","black");


    node_objs_p1 = node_objs_p1.merge(nodeG_p1);


    // enter position of node g
    node_objs_p1.attr("transform",function(d) {
    return "translate(" + x_band_p1(d) + "," +  y(90) + ")"
    });

    /* node p2 */
    let node_objs_p2 = causal_g.selectAll(".node_obj_p2")
    .data(nodes_p2);

    //enter new nodes
    let nodeG_p2 = node_objs_p2.enter()
            .append("g")
            .attr("class", "node_obj_p2");

    //enter rect
    nodeG_p2.append("rect")
    .attr("class", "node_p2")
    .attr("rx", 6)
    .attr("ry", 6)
    .attr("width", rect_node_w)
    .attr("height", rect_node_h);

    nodeG_p2.append("text")
    .attr("class", "node_label_p2")
    .text((d) =>d)
    .attr("x",rect_node_w/2)
    .attr("y",rect_node_h*0.3)
    .attr("text-anchor",'middle')
    .attr("font-size", 15)
    .attr("font-family", "sans-serif")
    .style("fill","black");


    node_objs_p2 = node_objs_p2.merge(nodeG_p2);


    // enter position of node g
    node_objs_p2.attr("transform",function(d) {
    return "translate(" + x_band_p2(d) + "," +  y(30) + ")"
    });

    d3.select("#causal_svg").append('text')
    .attr('x', 10)
    .attr('y', causal_div.height * 0.1)
    .attr("id","time_p1_text")
    .text("Player1 State")
    .style('fill','black')
    .style('font-size', '1rem')
    .attr("stroke","black")
    .attr("stroke-width",0.3);

    d3.select("#causal_svg").append('text')
    .attr('x', 10)
    .attr('y', causal_div.height * 0.8 + 30)
    .attr("id","time_p2_text")
    .text("Player2 State")
    .style('fill','black')
    .style('font-size', '1rem')
    .attr("stroke","black")
    .attr("stroke-width",0.3);



    function updateGraph(di_edges_list){
        let diEdgesData = {0:[],1:[],2:[]};
        for(let i=0;i<di_edges_list.length;i++){
            const edge = di_edges_list[i];
            const biEdge = di_edges_list.filter(edge_ => (edge_[1] == edge[0] && edge_[0] == edge[1] && edge[0] != edge[1]));
            if(edge[0]==edge[1]){
                //self loop
                diEdgesData[0].push(edge);
            }else if(biEdge.length>0){
                //p2 to p1 or p1 to p2 bidirectional
                if (edge[0] > edge[1]){
                    continue;
                }else{
                    diEdgesData[1].push(edge);
                    diEdgesData[1].push([edge[1],edge[0]]);
                } 
                
            }else{
                //p2 to p1 or p1 to p2 but no bidirectional edge
                diEdgesData[2].push(edge);   

            }
        }

        console.log("diEdgesData",diEdgesData);
        
        
        /* self loop links */

        // binding edge data
        let edges_objs0 = causal_g.selectAll(".edge_obj0")
                        .data(diEdgesData[0]);


        // remove old links
        edges_objs0.exit().remove();

        // enter new edges
        var edgeG_enter0 = edges_objs0.enter()
                                    .append("g")
                                    .attr("class", "edge_obj0");

        const radius = 20;

        let arrow_line0 = d3.arc()
        .innerRadius(radius)
        .outerRadius(radius)
        .startAngle(0)   // Starting angle in radians
        .endAngle(Math.PI * 1.9); // Ending angle in radians

        let arrow_line0_btm = d3.arc()
        .innerRadius(radius)
        .outerRadius(radius)
        .startAngle(Math.PI)   // Starting angle in radians
        .endAngle(Math.PI * 2.95); // Ending angle in radians

        // add circular edges
        edgeG_enter0.append("path")
                    .attr("class", "edge_path0")
                    .attr("d", (d)=>(d[0]<6?arrow_line0():arrow_line0_btm()))
                    .attr("transform", function(d){
                        if(d[0]<6){return 'translate('+(x_band_p1(nodes_p1[d[0]]) + rect_node_w/2)+','+(y(90)-radius)+')';//p1 nodes
                        }else{return 'translate('+(x_band_p2(nodes_p2[d[0]-6]) + rect_node_w/2)+','+(y(30)+radius+rect_node_h)+')';}//p2 nodes
                    })
                    .attr("stroke", "black")
                    .style("stroke-opacity", 1)
                    .attr("stroke-width","2px")
                    .style("fill","none")
                    .style("cursor", "default")
                    .attr("stroke-linecap", "round")
                    .attr('marker-end','url(#arrow_causal_lp)');


        edges_objs0 = edges_objs0.merge(edgeG_enter0);

        // update, position the g
        edges_objs0.select(".edge_path0")
                .attr("d",  (d)=>(d[0]<6?arrow_line0():arrow_line0_btm()))
                .attr("transform", function(d){
                    if(d[0]<6){return 'translate('+(x_band_p1(nodes_p1[d[0]]) + rect_node_w/2)+','+(y(90)-radius)+')';//p1 nodes
                    }else{return 'translate('+(x_band_p2(nodes_p2[d[0]-6]) + rect_node_w/2)+','+(y(30)+radius+rect_node_h)+')';}//p2 nodes
                })
                .attr('marker-end','url(#arrow_causal_lp)');

        
        /* bidirectional links */

        // binding edge data
        let edges_objs1 = causal_g.selectAll(".edge_obj1")
                        .data(diEdgesData[1]);


        // remove old links
        edges_objs1.exit().remove();

        // enter new edges
        var edgeG_enter1 = edges_objs1.enter()
                                    .append("g")
                                    .attr("class", "edge_obj1");

        function createPathData(d) {
            let start;
            let end;
            let direction;
            const curveHeight = 10;
            const curveWidth = 20;

            //p1-p2 bidirectional
            if(d[0]<6 && d[1]>=6){
                start = { x: (x_band_p1(nodes_p1[d[0]]) + rect_node_w/2), y: (y(90)+rect_node_h) };
                end = { x: (x_band_p2(nodes_p2[d[1]-6])+ rect_node_w/2), y: y(30) };
                direction = 1;
                if(d[1]==(d[0]+6)){
                    //bidirectional vertical
                    const controlX = start.x + curveWidth * direction;
                    const controlY = (start.y + end.y) / 2;
                    
                    return `M ${start.x} ${start.y} Q ${controlX} ${controlY}, ${end.x} ${end.y}`;
                }else{
                    //bidirectional other
                    const controlX1 = (start.x + end.x) / 2;
                    const controlX2 = (start.x + end.x) / 2;
                    const controlY1 = start.y + curveHeight * direction;
                    const controlY2 = start.y + curveHeight * direction;

                    return `M ${start.x} ${start.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${end.x} ${end.y}`;

                }
            }else if(d[0]>=6 && d[1]<6){
                start = { x: (x_band_p2(nodes_p2[d[0]-6])+ rect_node_w/2), y: y(30) };
                end = { x: (x_band_p1(nodes_p1[d[1]]) + rect_node_w/2), y: (y(90)+rect_node_h) };
                direction = -1;
                if(d[0]==(d[1]+6)){
                    //bidirectional vertical
                    const controlX = start.x + curveWidth * direction;
                    const controlY = (start.y + end.y) / 2;
                    
                    return `M ${start.x} ${start.y} Q ${controlX} ${controlY}, ${end.x} ${end.y}`;
                }else{
                    //bidirectional other
                    const controlX1 = (start.x + end.x) / 2;
                    const controlX2 = (start.x + end.x) / 2;
                    const controlY1 = start.y + curveHeight * direction;
                    const controlY2 = start.y + curveHeight * direction;

                    return `M ${start.x} ${start.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${end.x} ${end.y}`;
                }
            }else if(d[0]<6 && d[1]<6){
                //bidirectional horizontal top
                let sign = d[0]<d[1]?0:1;
                start = { x: (x_band_p1(nodes_p1[d[0]])+ rect_node_w/2), y: (y(90)+rect_node_h*sign) };
                end = { x: (x_band_p1(nodes_p1[d[1]]) + rect_node_w/2), y: (y(90)+rect_node_h*sign) };
                direction = d[0]<d[1]?-1:1;
                const controlX = (start.x + end.x) / 2;
                const controlY = start.y + curveHeight * direction;
                return `M ${start.x} ${start.y} Q ${controlX} ${controlY}, ${end.x} ${end.y}`;
            }else if(d[0]>=6 && d[1]>=6){
                //bidirectional horizontal bottom
                let sign = d[0]<d[1]?0:1;
                start = { x: (x_band_p2(nodes_p2[d[0]-6])+ rect_node_w/2), y: (y(30)+rect_node_h*sign) };
                end = { x: (x_band_p2(nodes_p2[d[1]-6]) + rect_node_w/2), y: (y(30)+rect_node_h*sign) };
                direction = d[0]<d[1]?-1:1;
                const controlX = (start.x + end.x) / 2;
                const controlY = start.y + curveHeight * direction;
                return `M ${start.x} ${start.y} Q ${controlX} ${controlY}, ${end.x} ${end.y}`;

            }

            // if(reverse){
            //     start = { x: (x_band_p2(nodes_p2[d[0]-6])+ rect_node_w/2), y: y(30) };
            //     end = { x: (x_band_p1(nodes_p1[d[1]]) + rect_node_w/2), y: (y(90)+rect_node_h) };
                

            // }else{
            //     start = { x: (x_band_p1(nodes_p1[d[0]]) + rect_node_w/2), y: (y(90)+rect_node_h) };
            //     end = { x: (x_band_p2(nodes_p2[d[1]-6])+ rect_node_w/2), y: y(30) };

            // }
            // const direction = reverse ? -1 : 1;
            // if(d[0]==(d[1]+6)||d[1]==(d[0]+6)){
            //     //bidirectional vertical
            //     const controlX = start.x + curveWidth * direction;
            //     const controlY = (start.y + end.y) / 2;
                
            //     return `M ${start.x} ${start.y} Q ${controlX} ${controlY}, ${end.x} ${end.y}`;
            // }else{
            //     //bidirectional other
            //     const controlX1 = (start.x + end.x) / 2;
            //     const controlX2 = (start.x + end.x) / 2;
            //     const controlY1 = start.y + curveHeight * direction;
            //     const controlY2 = start.y + curveHeight * direction;

            //     return `M ${start.x} ${start.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${end.x} ${end.y}`;
            // }
               
        }

        let arrow_line12 = function(d){
            return d3.line()([[(x_band_p1(nodes_p1[d[0]]) + rect_node_w/2), (y(90)+rect_node_h)], [(x_band_p2(nodes_p2[d[1]-6])+ rect_node_w/2), y(30)]]);
        }
        let arrow_line21 = function(d){
            return d3.line()([[(x_band_p2(nodes_p2[d[0]-6])+ rect_node_w/2), y(30)],[(x_band_p1(nodes_p1[d[1]]) + rect_node_w/2), (y(90)+rect_node_h)]]);
        }

        // // add directed edges
        // edgeG_enter1.append("path")
        //             .attr("class", "edge_path1")
        //             .attr('marker-end','url(#arrow_causal)')
        //             .attr("d", (d)=>((d[0]<6)?arrow_line12(d):arrow_line21(d)))
        //             .attr("stroke", "black")
        //             .style("stroke-opacity", 1)
        //             .attr("stroke-width","2px")
        //             .style("fill","none")
        //             .style("cursor", "default");



        edgeG_enter1.append("path")
        .attr("class", "edge_path1")
        .attr('marker-end','url(#arrow_causal)')
        .attr("d", (d)=>createPathData(d))
        .attr("stroke", "black")
        .style("stroke-opacity", 1)
        .attr("stroke-width","2px")
        .style("fill","none")
        .style("cursor", "default");


        edges_objs1 = edges_objs1.merge(edgeG_enter1);

        // // update, position the g
        // edges_objs1.select(".edge_path1")
        //             .attr("d", (d)=>((d[0]<6)?arrow_line12(d):arrow_line21(d)));


        edges_objs1.select(".edge_path1").attr("d", (d)=>createPathData(d));
        
         /* direct links */

         // binding edge data
        let edges_objs2 = causal_g.selectAll(".edge_obj2")
        .data(diEdgesData[2]);


        // remove old links
        edges_objs2.exit().remove();

        // enter new edges
        var edgeG_enter2 = edges_objs2.enter()
                            .append("g")
                            .attr("class", "edge_obj2");

        // let arrow_line2down = function(d){
        //     return d3.line()([[(x_band_p1(nodes_p1[d[0]]) + rect_node_w/2), (y(90)+rect_node_h)], [(x_band_p2(nodes_p2[d[1]-6])+ rect_node_w/2), y(30)]]);
        // }

        // let arrow_line2up = function(d){
        //     return d3.line()([[(x_band_p2(nodes_p2[d[0]-6])+ rect_node_w/2), y(30)],[(x_band_p1(nodes_p1[d[1]]) + rect_node_w/2), (y(90)+rect_node_h)]]);
        // }

        function pathData2(d) {
            let start;
            let end;
            const curveHeight = 30;

            if(d[0]<6 && d[1]<6){
                //horizontal top
                start = { x: (x_band_p1(nodes_p1[d[0]])+ rect_node_w/2), y: y(90)};
                end = { x: (x_band_p1(nodes_p1[d[1]]) + rect_node_w/2), y: y(90) };
                const controlX = (start.x + end.x)/2;
                const controlY = start.y + curveHeight * (-1);
                return `M ${start.x} ${start.y} Q ${controlX} ${controlY}, ${end.x} ${end.y}`;
            }else if(d[0]>=6 && d[1]>=6){
                //horizontal bottom
                start = { x: (x_band_p2(nodes_p2[d[0]-6])+ rect_node_w/2), y: (y(30)+rect_node_h) };
                end = { x: (x_band_p2(nodes_p2[d[1]-6]) + rect_node_w/2), y: (y(30)+rect_node_h) };
                const controlX = (start.x + end.x)/2;
                const controlY = start.y + curveHeight;
                return `M ${start.x} ${start.y} Q ${controlX} ${controlY}, ${end.x} ${end.y}`;

            }else if(d[0]<6 &&d[1]>=6){
                return d3.line()([[(x_band_p1(nodes_p1[d[0]]) + rect_node_w/2), (y(90)+rect_node_h)], [(x_band_p2(nodes_p2[d[1]-6])+ rect_node_w/2), y(30)]]);
            }else if(d[0]>=6 &&d[1]<6){
                return d3.line()([[(x_band_p2(nodes_p2[d[0]-6])+ rect_node_w/2), y(30)],[(x_band_p1(nodes_p1[d[1]]) + rect_node_w/2), (y(90)+rect_node_h)]]);
            }
        }

        // add directed edges
        edgeG_enter2.append("path")
            .attr("class", "edge_path2")
            .attr('marker-end','url(#arrow_causal)')
            .attr("d", (d)=>pathData2(d))
            .attr("stroke", "black")
            .style("stroke-opacity", 1)
            .attr("stroke-width","2px")
            .style("fill","none")
            .style("cursor", "default");


        edges_objs2 = edges_objs2.merge(edgeG_enter2);

        // update, position the g
        edges_objs2.select(".edge_path2")
        .attr("d", (d)=>pathData2(d));


    }

    function updateNumbers(data0){

        /* text p1 */
        let num_p1 = causal_g.selectAll(".num_p1")
                                .data(data0.slice(0,6));

        num_p1.enter().append("text")
        .attr("class", "num_p1")
        .text((d) =>d)
        .attr("x",(_,i)=>(x_band_p1(nodes_p1[i])+rect_node_w/2))
        .attr("y",(y(90)+rect_node_h*0.6 + 10))
        .attr("text-anchor",'middle')
        .style("font-size", "1.2rem") 
        .style("font-weight", "600") 
        .attr("font-family", "sans-serif")
        .style("fill","black");

        num_p1.attr("x",(_,i)=>(x_band_p1(nodes_p1[i])+rect_node_w/2))
        .attr("y",(y(90)+rect_node_h*0.6 + 10))
        .text((d) =>d);

        num_p1.exit().remove();

        /* text p2 */
        let num_p2 = causal_g.selectAll(".num_p2")
        .data(data0.slice(6));

        num_p2.enter().append("text")
        .attr("class", "num_p2")
        .text((d) =>d)
        .attr("x",(_,i)=>(x_band_p2(nodes_p2[i])+rect_node_w/2))
        .attr("y",(y(30)+rect_node_h*0.6 + 10))
        .attr("text-anchor",'middle')
        .style("font-size", "1.2rem") 
        .style("font-weight", "600") 
        .attr("font-family", "sans-serif")
        .style("fill","black");

        num_p2.attr("x",(_,i)=>(x_band_p2(nodes_p2[i])+rect_node_w/2))
        .attr("y",(y(30)+rect_node_h*0.6 + 10))
        .text((d) =>d);

        num_p2.exit().remove();


    }

    drawCausalGraphNew.updateGraph = updateGraph;
    drawCausalGraphNew.updateNumbers = updateNumbers;
    
}

