function unit_cancel_action(selected_row, selected_col){
    // let selected_row = d3.select(this).data()[0].row;
    // let selected_col = d3.select(this).data()[0].col;
    // remove produce action of selected unit
    d3.selectAll(".produce_draw").filter(function(d){
        return( d.row == selected_row) && (d.col==selected_col);
    }).remove();
    // remove harvest action of selected unit
    d3.selectAll(".harvest_draw").filter(function(d){
        return( d.row == selected_row) && (d.col==selected_col);
    }).remove();
    // remove return action of selected unit
    d3.selectAll(".return_draw").filter(function(d){
        return( d.row == selected_row) && (d.col==selected_col);
    }).remove();
    // remove attack action of selected unit
    d3.selectAll(".attack_draw").filter(function(d){
        return( d.row == selected_row) && (d.col==selected_col);
    }).remove();
    // remove move action of selected unit
    d3.selectAll(".move_draw").filter(function(d){
        return( d.row == selected_row) && (d.col==selected_col);
    }).remove();
}


function front_get_utt(rows_num, cols_num){
    // all zeros
    let utt = Array(rows_num).fill().map(() => Array(cols_num).fill(0));
    // resource
    d3.selectAll(".resource").each(function(d){utt[parseInt(d.row)][parseInt(d.col)] = 1;});
    // base
    d3.selectAll(".base").each(function(d){utt[parseInt(d.row)][parseInt(d.col)] = 2;});
    // barrack
    d3.selectAll(".barrack").each(function(d){utt[parseInt(d.row)][parseInt(d.col)] = 3;});
    //workers
    d3.selectAll(".worker").each(function(d){utt[parseInt(d.row)][parseInt(d.col)] = 4;});
    // light
    d3.selectAll(".light").each(function(d){utt[parseInt(d.row)][parseInt(d.col)] = 5;});
    // heavy
    d3.selectAll(".heavy").each(function(d){utt[parseInt(d.row)][parseInt(d.col)] = 6;});
    // ranged
    d3.selectAll(".ranged").each(function(d){utt[parseInt(d.row)][parseInt(d.col)] = 7;});
    return utt;
}

function front_get_uot(rows_num, cols_num){
    // all zeros
    let uot = Array(rows_num).fill().map(() => Array(cols_num).fill(0));
    // base
    d3.selectAll('.base_rect').each(function(d){ 
        if(d3.select(this).attr("stroke") == "blue"){
            uot[parseInt(d.row)][parseInt(d.col)] = 1;
        }else if(d3.select(this).attr("stroke") == "red"){
            uot[parseInt(d.row)][parseInt(d.col)] = 2;
        }
    });
    // barrack
    d3.selectAll('.barrack').each(function(d){ 
        if(d3.select(this).attr("stroke") == "blue"){
            uot[parseInt(d.row)][parseInt(d.col)] = 1;
        }else if(d3.select(this).attr("stroke") == "red"){
            uot[parseInt(d.row)][parseInt(d.col)] = 2;
        }
    });
    //workers
    d3.selectAll('.worker_circle').each(function(d){ 
        if(d3.select(this).attr("stroke") == "blue"){
            uot[parseInt(d.row)][parseInt(d.col)] = 1;
        }else if(d3.select(this).attr("stroke") == "red"){
            uot[parseInt(d.row)][parseInt(d.col)] = 2;
        }
    });
    // light
    d3.selectAll('.light').each(function(d){ 
        if(d3.select(this).attr("stroke") == "blue"){
            uot[parseInt(d.row)][parseInt(d.col)] = 1;
        }else if(d3.select(this).attr("stroke") == "red"){
            uot[parseInt(d.row)][parseInt(d.col)] = 2;
        }
    });
    // heavy
    d3.selectAll('.heavy').each(function(d){ 
        if(d3.select(this).attr("stroke") == "blue"){
            uot[parseInt(d.row)][parseInt(d.col)] = 1;
        }else if(d3.select(this).attr("stroke") == "red"){
            uot[parseInt(d.row)][parseInt(d.col)] = 2;
        }
    });
    // ranged
    d3.selectAll('.ranged').each(function(d){ 
        if(d3.select(this).attr("stroke") == "blue"){
            uot[parseInt(d.row)][parseInt(d.col)] = 1;
        }else if(d3.select(this).attr("stroke") == "red"){
            uot[parseInt(d.row)][parseInt(d.col)] = 2;
        }
    });

    return uot;
}

