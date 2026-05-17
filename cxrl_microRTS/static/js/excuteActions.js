function excuteActions(valid_actions, rows_num, cols_num){
    let uht, urt, uot, utt, uat;
    // uht, urt, uot, utt, uat = front_get_obs(rows_num, cols_num);
    let board_state = front_get_obs(rows_num, cols_num);
    let player_urt_mat = front_get_player_urtmat(rows_num, cols_num);
    uht = board_state[0],
    urt = board_state[1], 
    uot = board_state[2], 
    utt = board_state[3],
    uat = board_state[4]; 

    for(let i=0;i<valid_actions.length;i++){
        const row = Math.floor((valid_actions[i][0])/16);
        const col = (valid_actions[i][0])%16;
        const act_tp = valid_actions[i][1];
        const mv_drct = valid_actions[i][2];
        const hrv_drct = valid_actions[i][3];
        const rtn_drct = valid_actions[i][4];
        const prdc_drct = valid_actions[i][5];
        const prdc_tp = valid_actions[i][6];
        const atk_rela_loc = valid_actions[i][7];

        switch(act_tp){
            case 0:
                // noop
                break;
            case 1:
                //move
                uht, urt, uot, utt, uat = excuteMove(row, col, mv_drct, uht, urt, uot, utt, uat);
                break;
            case 2:
                //harvest
                urt = excuteHarvest(row, col, hrv_drct, urt);
                break;
            case 3:
                //return
                urt, player_urt_mat = excuteReturn(row, col, rtn_drct, urt, player_urt_mat);
                break;
            case 4:
                //produce
                uht, urt, uot, utt, uat = excuteProduce(row, col, prdc_drct, prdc_tp, uht, urt, uot, utt, uat);
                break;
            case 5:
                uht, urt, uot, utt, uat = excuteAttack(row, col, atk_rela_loc, uht, urt, uot, utt, uat);
                break;
        }
        genBoard(uht, urt, uot, utt, uat, player_urt_mat);
        
    }

}


function removeUnit(row, col){
    // remove base
    d3.selectAll(".base").filter(function(d){
        return (d.row == row) && (d.col==col);
    }).remove();
    // remove worker
    d3.selectAll(".worker").filter(function(d){
        return (d.row == row) && (d.col==col);
    }).remove();
    // remove barrack
    d3.selectAll(".barrack").filter(function(d){
        return (d.row == row) && (d.col==col);
    }).remove();
    // remove light
    d3.selectAll(".light").filter(function(d){
        return (d.row == row) && (d.col==col);
    }).remove();
    // remove heavy
    d3.selectAll(".heavy").filter(function(d){
        return (d.row == row) && (d.col==col);
    }).remove();
    // remove ranged
    d3.selectAll(".ranged").filter(function(d){
        return (d.row == row) && (d.col==col);
    }).remove();
    // remove resource
    d3.selectAll(".resource").filter(function(d){
        return (d.row == row) && (d.col==col);
    }).remove();

    // remove current action
    unit_cancel_action(row, col);


}


function move_update_unit_tables(uht, urt, uot, utt, uat, old_row, old_col, new_row, new_col){
    let u_hp = uht[old_row][old_col];
    uht[old_row][old_col] = 0;
    uht[new_row][new_col] = u_hp;

    let u_rsc= urt[old_row][old_col];
    urt[old_row][old_col] = 0;
    urt[new_row][new_col] = u_rsc;

    let u_own = uot[old_row][old_col];
    uot[old_row][old_col] = 0;
    uot[new_row][new_col] = u_own;

    let u_type = utt[old_row][old_col];
    utt[old_row][old_col] = 0;
    utt[new_row][new_col] = u_type;

    let u_act = uat[old_row][old_col];
    uat[old_row][old_col] = 0;
    uat[new_row][new_col] = u_act;

    return uht, urt, uot, utt, uat;
}


function harvest_update_unit_tables(urt, row, col, target_row, target_col){
    urt[row][col] += 1;
    urt[target_row][target_col] -= 1;
    return urt;
}


function return_update_unit_tables(urt, player_urt_mat, row, col, target_row, target_col){
    urt[row][col] -= 1;
    player_urt_mat[target_row][target_col] += 1;
    return urt, player_urt_mat;
}


