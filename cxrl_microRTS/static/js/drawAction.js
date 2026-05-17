function drawAction(valid_action){
    const dy = [-1, 0, 1, 0];
    const dx = [0, 1, 0, -1];
    const prd_type = ["Rs","Bs","Bk","Wk","Lt","Hv","Rg"];

    if(valid_action[1] == 0){
        // if noop
        console.log("next action for the unit is no operation");

    }else if(valid_action[1] == 1){
        // if move
        let row = Math.floor((valid_action[0])/16);
        let col = (valid_action[0])%16;
        let mv_param = valid_action[2];

        let target_row = row + dy[mv_param];
        let target_col = col + dx[mv_param];
        let y_pos0 = row * grid_side_len + 1 + grid_side_len/2;
        let x_pos0 = col * grid_side_len + 1 + grid_side_len/2;
        let y_pos1 = target_row * grid_side_len + 1 + grid_side_len/2;
        let x_pos1 = target_col * grid_side_len + 1 + grid_side_len/2;

        // remove move action if any
        d3.selectAll(".move_draw").filter(function(d){
            return( d.row == row) && (d.col==col);
        }).remove();
        // draw move action and bind the coordinate data of src unit for future cancel action
        let move_g = d3.select("#board_g")
                        .append("g")
                        .data([{row:row, col:col}])
                        .attr("class","move_draw");

        move_g.append("path")
            .attr("d","M"+(+x_pos0)+","+(+y_pos0)+"L"+(+x_pos1)+","+(+y_pos1)+"")
            .attr("stroke","#808080")
            .attr("stroke-width","1px");

    }else if(valid_action[1] == 2){
        // if harvest
        let row = Math.floor((valid_action[0])/16);
        let col = (valid_action[0])%16;
        let hrv_param = valid_action[3];

        let target_row = row + dy[hrv_param];
        let target_col = col + dx[hrv_param];
        let y_pos0 = row * grid_side_len + 1 + grid_side_len/2;
        let x_pos0 = col * grid_side_len + 1 + grid_side_len/2;
        let y_pos1 = target_row * grid_side_len + 1 + grid_side_len/2;
        let x_pos1 = target_col * grid_side_len + 1 + grid_side_len/2;

        // remove harvest action if any
        d3.selectAll(".harvest_draw").filter(function(d){
            return( d.row == row) && (d.col==col);
        }).remove();
        // draw harvest action and bind the coordinate data of src unit for future cancel action
        let harvest_g = d3.select("#board_g")
                        .append("g")
                        .data([{row:row, col:col}])
                        .attr("class","harvest_draw");


        harvest_g.append("path")
            .attr("d","M"+(+x_pos0)+","+(+y_pos0)+"L"+(+x_pos1)+","+(+y_pos1)+"")
            .attr("stroke","#00ff00")
            .attr("stroke-width","1px");

    }else if(valid_action[1] == 3){
        // if return
        let row = Math.floor((valid_action[0])/16);
        let col = (valid_action[0])%16;
        let rtrn_param = valid_action[4];

        let target_row = row + dy[rtrn_param];
        let target_col = col + dx[rtrn_param];
        let y_pos0 = row * grid_side_len + 1 + grid_side_len/2;
        let x_pos0 = col * grid_side_len + 1 + grid_side_len/2;
        let y_pos1 = target_row * grid_side_len + 1 + grid_side_len/2;
        let x_pos1 = target_col * grid_side_len + 1 + grid_side_len/2;

        // remove return action if any
        d3.selectAll(".return_draw").filter(function(d){
            return( d.row == row) && (d.col==col);
        }).remove();
        // draw return action and bind the coordinate data of src unit for future cancel action
        let return_g = d3.select("#board_g")
                        .append("g")
                        .data([{row:row, col:col}])
                        .attr("class","return_draw");


        return_g.append("path")
            .attr("d","M"+(+x_pos0)+","+(+y_pos0)+"L"+(+x_pos1)+","+(+y_pos1)+"")
            .attr("stroke","#00ff00")
            .attr("stroke-width","1px");

    }else if(valid_action[1] == 4){
        // if produce
        let row = Math.floor((valid_action[0])/16);
        let col = (valid_action[0])%16;
        let prdc_drct = valid_action[5];
        let prdc_tp = valid_action[6];

        let target_row = row + dy[prdc_drct];
        let target_col = col + dx[prdc_drct];
        let y_pos0 = row * grid_side_len + 1 + grid_side_len/2;
        let x_pos0 = col * grid_side_len + 1 + grid_side_len/2;
        let y_pos1 = target_row * grid_side_len + 1 + grid_side_len/2;
        let x_pos1 = target_col * grid_side_len + 1 + grid_side_len/2;

        // remove produce action if any
        d3.selectAll(".produce_draw").filter(function(d){
            return( d.row == row) && (d.col==col);
        }).remove();
        // draw produce action and bind the coordinate data of src unit for future cancel action
        let produce_g = d3.select("#board_g")
                        .append("g")
                        .data([{row:row, col:col}])
                        .attr("class","produce_draw");


        produce_g.append("path")
            .attr("d","M"+(+x_pos0)+","+(+y_pos0)+"L"+(+x_pos1)+","+(+y_pos1)+"")
            .attr("stroke","blue")
            .attr("stroke-width","1px");

        produce_g.append("text")
            .text(prd_type[prdc_tp])
            .attr('x', ((x_pos0 + x_pos1)/2) )
            .attr('y', ((y_pos0 + y_pos1)/2) )
            .attr("text-anchor",'middle')
            .attr("font-size", 12)
            .attr("font-family", "sans-serif")
            .style("fill","blue");

    }else if(valid_action[1] == 5){
        // if attack
        let row = Math.floor((valid_action[0])/16);
        let col = (valid_action[0])%16;
        let rela_atk_row = Math.floor((valid_action[7])/7) -3;
        let rela_atk_col = ((valid_action[7])%7) -3;
        let atk_row = rela_atk_row + row;
        let atk_col = rela_atk_col + col;
        let y_pos0 = row * grid_side_len + 1 + grid_side_len/2;
        let x_pos0 = col * grid_side_len + 1 + grid_side_len/2;
        let y_pos1 = atk_row * grid_side_len + 1 + grid_side_len/2;
        let x_pos1 = atk_col * grid_side_len + 1 + grid_side_len/2;
        console.log("row",row,"col",col);
        console.log("atk_row",atk_row,"atk_col",atk_col);

        // remove attack action if any
        d3.selectAll(".attack_draw").filter(function(d){
            return( d.row == row) && (d.col==col);
        }).remove();
        // draw attack action and bind the coordinate data of src unit for future cancel action
        let attack_g = d3.select("#board_g")
                        .append("g")
                        .data([{row:row, col:col}])
                        .attr("class","attack_draw");


        attack_g.append("path")
            .attr("d","M"+(+x_pos0)+","+(+y_pos0)+"L"+(+x_pos1)+","+(+y_pos1)+"")
            .attr("stroke","red")
            .attr("stroke-width","1px");

    }


}