function front_get_urt(rows_num, cols_num){
    //only resource, base, and worker can carry resource
    // all zeros
    let urt = Array(rows_num).fill().map(() => Array(cols_num).fill(0));
    // resource
    d3.selectAll('.resource_label').each(function(d){ 
        urt[parseInt(d.row)][parseInt(d.col)] = parseInt(d3.select(this).text());
    });
    // // base
    // d3.selectAll(".base_label").each(function(d){urt[parseInt(d.row)][parseInt(d.col)] = parseInt(d3.select(this).text());});
    //workers
    d3.selectAll(".worker_label").each(function(d){urt[parseInt(d.row)][parseInt(d.col)] = parseInt(d3.select(this).text());});
    return urt;
}


function front_get_uht(rows_num, cols_num){
    // assume all hitpoints all full
    let uht = Array(rows_num).fill().map(() => Array(cols_num).fill(0));
    let utt = front_get_utt(rows_num, cols_num);

    $.ajax({
        type:'POST',
        url:'/utt_to_uht',
        data:JSON.stringify({utt:utt}),
        success:function(jsonRes){
            uht = jsonRes.uht;
            // console.log("uht",uht);
        },
        async:false,
        error: function(error){
            console.log(error);
        }
    });

    return uht;

}


function front_get_uat(rows_num, cols_num){
    let uat = Array(rows_num).fill().map(() => Array(cols_num).fill(0));

    // get current action move
    d3.selectAll('.move_draw').each(function(d){ 
        uat[parseInt(d.row)][parseInt(d.col)] = 1;
    });
    // get current action harvest
    d3.selectAll('.harvest_draw').each(function(d){ 
        uat[parseInt(d.row)][parseInt(d.col)] = 2;
    });
    // get current action return
    d3.selectAll('.return_draw').each(function(d){ 
        uat[parseInt(d.row)][parseInt(d.col)] = 3;
    });
    // get current action produce
    d3.selectAll('.produce_draw').each(function(d){ 
        uat[parseInt(d.row)][parseInt(d.col)] = 4;
    });
    // get current action attack
    d3.selectAll('.attack_draw').each(function(d){ 
        uat[parseInt(d.row)][parseInt(d.col)] = 5;
    });

    return uat;
}


function front_get_obs(rows_num, cols_num){

    let uht = front_get_uht(rows_num, cols_num);
    let urt = front_get_urt(rows_num, cols_num);
    let uot = front_get_uot(rows_num, cols_num);
    let utt = front_get_utt(rows_num, cols_num);
    let uat = front_get_uat(rows_num, cols_num);

    return [uht, urt, uot, utt, uat];
}


function front_get_player_urtmat(rows_num, cols_num){
    let player_urt_mat = Array(rows_num).fill().map(() => Array(cols_num).fill(0));
    // base
    d3.selectAll(".base_label").each(function(d){player_urt_mat[parseInt(d.row)][parseInt(d.col)] = parseInt(d3.select(this).text());});
    return player_urt_mat;
}