function produce_update_unit_tables(uht, urt, uot, utt, uat, prdc_tp, tgt_row, tgt_col){
    switch(prdc_tp){
        case 0:
            // resource
            uht[tgt_row][tgt_col] = 1
            urt[tgt_row][tgt_col] = 25
            utt[tgt_row][tgt_col] = 1
            break;
        case 1:
            //base
            uht[tgt_row][tgt_col] = 10
            urt[tgt_row][tgt_col] = 5
            uot[tgt_row][tgt_col] = 1
            utt[tgt_row][tgt_col] = 2
            break;
        case 2:
            //barrack
            uht[tgt_row][tgt_col] = 4
            uot[tgt_row][tgt_col] = 1
            utt[tgt_row][tgt_col] = 3
            break;
        case 3:
            //worker
            uht[tgt_row][tgt_col] = 1
            uot[tgt_row][tgt_col] = 1
            utt[tgt_row][tgt_col] = 4
            break;
        case 4:
            //light
            uht[tgt_row][tgt_col] = 4
            uot[tgt_row][tgt_col] = 1
            utt[tgt_row][tgt_col] = 5
            break;
        case 5:
            //heavy
            uht[tgt_row][tgt_col] = 4
            uot[tgt_row][tgt_col] = 1
            utt[tgt_row][tgt_col] = 6
            break;
        case 6:
            //ranged
            uht[tgt_row][tgt_col] = 1
            uot[tgt_row][tgt_col] = 1
            utt[tgt_row][tgt_col] = 7
            break;
    }

    return uht, urt, uot, utt, uat;
}


function attack_update_unit_tables(uht, urt, uot, utt, uat, tgt_row, tgt_col){
    uht[tgt_row][tgt_col] = 0;
    urt[tgt_row][tgt_col] = 0;
    uot[tgt_row][tgt_col] = 0;
    utt[tgt_row][tgt_col] = 0;
    uat[tgt_row][tgt_col] = 0;

    return uht, urt, uot, utt, uat;
}



function excuteMove(row, col, move_param, uht, urt, uot, utt, uat){

    switch(move_param){
        case 0:
            //north
            uht, urt, uot, utt, uat = move_update_unit_tables(uht, urt, uot, utt, uat, row, col, row-1, col);
            break;
        case 1:
            // east
            uht, urt, uot, utt, uat = move_update_unit_tables(uht, urt, uot, utt, uat, row, col, row, col+1);
            break;
        case 2:
            // south
            uht, urt, uot, utt, uat = move_update_unit_tables(uht, urt, uot, utt, uat, row, col, row+1, col);
            break;
        case 3:
            // west
            uht, urt, uot, utt, uat = move_update_unit_tables(uht, urt, uot, utt, uat, row, col, row, col-1);
            break;
    }

    return uht, urt, uot, utt, uat;
}

function excuteHarvest(row, col, hrv_param, urt){
    switch(hrv_param){
        case 0:
            //north
            urt = harvest_update_unit_tables(urt, row, col, row-1, col);
            break;
        case 1:
            // east
            urt = harvest_update_unit_tables(urt, row, col, row, col+1);
            break;
        case 2:
            // south
            urt = harvest_update_unit_tables(urt, row, col, row+1, col);
            break;
        case 3:
            // west
            urt = harvest_update_unit_tables(urt, row, col, row, col-1);
            break;
    }

    return urt;

}

function excuteReturn(row, col, rtrn_param, urt, player_urt_mat){
    switch(rtrn_param){
        case 0:
            //north
            urt, player_urt_mat = return_update_unit_tables(urt, player_urt_mat, row, col, row-1, col);
            break;
        case 1:
            // east
            urt, player_urt_mat = return_update_unit_tables(urt, player_urt_mat, row, col, row, col+1);
            break;
        case 2:
            // south
            urt, player_urt_mat = return_update_unit_tables(urt, player_urt_mat, row, col, row+1, col);
            break;
        case 3:
            // west
            urt, player_urt_mat = return_update_unit_tables(urt, player_urt_mat, row, col, row, col-1);
            break;
    }
    return urt, player_urt_mat;

}

