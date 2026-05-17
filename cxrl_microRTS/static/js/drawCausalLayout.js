function drawCausalLayout(){
    // define some global consts
    const csgph_rect = d3.select("#cs_graph").node().getBoundingClientRect();
    const csgph_margin = { top: 30, right: 50, bottom: 50, left: 50 },
        csgph_width  = csgph_rect.width - csgph_margin.left - csgph_margin.right,
        csgph_height = csgph_rect.height - csgph_margin.top  - csgph_margin.bottom;
    
    const rect_node_w = 180, 
        rect_node_h = 60,
        radius = 20;

    //tooltip
    var tip = d3.select("#cs_graph").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    let cs_svg = d3.select("#cs_graph")
                  .append("svg")
                  .attr("id","csgraph_svg")
                  .attr("width",  csgph_width  + csgph_margin.left + csgph_margin.right)
                  .attr("height", csgph_height + csgph_margin.top  + csgph_margin.bottom);
                  
    let causal_g = cs_svg.append("g")
                        .attr("transform", "translate(" + 30 + "," + csgph_margin.top + ")")
                        .attr("id","causal_g");

    var cs_x = d3.scaleLinear().range([0, csgph_width]).domain([0, 1]);
    var cs_y = d3.scaleLinear().range([csgph_height, 0]).domain([0, 1]);
    var cs_y_ = d3.scaleLinear().range([0, csgph_height]).domain([0, 1]);

    /* arrow head svgs */
    const markerColor = {'r': 'red', 'g':'green','blk':'black','trsp':'white', 'gry':'gray'};
    for(let clr of Object.keys(markerColor)){
        var arrHeads = cs_svg.selectAll(".arr_" + clr).data([0,1,2]);
    
        arrHeads.enter()
        .append('svg:defs')
        .attr("class", "arr_"+ clr)
        .append('svg:marker')
        .attr('id', (d)=>('end_arrow'+ clr +d.toString()))
        .attr('viewBox', '0 -5 10 10')
        .attr("refX", 10)
        .attr("refY", 0)
        .attr('markerWidth', (d)=>(d*3+10))
        .attr('markerHeight', (d)=>(d*3+10)) 
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .style("fill", markerColor[clr])
        .attr("opacity", ()=>(clr=='trsp'?0:1));

    }

    function updateGraph(){
        console.log("nodes_set",nodes_set);
        console.log("edges_set",edges_set);
        console.log("effect_set",effect_set);
        console.log("current_state_set",current_state_set);

        /* manage links */
        // binding edge data
        let edges_objs = causal_g.selectAll(".edge_obj")
                        .data(edges_set);

        // remove old links
        edges_objs.exit().remove();

        // enter new edges
        let edgeG_enter = edges_objs.enter()
                                    .append("g")
                                    .attr("class", "edge_obj");
        
        let edgePath = function(d){
            
            if(d.source.id==d.target.id){
                //self loop
                let start = { x: cs_x(+d.source.x), y: cs_y(+d.source.y) };
                let end = { x: (cs_x(+d.source.x)+rect_node_w), y: cs_y(+d.source.y) };
                const curveHeight = 40;
                const controlX = (start.x + end.x) / 2
                const controlY = start.y + curveHeight * (-1)
                
                return `M ${start.x} ${start.y} Q ${controlX} ${controlY}, ${end.x} ${end.y}`;

            }else{
                if(d.bidirectional !=0){

                    let link = d3.linkHorizontal();
                    return link({source: [cs_x(+d.source.x)+(rect_node_w/2)*(1+0.1*(d.bidirectional)),  cs_y(+d.source.y)+(rect_node_h/2)*(1+0.1*(d.bidirectional))], target: [cs_x(+d.target.x)+(rect_node_w/2)*(1+0.1*(d.bidirectional)),  cs_y(+d.target.y)+(rect_node_h/2)*(1+0.1*(d.bidirectional))]});


                }else{

                    let link = d3.linkHorizontal();
                    return link({source: [cs_x(+d.source.x)+(rect_node_w/2),  cs_y(+d.source.y)+(rect_node_h/2)], target: [cs_x(+d.target.x)+(rect_node_w/2),  cs_y(+d.target.y)+(rect_node_h/2)]});


                }

            }

        }

        let pathTransform = function(d){
            return 'translate(0,0)';
        }


        
        let arrowPath = function(d){
                const is_circle = false;
                if(d.source.id==d.target.id){
                    //self loop
                    if(is_circle){
                        let selfLink = d3.arc()
                        .innerRadius(radius)
                        .outerRadius(radius)
                        .startAngle(0)   // Starting angle in radians
                        .endAngle(Math.PI * 1.9); // Ending angle in radians

                        return selfLink(d);
                    }else{
                        const curveHeight = 20;
                        let start = { x: cs_x(+d.source.x), y: (cs_y(+d.source.y) - curveHeight) };
                        let end = { x: (cs_x(+d.source.x)+rect_node_w/2), y: (cs_y(+d.source.y)- curveHeight) };
                        
                        return `M ${start.x}, ${start.y} L ${end.x}, ${end.y}`;

                    }

                }else{
                    if(d.bidirectional !=0){
                        //enter bidirectional curve
                        return "M" + (this.previousSibling).getPointAtLength((this.previousSibling).getTotalLength()/2 -1).x + "," + (this.previousSibling).getPointAtLength((this.previousSibling).getTotalLength()/2 -1).y
                        + "L" + (cs_x((d.target.x + d.source.x)/2) + (rect_node_w/2)*(1+0.1*(d.bidirectional)))+ "," + (cs_y((d.target.y + d.source.y)/2)+(rect_node_h/2)*(1+0.1*(d.bidirectional)))+"";
    
                    }else{
                    return "M" + (this.previousSibling).getPointAtLength((this.previousSibling).getTotalLength()/2 -1).x + "," + (this.previousSibling).getPointAtLength((this.previousSibling).getTotalLength()/2 -1).y
                 + "L" + (cs_x((d.target.x + d.source.x)/2) + rect_node_w/2)+ "," + (cs_y((d.target.y + d.source.y)/2)+rect_node_h/2)+"";
                    }
                }
                
        }
            
        edgeG_enter.append("path")
                    .attr("class", "edge_path")
                    .attr("d", edgePath)
                    .attr("transform", pathTransform)
                    .attr("stroke", beta2Color)
                    .style("stroke-opacity", beta2Opacity)
                    .attr("stroke-width",beta2Width)
                    .style("fill","none")
                    .style("cursor", "default");

        
        edgeG_enter.append("path")
                    .attr("class", "edge_arrow")
                    .attr('marker-end',beta2Arrow)
                    .attr("d", arrowPath)
                    .attr("transform", pathTransform)
                    .style("fill","none")
                    .style("cursor", "default");

        edges_objs = edges_objs.merge(edgeG_enter);

        //update edges
        edges_objs.select(".edge_path")
                .attr("d", edgePath)
                .attr("transform", pathTransform)
                .attr("stroke", beta2Color)
                .attr("stroke-width",beta2Width)
                .style("stroke-opacity", beta2Opacity);

        edges_objs.select(".edge_arrow")
                .attr('marker-end',beta2Arrow)
                .attr("d", arrowPath)
                .attr("transform", pathTransform);
            
        edges_objs.on("mouseover", edgeMouseover)
        .on("mouseout",function(){tip.style("opacity", 0);});


         /* manage nodes */
        // binding node data
        let node_objs = causal_g.selectAll(".node_obj")
                                .data(nodes_set);

        // remove old nodes
        node_objs.exit().remove();


        //enter new nodes
        let nodeG_enter = node_objs.enter()
                    .append("g")
                    .attr("class", "node_obj");

        //enter ellipse
        nodeG_enter.append("rect")
        .attr("class", "node")
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("width", rect_node_w)
        .attr("height", rect_node_h)
        .style("fill",nodeColor);

        nodeG_enter.append("text")
        .attr("class", "node_label")
        .text(reformatNodeName)
        .attr("x",rect_node_w/2)
        .attr("y",rect_node_h*0.3)
        .attr("text-anchor",'middle')
        .attr("font-size", 15)
        .attr("font-family", "sans-serif")
        .style("fill","black");

        nodeG_enter.append("text")
        .attr("class", "node_state_lb")
        .text((d)=>(current_state_set==undefined?"":current_state_set[d.id].toString()))
        .attr("x",rect_node_w/2)
        .attr("y",rect_node_h*0.6 +10)
        .attr("text-anchor",'middle')
        .style("font-size", "1.2rem") 
        .style("font-weight", "600") 
        .attr("font-family", "sans-serif")
        .style("fill","black");

        node_objs = node_objs.merge(nodeG_enter);


        // nodes update
        node_objs.attr("transform",function(d) {
        return "translate(" + cs_x(+d.x) + "," +  cs_y(+d.y) + ")"
        })
        .call(d3.drag()
        .subject(function(d) { 
        return {x: cs_x(+d.x), y: cs_y(+d.y)};
        })
        .on("drag", dragged));

        node_objs.select(".node_label").text(reformatNodeName);
        node_objs.select(".node_state_lb").text((d)=>(current_state_set==undefined?"":current_state_set[d.id].toString()));

        node_objs.select(".node").style("fill",nodeColor);


        // make nodes on top of edges
        node_objs.raise();


    }
    
    /* helper functions */

    //delete graph
    function delGraph(){
        nodes_set = [];
        edges_set = [];
        effect_set = [];

        updateGraph();
    
    };
    

    //drag nodes
    function dragged() {
        nodes_set.find(d => d.id == d3.select(this).data()[0].id).x = cs_x.invert(d3.event.x);
        nodes_set.find(d => d.id == d3.select(this).data()[0].id).y = cs_y.invert(d3.event.y);
        updateGraph();
    };


    //convert Coef. to edge width
    function beta2Width(d){
        const matched_edge = (e) => (e.source == d.source.id) && (e.target == d.target.id);
        const idx = effect_set.findIndex(matched_edge);
        let width_str;
        if(idx == -1){
            //no matching edge
            console.log("no matched edge");
        }else{
            let abs_strength = Math.abs(+effect_set[idx].effect);
            let width = abs_strength * 5 + 3;
            width_str = width.toString() + "px";
        }

        return width_str;
    };


    //convert Coef. to arrow width
    function beta2Arrow(d){
        const matched_edge = (e) => (e.source == d.source.id) && (e.target == d.target.id);
        const idx = effect_set.findIndex(matched_edge);
        let end_arrow;
        let arrowSizeId;
        const threshold0 = 0.5
        const threshold1 = 1

        let abs_strength = Math.abs(+effect_set[idx].effect);

        if(0<=abs_strength && abs_strength<threshold0){
            arrowSizeId = 0;
        }else if(threshold0<=abs_strength && abs_strength<threshold1){
            arrowSizeId = 1;
        }else if(threshold1<=abs_strength){
            arrowSizeId = 2;
        }
        // end arrow (regardless of selected edge)
        // (idx==-1)? console.log("no matched edge") : end_arrow = (effect_set[idx].effect>=0?'url(#end_arrowg'+arrowSizeId.toString()+')':'url(#end_arrowr'+arrowSizeId.toString()+')');
        
        if(idx==-1){
            console.log("no matched edge");
        }else{
            if(effect_set[idx].effect>0){
                end_arrow = 'url(#end_arrowg'+arrowSizeId.toString()+')';
            }else if(effect_set[idx].effect<0){
                end_arrow = 'url(#end_arrowr'+arrowSizeId.toString()+')';
            }else{
                end_arrow = 'url(#end_arrowgry0)';
            }
        }

        // if(abs_strength==0){end_arrow='url(#end_arrowtrsp2)'}
        return end_arrow;
    };


    //convert Coef. to edge/arrow color
    function beta2Color(d){
        const matched_edge = (e) => (e.source == d.source.id) && (e.target == d.target.id);
        const idx = effect_set.findIndex(matched_edge);
        let edge_color;
        if(idx==-1){
            console.log("no matched edge");
        }else{
            if(effect_set[idx].effect>0){
                edge_color = "green";
            }else if(effect_set[idx].effect<0){
                edge_color = "red";
            }else{
                edge_color = "gray"
            }
        }

        return edge_color;
    };
    //manage edge/arrow opacity
    function beta2Opacity(d){
        const matched_edge = (e) => (e.source == d.source.id) && (e.target == d.target.id);
        const idx = effect_set.findIndex(matched_edge);
        let edge_opacity;
        // (idx==-1)? console.log("no matched edge") : edge_opacity = (effect_set[idx].effect==0?0:0.5);

        edge_opacity = 0.5;


        return edge_opacity;

    }


    //edge mouseover tooltip
    function edgeMouseover(d){
        const matched_edge = (e) => (e.source == d.source.id) && (e.target == d.target.id);
        const idx = effect_set.findIndex(matched_edge);
        if(idx == -1){
            //no matching edge
            tip.style("opacity", 0);
            console.log("edge mouseover no matching edge!")
        }else{
            tip.style("opacity", 1)
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .html("Edge effect: " + (effect_set[idx].effect.toFixed(3)).toString())
            .style("left", (d3.event.pageX-70) + "px")
            .style("top", (d3.event.pageY-50) + "px");
        }

    }

    //manage node color
    function nodeColor(d){

        const playerID = +(d.name).slice(-1);

        // return playerID<2? "#e0f9e5": "#f0e1f1"
        return playerID<2? "#cdcdff": "#ffcdcd"

    }


    //manage node name
    function reformatNodeName(d){
        const orgName = d.name;
        const playerID = +orgName.slice(-1);
        const unitNameP1 = "Num Ally "+ orgName.charAt(0).toUpperCase()+orgName.slice(1,-1);
        const unitNameP2 = "Num Enemy "+ orgName.charAt(0).toUpperCase()+orgName.slice(1,-1);

        return playerID<2? unitNameP1: unitNameP2

    }


    drawCausalLayout.updateGraph = updateGraph;
    drawCausalLayout.delGraph = delGraph;
}