function print_action(valid_actions){
    let actions ="";
    for(let i=0;i<valid_actions.length;i++){
        let row = Math.floor((valid_actions[i][0])/16);
        let col = (valid_actions[i][0])%16;
        let act_tp = ut_dct[valid_actions[i][1]];
        let mv_drct = drct_dct[valid_actions[i][2]];
        let hrv_drct = drct_dct[valid_actions[i][3]];
        let rtn_drct = drct_dct[valid_actions[i][4]];
        let prdc_drct = drct_dct[valid_actions[i][5]];
        let prdc_tp = prdc_tp_dct[valid_actions[i][6]];
        // assuming unit position at (3,3) in a 7x7 square neighborhood
        let rela_atk_row = Math.floor((valid_actions[i][7])/7) -3;
        let rela_atk_col = ((valid_actions[i][7])%7) -3;

        let act_prmtr;
        switch(valid_actions[i][1]){
            case 0:
                act_prmtr='';
                break;
            case 1:
                act_prmtr=mv_drct;
                break;
            case 2:
                act_prmtr=hrv_drct;
                break;
            case 3:
                act_prmtr=rtn_drct;
                break;
            case 4:
                act_prmtr= (prdc_drct + ' ' + prdc_tp);
                break;
            case 5:
                act_prmtr= '(' + (rela_atk_row + row).toString() +',' + (rela_atk_col + col).toString() + ')';
                break;
        }
            

        let unit_action = '<p> ('+row.toString()+','+col.toString()+') ' + act_tp + ' ' + act_prmtr + '</p>';
        actions += unit_action;
        // actions += (valid_actions[i].toString() + '<p>')
    }

    return actions;
}


function showAttackRange(){
    let unit_type = d3.select(this).attr("class");
    let selected_row = d3.select(this).data()[0].row;
    let selected_col = d3.select(this).data()[0].col;
    if(unit_type=="ranged"){
        for(let i=selected_row-3; i<=selected_row+3; i++){
            for(let j=selected_col-3; j<=selected_col+3; j++){
                let row_dist = Math.abs(selected_row -i);
                let col_dist = Math.abs(selected_col -j);
                let euler_dist = Math.sqrt(row_dist**2 + col_dist**2);

                if(i<0 || i>15 || j<0 || j>15){
                    continue
                }else if(i==selected_row && j==selected_col){
                    continue
                }else if(euler_dist>3){
                    continue
                }else{

                    let attackRangeG = d3.selectAll(".board_square").filter(function(d){
                        return (d.row == i) && (d.col==j);
                    }).append("g")
                    .attr("class","attack_region");

                    attackRangeG.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", function(d) { return +d.width; })
                    .attr("height", function(d) { return +d.height; })
                    .attr("fill", "red")
                    .attr("opacity",0.5);
                }
            }
        }


    }else if(unit_type=="barrack" || unit_type=="base" || unit_type=="resource"){
        
    }else{
        for(let i=selected_row-1; i<=selected_row+1; i++){
            for(let j=selected_col-1; j<=selected_col+1; j++){

                let row_dist = Math.abs(selected_row -i);
                let col_dist = Math.abs(selected_col -j);
                let euler_dist = Math.sqrt(row_dist**2 + col_dist**2);

                if(i<0 || i>15 || j<0 || j>15){
                    continue
                }else if(i==selected_row && j==selected_col){
                    continue
                }else if(euler_dist>1){
                    continue
                }else{

                    let attackRangeG = d3.selectAll(".board_square").filter(function(d){
                        return (d.row == i) && (d.col==j); 
                    }).append("g")
                    .attr("class","attack_region");

                    attackRangeG.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", function(d) { return +d.width; })
                    .attr("height", function(d) { return +d.height; })
                    .attr("fill", "red")
                    .attr("opacity",0.5);
                }
            }
        }

    }
    
    console.log("class",unit_type);

}

function hideAttackRange(){
    d3.selectAll(".attack_region").remove();
}