function excuteProduce(row, col, prdc_drct, prdc_tp, uht, urt, uot, utt, uat){
    switch(prdc_drct){
        case 0:
            //north
            uht, urt, uot, utt, uat = produce_update_unit_tables(uht, urt, uot, utt, uat, prdc_tp, row-1, col);
            break;
        case 1:
            // east
            uht, urt, uot, utt, uat = produce_update_unit_tables(uht, urt, uot, utt, uat, prdc_tp, row, col+1);
            break;
        case 2:
            // south
            uht, urt, uot, utt, uat = produce_update_unit_tables(uht, urt, uot, utt, uat, prdc_tp, row+1, col);
            break;
        case 3:
            // west
            uht, urt, uot, utt, uat = produce_update_unit_tables(uht, urt, uot, utt, uat, prdc_tp, row, col-1);
            break;
    }

    return uht, urt, uot, utt, uat;
}


function excuteAttack(row, col, atk_rela_loc, uht, urt, uot, utt, uat){

    const atk_row = parseInt(Math.floor(atk_rela_loc/7) -3 + row);
    const atk_col = parseInt(atk_rela_loc % 7 -3 +col);

    uht, urt, uot, utt, uat = attack_update_unit_tables(uht, urt, uot, utt, uat, atk_row, atk_col);

    return uht, urt, uot, utt, uat;
}


function removeBoard(){
    /* remove any existing unit on board */

    // remove base
    d3.selectAll(".base").remove();
    // remove worker
    d3.selectAll(".worker").remove();
    // remove barrack
    d3.selectAll(".barrack").remove();
    // remove light
    d3.selectAll(".light").remove();
    // remove heavy
    d3.selectAll(".heavy").remove();
    // remove ranged
    d3.selectAll(".ranged").remove();
    // remove resource
    d3.selectAll(".resource").remove(); 

    /* cancel any exisiting current action on board */

    // remove produce action of all units
    d3.selectAll(".produce_draw").remove();
    // remove harvest action of all units
    d3.selectAll(".harvest_draw").remove();
    // remove return action of all units
    d3.selectAll(".return_draw").remove();
    // remove attack action of all units
    d3.selectAll(".attack_draw").remove();
    // remove move action of all units
    d3.selectAll(".move_draw").remove();
}


function genBoard(uht, urt, uot, utt, uat, player_urt_mat){
    // remove all units and actions on board
    removeBoard();
    // add units
    for(let row_=0; row_<rows_num; row_++){
        for(let col_=0; col_<cols_num; col_++){
            switch(utt[row_][col_]){
                case 1:
                    // resource
                    addResource(row_, col_, urt[row_][col_]);
                    break;
                case 2:
                    //base
                    addBase(row_, col_, uot[row_][col_], player_urt_mat[row_][col_]);
                    break;
                case 3:
                    //barrack
                    addBarrack(row_, col_, uot[row_][col_]);
                    break;
                case 4:
                    //worker
                    addWorker(row_, col_, uot[row_][col_], urt[row_][col_]);
                    break;
                case 5:
                    //light
                    addLight(row_, col_, uot[row_][col_]);
                    break;
                case 6:
                    //heavy
                    addHeavy(row_, col_, uot[row_][col_]);
                    break;
                case 7:
                    //ranged
                    addRanged(row_, col_, uot[row_][col_]);
                    break;
            }

            // draw current actions
            switch(uat[row_][col_]){
                // add drawing group to board observation but not drawing it since lack of action parameters such as attack location
                case 1:
                    //move
                    let move_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:row_, col:col_}])
                                .attr("class","move_draw");
                    break;
                case 2:
                    //harvest
                    let harvest_g = d3.select("#board_g")
                    .append("g")
                    .data([{row:row_, col:col_}])
                    .attr("class","harvest_draw");
                    break;
                case 3:
                    //return
                    let return_g = d3.select("#board_g")
                            .append("g")
                            .data([{row:row_, col:col_}])
                            .attr("class","return_draw");
                    break;
                case 4:
                    //produce
                    let produce_g = d3.select("#board_g")
                            .append("g")
                            .data([{row:row_, col:col_}])
                            .attr("class","produce_draw");
                    break;
                case 5:
                    //attack
                    let attack_g = d3.select("#board_g")
                            .append("g")
                            .data([{row:row_, col:col_}])
                            .attr("class","attack_draw");
                    break;

            }


        }
    }

}