function genCsGraph(nodes_data, edges_data, effect_data, current_state_data){

    // clear former svg
    drawCausalLayout.delGraph(true);
    //nodes_set corresponds with nodes on the graph
    nodes_set = deep_copy(nodes_data);

    console.assert(edges_data.length == effect_data.length, "edges data and effect data size not matched!");

    let Edges_tmp = [];
    edges_data.forEach(function(e, i){
        const biEdge = edges_data.filter(edge => (edge[1] == e[0] && edge[0] == e[1] && e[0] != e[1]));
        let biEdgeFlag;
        if(biEdge.length>0){
            biEdgeFlag = e[0]>e[1]?1:-1;
        }else{
            biEdgeFlag=0;
        }
        Edges_tmp[i] = {source: nodes_set.filter(function(n){return n.id == e[0];})[0],
                target: nodes_set.filter(function(n){return n.id == e[1];})[0],
                bidirectional:biEdgeFlag};
    });

    let Effect_tmp = [];
    edges_data.forEach(function(e, i){
        Effect_tmp[i] = {source: e[0], target: e[1], effect: effect_data[i]};
    });

    current_state_set = current_state_data;


    edges_set = Edges_tmp;
    effect_set = Effect_tmp;
    console.log("gengraph edges_set",edges_set);
    console.log("gengraph effect_set",effect_set);
    

    drawCausalLayout.updateGraph();
};