function getStrategyStates(board_state_){
    let uot = board_state_[2]; 
    let utt = board_state_[3];
    let [num_base1, num_barrack1, num_worker1, num_light1, num_heavy1, num_ranged1, num_base2, num_barrack2, num_worker2, num_light2, num_heavy2, num_ranged2] = [0,0,0,0,0,0,0,0,0,0,0,0];
    for(let i=0;i<rows_num;i++){
        for(let j=0;j<cols_num;j++){
            switch(utt[i][j]){
                case 2:
                    //base
                    if(uot[i][j]==1){
                        num_base1+=1;
                    }else if(uot[i][j]==2){
                        num_base2+=1;
                    }
                    break;
                case 3:
                    //barrack
                    if(uot[i][j]==1){
                        num_barrack1+=1;
                    }else if(uot[i][j]==2){
                        num_barrack2+=1;
                    }
                    break;
                case 4:
                    //worker
                    if(uot[i][j]==1){
                        num_worker1+=1;
                    }else if(uot[i][j]==2){
                        num_worker2+=1;
                    }
                    break;
                case 5:
                    //light
                    if(uot[i][j]==1){
                        num_light1+=1;
                    }else if(uot[i][j]==2){
                        num_light2+=1;
                    }
                    break;
                case 6:
                    //heavy
                    if(uot[i][j]==1){
                        num_heavy1+=1;
                    }else if(uot[i][j]==2){
                        num_heavy2+=1;
                    }
                    break;
                case 7:
                    //ranged
                    if(uot[i][j]==1){
                        num_ranged1+=1;
                    }else if(uot[i][j]==2){
                        num_ranged2+=1;
                    }
                    break;
                default:
                    break;
                        

            }

        }
    }
    
    return [num_base1, num_barrack1, num_worker1, num_light1, num_heavy1, num_ranged1, num_base2, num_barrack2, num_worker2, num_light2, num_heavy2, num_ranged2];

}


function frontStrategyStates(rows_num, cols_num){
    let board_state = front_get_obs(rows_num, cols_num);
    let strategy_state = getStrategyStates(board_state)
    return strategy_state;
}

function replayStrategyStates(step){
    let board_state = replay_board_states[step];
    let strategy_state = getStrategyStates(board_state)
    return strategy_state;
}



function compareArray(arr1, arr2){
    return (JSON.stringify(arr1) == JSON.stringify(arr2));
}



function compareStates(arr1, arr2) {
    // assume arr1 and arr2 has same length

    // Initialize an array to store the indices where values differ
    let differingIndices = [];

    // Iterate through the arrays, comparing each value
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            differingIndices.push(i); // Add index to the list if values differ
        }
    }

    // If differingIndices is empty, arrays are equal
    if (differingIndices.length === 0) {
        return [];
    } else {
        // Return the indices where the arrays differ
        return differingIndices;
    }
}


function deep_copy(elm){
    return JSON.parse(JSON.stringify(elm));
}


function uot2color(d){
    if(uot[parseInt(d.row)][parseInt(d.col)]==1){
        return "blue";
    }else if(uot[parseInt(d.row)][parseInt(d.col)]==2){
        return "red";
    }else{
        return "none";
    }
    }


function unit_intention_eval(){
    let board_state = front_get_obs(rows_num, cols_num);
    let player_urt_mat = front_get_player_urtmat(rows_num, cols_num);
    console.log("unit pos (", ctf_unit_row, ",", ctf_unit_col, ")");

    let uot_tmp = board_state[2];
    if(uot_tmp[ctf_unit_row][ctf_unit_col]==2){
        alert("Can't run counterfactual steps for any player2 unit!");
        return;
    }
    $.ajax({
        type:'POST',
        url:'/unit_intention_eval',
        data:JSON.stringify({board_state:board_state, player_urt_mat:player_urt_mat, unit_pos:[ctf_unit_row, ctf_unit_col]}),
        success:function(jsonRes){

            $('#play_intv_switch').bootstrapToggle('on');

            let eval_unitpos_log = jsonRes.eval_unitpos_log;
            console.log("eval_unitpos_log", eval_unitpos_log)
            let max_step = jsonRes.max_step;

            drawUnitPaths(eval_unitpos_log, 2, 0.5, max_step);



        },
        async:false,
        error: function(error){
            console.log(error);
        }
    });

}