function addResource(row, col, rsc_num){
    
    let resourceG = d3.selectAll(".board_square").filter(function(d){
        return (d.row == row) && (d.col==col);
    }).append("g")
    .attr("class","resource");

    resourceG.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("class", "resource_rect")
    .attr("width", function(d) { return +d.width; })
    .attr("height", function(d) { return +d.height; })
    .attr("fill", unit_color.resource)
    .attr("stroke", "#222");

    resourceG.append("text")
    .attr("class", "resource_label")
    .text(rsc_num)
    .attr('x', (d)=>(+d.width/2))
    .attr('y', (d)=>(+d.height/2))
    .attr("text-anchor",'middle')
    .attr("font-size", 15)
    .attr("font-family", "sans-serif")
    .style("fill","black");

    resourceG.on('contextmenu', d3.contextmenu(resource_items));
}


function addBase(row, col, owner, rsc_num){
    
    let baseG = d3.selectAll(".board_square").filter(function(d){
        return (d.row == row) && (d.col==col);
    }).append("g")
    .attr("class","base");

    if(owner==1){
        baseG.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "base_rect")
        .attr("width", function(d) { return +d.width; })
        .attr("height", function(d) { return +d.height; })
        .attr("fill", unit_color.base)
        .attr("stroke", "blue")
        .attr("stroke-width", "3px");

    }else if(owner==2){
        baseG.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "base_rect")
        .attr("width", function(d) { return +d.width; })
        .attr("height", function(d) { return +d.height; })
        .attr("fill", unit_color.base)
        .attr("stroke", "red")
        .attr("stroke-width", "3px");

    }else{
        return;
    }

    baseG.append("text")
    .attr("class", "base_label")
    .text(rsc_num)
    .attr('x', (d)=>(+d.width/2))
    .attr('y', (d)=>(+d.height/2))
    .attr("text-anchor",'middle')
    .attr("font-size", 15)
    .attr("font-family", "sans-serif")
    .style("fill","black");

    baseG.on('contextmenu', d3.contextmenu(base_items));
}


function addBarrack(row, col, owner){
    
    if(owner==1){
        d3.selectAll(".board_square").filter(function(d){
            return (d.row == row) && (d.col==col);
        }).append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "barrack")
        .attr("width", function(d) { return +d.width; })
        .attr("height", function(d) { return +d.height; })
        .attr("fill", unit_color.barrack)
        .attr("stroke", "blue")
        .attr("stroke-width", "3px")
        .on('contextmenu', d3.contextmenu(barrack_items));

    }else if(owner==2){
        d3.selectAll(".board_square").filter(function(d){
            return (d.row == row) && (d.col==col);
        }).append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "barrack")
        .attr("width", function(d) { return +d.width; })
        .attr("height", function(d) { return +d.height; })
        .attr("fill", unit_color.barrack)
        .attr("stroke", "red")
        .attr("stroke-width", "3px")
        .on('contextmenu', d3.contextmenu(barrack_items));
    }else{
        return;
    }
}


function addWorker(row, col, owner, rsc_num){
    
    let workerG = d3.selectAll(".board_square").filter(function(d){
        return (d.row == row) && (d.col==col);
    }).append("g")
    .attr("class","worker");

    if(owner==1){
        workerG .append("circle")
        .attr("class","worker_circle")
        .attr('cx', (d)=>(+d.width/2))
        .attr('cy', (d)=>(+d.height/2))
        .attr('r', (d)=>(d3.min([+d.width, +d.height]) * 0.3))
        .attr("fill",unit_color.worker)
        .attr("stroke","blue")
        .attr("stroke-width","2px");

    }else if(owner==2){
        workerG .append("circle")
        .attr("class","worker_circle")
        .attr('cx', (d)=>(+d.width/2))
        .attr('cy', (d)=>(+d.height/2))
        .attr('r', (d)=>(d3.min([+d.width, +d.height]) * 0.3))
        .attr("fill",unit_color.worker)
        .attr("stroke","red")
        .attr("stroke-width","2px");

    }else{
        return;
    }


    workerG.append("text")
    .attr("class", "worker_label")
    .text(rsc_num)
    .attr('x', (d)=>(+d.width/2))
    .attr('y', (d)=>(+d.height/2 + d3.min([+d.width, +d.height]) * 0.15))
    .attr("text-anchor",'middle')
    .attr("font-size", 15)
    .attr("font-family", "sans-serif")
    .style("fill","black");

    workerG.on('contextmenu', d3.contextmenu(worker_items))
    .on("mouseover", showAttackRange)
    .on("mouseout",hideAttackRange);

}


