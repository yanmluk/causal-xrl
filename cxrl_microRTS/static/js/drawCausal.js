function drawCausalGraph(){
    const nodes_t0 = ["#base1", "#barrack1", "#worker1", "#light1", "#heavy1", "#ranged1", "#base2", "#barrack2", "#worker2", "#light2", "#heavy2", "#ranged2"];
    const nodes_t1 = ["#base1", "#barrack1",  "#heavy1", "#light1", "#worker1", "#ranged1"];
    let causal_div = d3.select('#cs_graph').node().getBoundingClientRect();
    const causal_pan_margin = { top: 30, right: 50, bottom: 50, left: 50 },
    causal_pan_width  = causal_div.width - causal_pan_margin.left - causal_pan_margin.right,
    causal_pan_height = causal_div.height - causal_pan_margin.top  - causal_pan_margin.bottom;

    const rect_node_w = 90;
    const rect_node_h = 60;

    // Create the x and y scales
    let x_band_t0 = d3.scaleBand()
    .range([0, causal_pan_width])
    .domain(nodes_t0)
    .padding(0.2);

    let x_band_t1 = d3.scaleBand()
    .range([0, causal_pan_width])
    .domain(nodes_t1)
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


    /* node t0 */
    let node_objs_t0 = causal_g.selectAll(".node_obj_t0")
                                .data(nodes_t0);

    //enter new nodes
    let nodeG_t0 = node_objs_t0.enter()
                                .append("g")
                                .attr("class", "node_obj_t0");

    //enter rect
    nodeG_t0.append("rect")
    .attr("class", "node_t0")
    .attr("rx", 6)
    .attr("ry", 6)
    .attr("width", rect_node_w)
    .attr("height", rect_node_h);

    nodeG_t0.append("text")
    .attr("class", "node_label_t0")
    .text((d) =>d)
    .attr("x",rect_node_w/2)
    .attr("y",rect_node_h*0.3)
    .attr("text-anchor",'middle')
    .attr("font-size", 15)
    .attr("font-family", "sans-serif")
    .style("fill","black");


    node_objs_t0 = node_objs_t0.merge(nodeG_t0);


    // enter position of node g
    node_objs_t0.attr("transform",function(d) {
    return "translate(" + x_band_t0(d) + "," +  y(90) + ")"
    });

    /* node t1 */
    let node_objs_t1 = causal_g.selectAll(".node_obj_t1")
    .data(nodes_t1);

    //enter new nodes
    let nodeG_t1 = node_objs_t1.enter()
            .append("g")
            .attr("class", "node_obj_t1");

    //enter rect
    nodeG_t1.append("rect")
    .attr("class", "node_t1")
    .attr("rx", 6)
    .attr("ry", 6)
    .attr("width", rect_node_w)
    .attr("height", rect_node_h);

    nodeG_t1.append("text")
    .attr("class", "node_label_t1")
    .text((d) =>d)
    .attr("x",rect_node_w/2)
    .attr("y",rect_node_h*0.3)
    .attr("text-anchor",'middle')
    .attr("font-size", 15)
    .attr("font-family", "sans-serif")
    .style("fill","black");


    node_objs_t1 = node_objs_t1.merge(nodeG_t1);


    // enter position of node g
    node_objs_t1.attr("transform",function(d) {
    return "translate(" + x_band_t1(d) + "," +  y(30) + ")"
    });

    d3.select("#causal_svg").append('text')
    .attr('x', 10)
    .attr('y', causal_div.height * 0.1)
    .attr("id","time_t0_text")
    .text("States at Step t")
    .style('fill','black')
    .style('font-size', '1rem')
    .attr("stroke","black")
    .attr("stroke-width",0.3);

    d3.select("#causal_svg").append('text')
    .attr('x', 10)
    .attr('y', causal_div.height * 0.8 + 30)
    .attr("id","time_t1_text")
    .text("States at Step t+1")
    .style('fill','black')
    .style('font-size', '1rem')
    .attr("stroke","black")
    .attr("stroke-width",0.3);



    function updateGraph(di_edges_list){
        
        //exchange position between worker1 and heavy1
        let diedges_data=[];
        for(let i=0; i<di_edges_list.length; i++){
            if(di_edges_list[i][1]== 2){
                diedges_data.push([di_edges_list[i][0], 4]);
            }else if(di_edges_list[i][1]== 4){
                diedges_data.push([di_edges_list[i][0], 2]);
            }else{
                diedges_data.push(di_edges_list[i]);
            }
        }

        

         /* manage links */

        // binding edge data
        let edges_objs = causal_g.selectAll(".edge_obj")
                        .data(diedges_data);


        // remove old links
        edges_objs.exit().remove();

        // enter new edges
        var edgeG_enter = edges_objs.enter()
                                    .append("g")
                                    .attr("class", "edge_obj");

        let arrow_line = function(d){
            return d3.line()([[(x_band_t0(nodes_t0[d[0]]) + rect_node_w/2), (y(90)+rect_node_h)], [(x_band_t1(nodes_t1[d[1]])+ rect_node_w/2), y(30)]]);
        }

        // add directed edges
        var edge_path = edgeG_enter.append("path")
                    .attr("class", "edge_path")
                    .attr('marker-end','url(#arrow_causal)')
                    .attr("d", (d)=>arrow_line(d))
                    .attr("stroke", "black")
                    .style("stroke-opacity", 1)
                    .attr("stroke-width","2px")
                    .style("fill","none")
                    .style("cursor", "default");


        edges_objs = edges_objs.merge(edgeG_enter);

        // update, position the g
        edges_objs.select(".edge_path")
                .attr("d",  (d)=>arrow_line(d));


    }

    function updateNumbers(data0, data1){

        
        let diffIdxs = compareStates(data0.slice(0,6), data1);
        console.log("data0 data1", data0.slice(0,6), data1);
        console.log("diffIdxs", diffIdxs);
        if(diffIdxs.length>0){
            let diffIdxsNew = [];
            for(let i=0; i<diffIdxs.length; i++){
                if(diffIdxs[i]==2){
                    diffIdxsNew.push(4);
                }else if(diffIdxs[i]==4){
                    diffIdxsNew.push(2);
                }else{
                    diffIdxsNew.push(diffIdxs[i]);
                }
            }
            console.log("diffIdxsNew", diffIdxsNew);
            d3.selectAll(".node_t1").style("fill","none");

            d3.selectAll(".node_t1").filter((d,i)=>(diffIdxsNew.includes(i)))
            .style("fill","yellow")
            .style("opacity", 0.8);
        }else{
            d3.selectAll(".node_t1").style("fill","none");
        }


        //exchange position between worker1 and heavy1
        let data1_new = JSON.parse(JSON.stringify(data1));
        const tmp_val = data1_new[2];
        data1_new[2] = data1_new[4];
        data1_new[4] = tmp_val;


        /* text t0 */
        let num_t0 = causal_g.selectAll(".num_t0")
                                .data(data0);

        num_t0.enter().append("text")
        .attr("class", "num_t0")
        .text((d) =>d)
        .attr("x",(_,i)=>(x_band_t0(nodes_t0[i])+rect_node_w/2))
        .attr("y",(y(90)+rect_node_h*0.6 + 10))
        .attr("text-anchor",'middle')
        .style("font-size", "1.2rem") 
        .style("font-weight", "600") 
        .attr("font-family", "sans-serif")
        .style("fill","black");

        num_t0.attr("x",(_,i)=>(x_band_t0(nodes_t0[i])+rect_node_w/2))
        .attr("y",(y(90)+rect_node_h*0.6 + 10))
        .text((d) =>d);

        num_t0.exit().remove();

        /* text t1 */
        let num_t1 = causal_g.selectAll(".num_t1")
        .data(data1_new);

        num_t1.enter().append("text")
        .attr("class", "num_t1")
        .text((d) =>d)
        .attr("x",(_,i)=>(x_band_t1(nodes_t1[i])+rect_node_w/2))
        .attr("y",(y(30)+rect_node_h*0.6 + 10))
        .attr("text-anchor",'middle')
        .style("font-size", "1.2rem") 
        .style("font-weight", "600") 
        .attr("font-family", "sans-serif")
        .style("fill","black");

        num_t1.attr("x",(_,i)=>(x_band_t1(nodes_t1[i])+rect_node_w/2))
        .attr("y",(y(30)+rect_node_h*0.6 + 10))
        .text((d) =>d);

        num_t1.exit().remove();


    }

    drawCausalGraph.updateGraph = updateGraph;
    drawCausalGraph.updateNumbers = updateNumbers;
    
}

