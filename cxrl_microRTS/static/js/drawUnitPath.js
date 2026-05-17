function drawUnitPath(unitpos_log, color_method, path_opacity, domain_ub){
    const uniStepColorScale = d3.scaleSequential()
                    .domain([domain_ub, 0])
                    .interpolator(d3.interpolateViridis);

    const pathStepColorScale = d3.scaleSequential()
                    .domain([unitpos_log.length, 0])
                    .interpolator(d3.interpolateViridis);

    for(let i=0; i<(unitpos_log.length-1); i++){

        // src position
        let unit_row0 = +unitpos_log[i][0];
        let unit_col0 = +unitpos_log[i][1];
        //target position
        let unit_row1 = +unitpos_log[i+1][0];
        let unit_col1 = +unitpos_log[i+1][1];

        let y0 = 1 + grid_side_len * unit_row0;
        let x0 = 1 + grid_side_len * unit_col0;
        let y1 = 1 + grid_side_len * unit_row1;
        let x1 = 1 + grid_side_len * unit_col1;

        let selected_side = grid_side_len;

        // draw trace
        let trace_g = d3.select("#board_g")
                        .append("g")
                        .attr("class","unit_trace_draw");

        trace_g.append("path")
            .attr("d","M"+(+x0 + (+selected_side)/2)+","+(+y0 + (+selected_side)/2)+"L"+(+x1 + (+selected_side)/2)+","+(+y1 + (+selected_side)/2)+"")
            .attr("stroke",function(){
                if(color_method==0){
                    return "#fab907";
                }else if(color_method==1){
                    return uniStepColorScale(i);
                }else{
                    return pathStepColorScale(i);
                }
            })
            .attr("stroke-width","3px")
            .attr("stroke-opacity", path_opacity);

    }

}


function drawUnitPaths(eval_unitpos_log, color_method, path_opacity, domain_ub){

    for(const prop in eval_unitpos_log){
        drawUnitPath(eval_unitpos_log[prop], color_method, path_opacity, domain_ub);
    }

}