function addLight(row, col, owner){
    
    if(owner==1){
        d3.selectAll(".board_square").filter(function(d){
            return (d.row == row) && (d.col==col);
        }).append("circle")
        .attr("class","light")
        .attr('cx', (d)=>(+d.width/2))
        .attr('cy', (d)=>(+d.height/2))
        .attr('r', (d)=>(d3.min([+d.width, +d.height]) * 0.4))
        .attr("fill",unit_color.light)
        .attr("stroke","blue")
        .attr("stroke-width","2px")
        .on('contextmenu', d3.contextmenu(light_items))
        .on("mouseover", showAttackRange)
        .on("mouseout",hideAttackRange);

    }else if(owner==2){
        d3.selectAll(".board_square").filter(function(d){
            return (d.row == row) && (d.col==col);
        }).append("circle")
        .attr("class","light")
        .attr('cx', (d)=>(+d.width/2))
        .attr('cy', (d)=>(+d.height/2))
        .attr('r', (d)=>(d3.min([+d.width, +d.height]) * 0.4))
        .attr("fill",unit_color.light)
        .attr("stroke","red")
        .attr("stroke-width","2px")
        .on('contextmenu', d3.contextmenu(light_items))
        .on("mouseover", showAttackRange)
        .on("mouseout",hideAttackRange);

    }else{
        return;
    }

}


function addHeavy(row, col, owner){
    
    if(owner==1){
        d3.selectAll(".board_square").filter(function(d){
            return (d.row == row) && (d.col==col);
        }).append("circle")
        .attr("class","heavy")
        .attr('cx', (d)=>(+d.width/2))
        .attr('cy', (d)=>(+d.height/2))
        .attr('r', (d)=>(d3.min([+d.width, +d.height]) * 0.5))
        .attr("fill",unit_color.heavy)
        .attr("stroke","blue")
        .attr("stroke-width","2px")
        .on('contextmenu', d3.contextmenu(heavy_items))
        .on("mouseover", showAttackRange)
        .on("mouseout",hideAttackRange);

    }else if(owner==2){
        d3.selectAll(".board_square").filter(function(d){
            return (d.row == row) && (d.col==col);
        }).append("circle")
        .attr("class","heavy")
        .attr('cx', (d)=>(+d.width/2))
        .attr('cy', (d)=>(+d.height/2))
        .attr('r', (d)=>(d3.min([+d.width, +d.height]) * 0.5))
        .attr("fill",unit_color.heavy)
        .attr("stroke","red")
        .attr("stroke-width","2px")
        .on('contextmenu', d3.contextmenu(heavy_items))
        .on("mouseover", showAttackRange)
        .on("mouseout",hideAttackRange);

    }else{
        return;
    }

}


function addRanged(row, col, owner){
    
    if(owner==1){
        d3.selectAll(".board_square").filter(function(d){
            return (d.row == row) && (d.col==col);
        }).append("circle")
        .attr("class","ranged")
        .attr('cx', (d)=>(+d.width/2))
        .attr('cy', (d)=>(+d.height/2))
        .attr('r', (d)=>(d3.min([+d.width, +d.height]) * 0.4))
        .attr("fill",unit_color.ranged)
        .attr("stroke","blue")
        .attr("stroke-width","2px")
        .on('contextmenu', d3.contextmenu(ranged_items))
        .on("mouseover", showAttackRange)
        .on("mouseout",hideAttackRange);

    }else if(owner==2){
        d3.selectAll(".board_square").filter(function(d){
            return (d.row == row) && (d.col==col);
        }).append("circle")
        .attr("class","ranged")
        .attr('cx', (d)=>(+d.width/2))
        .attr('cy', (d)=>(+d.height/2))
        .attr('r', (d)=>(d3.min([+d.width, +d.height]) * 0.4))
        .attr("fill",unit_color.ranged)
        .attr("stroke","red")
        .attr("stroke-width","2px")
        .on('contextmenu', d3.contextmenu(ranged_items))
        .on("mouseover", showAttackRange)
        .on("mouseout",hideAttackRange);

    }else{
        return;
    }

}