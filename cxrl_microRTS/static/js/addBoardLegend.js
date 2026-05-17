function addBoardLegend(draw_flag){
    d3.select("#board_svg").selectAll(".sqr_unit_rect").remove();
    d3.select("#board_svg").selectAll(".sqr_unit_text").remove();
    d3.select("#board_svg").selectAll(".round_unit_circle").remove();
    d3.select("#board_svg").selectAll(".round_unit_text").remove();
    d3.select("#board_svg").selectAll(".act_lgd_line").remove();
    d3.select("#board_svg").selectAll(".act_lgd_lb").remove();

    /* add unit type legend */
    const unit_type_labels1 = ["Resource", "Base", "Barrack"];
    const unit_colors1 = ["#00ff00", "#c0c0c0", "#808080"];
    const unit_type_labels2 = ["Worker", "Light", "Ranged", "Heavy"];
    const unit_colors2 = ["#808080", "#ffc800", "#00ffff","#ffff00"];

    const sqr_unit_size = 35;
    const round_unit_r1 = 17;
    const round_unit_r0 = 14;

if(draw_flag){


    d3.select("#board_svg").selectAll(".sqr_unit_rect")
        .data(unit_type_labels1)
        .enter()
        .append("rect")
        .attr("class","sqr_unit_rect")
        .attr("x", 0.1*(boardRect.width))
        .attr("y", function(_,i){ return (i*(sqr_unit_size+5) + 0.6*(boardRect.height) +70)})
        .attr("width", sqr_unit_size)
        .attr("height", sqr_unit_size)
        .style("fill", function(_,i){ return unit_colors1[i]})
        .attr("stroke", "black")
        .attr("stroke-width", 1.5);

    d3.select("#board_svg").selectAll(".sqr_unit_text")
        .data(unit_type_labels1)
        .enter()
        .append("text")
            .attr("class", "sqr_unit_text")
            .attr("x", 0.1*(boardRect.width) + 20 + sqr_unit_size*1.1)
            .attr("y", function(_,i){ return (i*(sqr_unit_size+5) + (sqr_unit_size/2) + 0.6*(boardRect.height) +70)})
            .style("fill", "black")
            .style("stroke", "black")
            .style("stroke-width", 0.3)
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");


    d3.select("#board_svg").selectAll(".round_unit_circle")
            .data(unit_type_labels2)
            .enter()
            .append("circle")
            .attr("class","round_unit_circle")
            .attr("cx", function(_,i){ return (0.1*(boardRect.width) + sqr_unit_size/2)})
            .attr("cy", function(_,i){ return i<3?(i*(sqr_unit_size+5) + 0.4*(boardRect.height)+ round_unit_r0 +60) : (i*(sqr_unit_size+5) + 0.4*(boardRect.height)+round_unit_r1 +60)})
            .attr('r', (_,i)=>(i<3?round_unit_r0:round_unit_r1))
            .style("fill", function(_,i){ return unit_colors2[i]})
            .attr("stroke", "black")
            .attr("stroke-width", 1.5);
        
    d3.select("#board_svg").selectAll(".round_unit_text")
            .data(unit_type_labels2)
            .enter()
            .append("text")
                .attr("class", "round_unit_text")
                .attr("x", 0.1*(boardRect.width) + 20 + sqr_unit_size*1.1)
                .attr("y", function(_,i){ return (i*(sqr_unit_size+5) + (sqr_unit_size/2) + 0.4*(boardRect.height) +60)})
                .style("fill", "black")
                .style("stroke", "black")
                .style("stroke-width", 0.3)
                .text(function(d){ return d})
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle");

    /* add action type legend */
    let action_edge_classes = ["move", "harvest", "return", "produce", "attack"];

    let action_edge_color = ["#808080", "#00ff00", "#00ff00", "blue", "red"];

    // Add one dot in the legend for each name.
    const line_size = 30
    d3.select("#board_svg").selectAll(".act_lgd_line")
    .data(action_edge_classes)
    .enter()
    .append("line")
        .attr("class","act_lgd_line")
        .attr("x1", 20)
        .attr("y1", function(_,i){ return 0.6*(boardRect.height)  + i*(line_size+5)})
        .attr("x2", 20 + line_size)
        .attr("y2", function(_,i){ return 0.6*(boardRect.height)  + i*(line_size+5)})
        .attr("opacity", 1)
        .attr("stroke", function(_,i){ return action_edge_color[i]})
        .attr("stroke-width", "2px");
    
        


    // Add one dot in the legend for each name.
    d3.select("#board_svg").selectAll(".act_lgd_lb")
    .data(action_edge_classes)
    .enter()
    .append("text")
        .attr("class", "act_lgd_lb")
        .attr("x", 20 + line_size*1.2)
        .attr("y", function(_,i){ return 0.6*(boardRect.height)-10 + i*(line_size+5) + (line_size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", "black")
        .style("stroke", "black")
        .style("stroke-width", 0.3)
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");
    }
}