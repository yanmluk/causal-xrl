

// modified from https://bl.ocks.org/cagrimmett/07f8c8daea00946b9e704e3efcbd5739

$.ajax({
    type: 'GET',
    url: '/compute_global_causal',
    dataType: 'json',
    success: function(jsonRes) {
        let error_code = jsonRes.error_code;
        console.log("compute_global_causal error code:",error_code);
    },
    async: false,
    error: function(error) {
        console.log(error);
    }});

    
function gridData(width, height, rows, cols) {
	let grid_data = new Array();
	let xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
	let ypos = 1;
	
	// iterate for rows	
	for (let row = 0; row < rows; row++) {
		grid_data.push( new Array() );
		
		// iterate for cells/columns inside rows
		for (let col = 0; col < cols; col++) {
			grid_data[row].push({
				x: xpos,
				y: ypos,
				width: width,
				height: height,
				unit: 0,
                click: 0,
                row: row,
                col:col
			})
			// increment the x position. I.e. move it over by 50 (width variable)
			xpos += width;
		}
		// reset the x position after a row is complete
		xpos = 1;
		// increment the y position for the next row. Move it down 50 (height variable)
		ypos += height;	
	}
	return grid_data;
}


let grid_data = gridData(grid_side_len,grid_side_len,rows_num,cols_num);
console.log(grid_data);

let board_svg = d3.select("#board_pan")
	.append('svg')
	.attr("width",width + margin.left + margin.right)
	.attr("height",height + margin.top + margin.bottom)
    .attr("class", "board_svg")
    .attr("id","board_svg");

let board_g = board_svg.append("g")
    .attr("transform", "translate(" + (0.5 * (boardRect.width - board_len))+ "," + margin.top + ")")
    .attr("class", "board_g")
    .attr("id","board_g");


let board_row = board_g.selectAll(".board_row")
                        .data(grid_data)
                        .enter().append("g")
                        .attr("class", "board_row");
	
let board_col = board_row.selectAll(".board_square")
                        .data(function(d) { return d; })
                        .enter().append("g")
                        .attr("class","board_square")
                        .attr("transform", (d) => 'translate(' + +d.x + ',' + +d.y + ')');

board_col.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", function(d) { return +d.width; })
            .attr("height", function(d) { return +d.height; })
            .style("fill", "#FFFFFF")
            .style("fill-opacity",0.1)
            .style("stroke", "#222")
            .style("stroke-opacity",1)
            .on('contextmenu', d3.contextmenu(items));

board_svg.insert("image","#board_g")
        .attr("id","frame_img")
        .style("postion","absolute")   
        .attr("href", "../static/white.png")
        .attr("x",  (0.5 * (boardRect.width - board_len)))
        .attr("y", margin.top)
        .attr("width", "656")
        .attr("height", "656"); 


addBoardLegend(true);
d3.select("#show_lgd_switch").on("change", function(){
    if(d3.select("#show_lgd_switch").property("checked")){
        addBoardLegend(true);
    }else{
        addBoardLegend(false);
    }
    
})





//upload data
d3.select("#load_map").on("click", function(){$("#load_map").val("");});
d3.select("#load_map").on("change", function(){
    //check if file length if 0 return;
    if(!this.files.length) return;
    // read file
    const dataFile = this.files[0];
    const fileName = dataFile.name;
    const ext = fileName.split('.').pop();

    if (ext != "xml") {
        alert("File format error, not a xml file!");
        return;
    } else {
        const fReader = new FileReader();
        fReader.readAsText(dataFile);
        fReader.onload = function(){

            $.ajax({
                url: '/read_xml_map',
                data: JSON.stringify({content:fReader.result}),
                type: 'POST',
                success: function(jsonRes) {

                    let board_state = jsonRes.raw_obs;
                    let player_urt_mat = jsonRes.player_urt_mat;

                    let uht, urt, uot, utt, uat;
                    uht = board_state[0],
                    urt = board_state[1], 
                    uot = board_state[2], 
                    utt = board_state[3],
                    uat = board_state[4];
                     
                    genBoard(uht, urt, uot, utt, uat, player_urt_mat);
                    // remove previous unit counterfactual steps
                    d3.select("#unitPlanSwitch").property("checked",false);
                    d3.selectAll(".unit_trace_draw").remove();
                    d3.select("#view_pan_svg").remove();

                    
                    $('#state_anlz_select')
                    .empty()
                    .append('<option selected value="b1">board state 1</option>');
                    
                    // let board_state = front_get_obs(rows_num, cols_num);
                    cached_board_map_state["b1"] = [board_state, player_urt_mat];
                },
                //error function for first ajax call
                error: function(error) {
                    console.log(error);
                }
            });
        };

    }

    
});

/* Play an episode*/

d3.select("#play_epsd_btn").on("click", function(){
    playModal.show();
});

d3.select("#play_cfrm_btn").on("click", function(){
    playModal.hide();

    $('#board_spinner').show();

    // add game step label
    d3.select("#gamestep_lbl").remove();

    d3.select("#board_svg").append("text")
    .attr("id","gamestep_lbl")
    .attr("x", 0.9*(boardRect.width))             
    .attr("y", (boardRect.height) - 30)
    .attr("text-anchor", "left")  
    .style("font-size", "1.2rem") 
    .text("Game Step 0");

    let board_state = front_get_obs(rows_num, cols_num);
    let player_urt_mat = front_get_player_urtmat(rows_num, cols_num);

    $.ajax({
        type:'POST',
        url:'/run_env_episode',
        data:JSON.stringify({board_state:board_state, player_urt_mat:player_urt_mat}),
        error: function(error){
            console.log(error);
        }
    }).done(function(jsonRes){
            $('#board_spinner').hide();

            let rawobs_log_ = jsonRes.rawobs_log;
            let player_urt_log_ = jsonRes.player_urt_log;
            let unique_gamesteps_ = jsonRes.unique_gamesteps;
            let max_gamestep = rawobs_log_.length;

            replay_board_states = rawobs_log_;
            replay_player_urt = player_urt_log_;
            replay_gameSteps = unique_gamesteps_;
            console.log("replay_gameSteps",replay_gameSteps);

            console.log("replay_player_urt",replay_player_urt);

            // toggle to replay
            $('#play_intv_switch').bootstrapToggle('off');
            replayTrack(max_gamestep,replay_gameSteps);

            const stepId = 0;
            drawCausalLayout();
            $.ajax({
                type:'POST',
                url:'/get_local_causal',
                data:JSON.stringify({step_id:stepId}),
                error: (error)=>{console.log(error);}
            }).done((jsonRes)=>{
                let nodes_data = jsonRes.nodes;
                let edges_data = jsonRes.edges;
                let effect_data = jsonRes.effect;
                let curStrategyState = replayStrategyStates(stepId);
                genCsGraph(nodes_data, edges_data, effect_data, curStrategyState);
               
            })

        });
});


d3.select("#case1_btn").on("click", function(){
    if(d3.select("#case1_btn").classed("active")){
        d3.select("#case1_btn").classed("active", false);
    }else{
        console.log("case1",case1_step);
        d3.select("#case1_btn").classed("active", true);
        d3.select("#case2_btn").classed("active", false);
        replayTrack.frameUpdate(case1_step,true);
    }
    
});

d3.select("#case2_btn").on("click", function(){
    if(d3.select("#case2_btn").classed("active")){
        d3.select("#case2_btn").classed("active", false);
    }else{
        d3.select("#case2_btn").classed("active", true);
        d3.select("#case1_btn").classed("active", false);
        console.log("case2",case2_step);
        replayTrack.frameUpdate(case2_step,true);
    }
    
});



d3.select("#record_state_btn").on("click", function(){
    let board_state = front_get_obs(rows_num, cols_num);
    let player_urt_mat = front_get_player_urtmat(rows_num, cols_num);


    let match_time = 0;
    for (const boardStateName in cached_board_map_state) {
        let board_state_eq = compareArray(board_state, (cached_board_map_state[boardStateName][0]));
        // let board_state_eq = compareArray(board_state, (cached_board_map_state[boardStateName][0]));
        let player_urt_eq = compareArray(player_urt_mat, cached_board_map_state[boardStateName][1]);

        let board_state_eq0 = compareArray(board_state[0], (cached_board_map_state[boardStateName][0])[0]);
        let board_state_eq1 = compareArray(board_state[1], (cached_board_map_state[boardStateName][0])[1]);
        let board_state_eq2 = compareArray(board_state[2], (cached_board_map_state[boardStateName][0])[2]);
        let board_state_eq3 = compareArray(board_state[3], (cached_board_map_state[boardStateName][0])[3]);
        let board_state_eq4 = compareArray(board_state[4], (cached_board_map_state[boardStateName][0])[4]);

        console.log("board_state_eq0:",board_state_eq0, "board_state_eq1:",board_state_eq1, "board_state_eq2:",board_state_eq2, "board_state_eq3:",board_state_eq3,"board_state_eq4:",board_state_eq4);
        // console.log("cache board 0:",(cached_board_map_state[boardStateName][0])[0], "current:",board_state[0]);

        console.log("cache board:",(cached_board_map_state[boardStateName][0]), "current:",board_state);
        console.log("cache player_urt_mat:",cached_board_map_state[boardStateName][1], "current:",player_urt_mat);
        console.log("board_state_eq:",board_state_eq, "player_urt_eq:",player_urt_eq);
        if(board_state_eq && player_urt_eq){
            match_time+=1;
        }else{
            continue;
        }
    }
    console.log("match_time:",match_time);
    if(match_time==0){
        //this board state not cached append in cache
        const newStateNum = (Object.keys(cached_board_map_state).length + 1).toString();
        const newState = "b"+ newStateNum;
        cached_board_map_state[newState] = [board_state, player_urt_mat];

        d3.select("#state_anlz_select").selectAll("option").property("selected",false);
        $('#state_anlz_select')
        .append('<option selected value='+newState+'>board state '+newStateNum+'</option>');

        
        let recordStateAlert1 = $('<div id="board_alert_success" class="alert alert-success alert-dismissible fade show position-absolute top-0 end-0" role="alert" >New Board State board state '+newStateNum+' Created!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>');
        $('#board_pan').append(recordStateAlert1);
        // alert dismiss after 1 second
        setTimeout(() => {
            $('#board_alert_success').alert('close');
          }, 2000);
        
        //switch to intervention mode
        $('#play_intv_switch').bootstrapToggle('on');
    }else{
        let recordStateAlert2 = $('<div id="board_alert_fail"class="alert alert-danger alert-dismissible fade show position-absolute top-0 end-0" role="alert" >Board State exists!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>');
        $('#board_pan').append(recordStateAlert2);
        // alert dismiss after 1 second
        setTimeout(() => {
            $('#board_alert_fail').alert('close');
          }, 2000);
          return;
    }
    
});


d3.select("#state_anlz_select").on("change", function(){
    const boardStateOpt = d3.select("#state_anlz_select").property("value");

    $('#play_intv_switch').bootstrapToggle('on');

    let board_state = cached_board_map_state[boardStateOpt][0];
    let player_urt_mat = cached_board_map_state[boardStateOpt][1];

    let uht, urt, uot, utt, uat;
    uht = board_state[0],
    urt = board_state[1], 
    uot = board_state[2], 
    utt = board_state[3],
    uat = board_state[4];
     
    genBoard(uht, urt, uot, utt, uat, player_urt_mat);  

    if(!d3.select("#show_cam_switch").property("checked") && !d3.select("#show_um_switch").property("checked") ){
        // do nothing

    }else if(d3.select("#show_cam_switch").property("checked") ){
        let cache_flag = (boardStateOpt in cached_cam);
        if(cache_flag){
             //plot cam
            let board_actions_ = cached_cam[boardStateOpt][0]; 
            let board_action_drct_ = cached_cam[boardStateOpt][1]; 
            let board_action_prdc_obj_ = cached_cam[boardStateOpt][2]; 
            let board_action_atk_row_ = cached_cam[boardStateOpt][3]; 
            let board_action_atk_col_ = cached_cam[boardStateOpt][4];
            plot_counterfactual_action_map(rows_num, cols_num, board_actions_, board_action_drct_, board_action_prdc_obj_, board_action_atk_row_,board_action_atk_col_);
        }else{
            //disable cam
            d3.selectAll(".actionG").remove();
            d3.select("#board_svg").selectAll(".sqr_action").remove();
            d3.select("#board_svg").selectAll(".sqr_lb_action").remove();
            d3.select("#act_lgd_title").remove();

            d3.select("#show_cam_switch").property("checked",false);
            alert("No Counterfactual Action Map for this board state!");
            return;
        }
       


    }else if(d3.select("#show_um_switch").property("checked")){
        let cache_flag = (boardStateOpt in cached_um);
        if(cache_flag){
        //plot um
        let board_gini_ = cached_um[boardStateOpt][0];
        let board_actions_stats_ = cached_um[boardStateOpt][1];
        plot_uncertainty_map(rows_num, cols_num, board_gini_, board_actions_stats_, true);
        }else{
            // to disable um
            d3.selectAll(".uncrtG").remove();
            d3.selectAll(".lgd_txt").remove();
            d3.select("#um_lgd_title").remove();
            d3.selectAll(".legend_bar").remove();

            d3.select("#show_um_switch").property("checked",false);
            alert("No Uncertainty Map for this board state!");
            return;
        }

    }


})
    


d3.select("#fwd_btn").on("click", function(){
    // step add 1
    let cur_step = parseInt(d3.select("#step_lbl").text());
    let next_step = cur_step+1;
    if(boardstates_log[next_step]==undefined){
        // removeBoard();
        alert("No step "+next_step.toString()+" being logged!");
        return;
    }else{
        let uht, urt, uot, utt, uat, player_urt_mat;
        uht = boardstates_log[next_step][0],
        urt = boardstates_log[next_step][1], 
        uot = boardstates_log[next_step][2], 
        utt = boardstates_log[next_step][3],
        uat = boardstates_log[next_step][4];
        player_urt_mat = player_urt_log[next_step];
         
        genBoard(uht, urt, uot, utt, uat, player_urt_mat);
    }
    d3.select("#step_lbl").text((next_step).toString());
});


d3.select("#bkw_btn").on("click", function(){
    //step minus 1
    let cur_step = parseInt(d3.select("#step_lbl").text());
    let prev_step = cur_step-1;
    if(cur_step<=0){
        alert("Step can't go lower than 0!");
        return;
    }
    if(boardstates_log[prev_step]==undefined){
        // removeBoard();
        alert("No step "+prev_step.toString()+" being logged!");
        return;
    }else{
        let uht, urt, uot, utt, uat, player_urt_mat;
        uht = boardstates_log[prev_step][0],
        urt = boardstates_log[prev_step][1], 
        uot = boardstates_log[prev_step][2], 
        utt = boardstates_log[prev_step][3],
        uat = boardstates_log[prev_step][4]; 
        player_urt_mat = player_urt_log[prev_step];

        genBoard(uht, urt, uot, utt, uat, player_urt_mat);
    }
    d3.select("#step_lbl").text((prev_step).toString());
});


d3.select("#gen_path_btn").on("click", function(){

    for(let i=0; i<(Object.keys(boardstates_log).length-1); i++){
        let unit_coords;
        $.ajax({
            type:'POST',
            url:'/get_p1unit_pos',
            data:JSON.stringify({board_states:[boardstates_log[i], boardstates_log[i+1]]}),
            success:function(jsonRes){
                unit_coords = jsonRes.unit_coords;
            },
            async:false,
            error: function(error){
                console.log(error);
            }
        });

        // src position
        let unit_row0 = +unit_coords[0][0];
        let unit_col0 = +unit_coords[0][1];
        //target position
        let unit_row1 = +unit_coords[1][0];
        let unit_col1 = +unit_coords[1][1];

        console.log("pos(",unit_row0, unit_col0,") (", unit_row1, unit_col1,")");

        let y0 = 1 + grid_side_len * unit_row0;
        let x0 = 1 + grid_side_len * unit_col0;
        let y1 = 1 + grid_side_len * unit_row1;
        let x1 = 1 + grid_side_len * unit_col1;

        let selected_side = grid_side_len;

        // draw trace
        let trace_g = d3.select("#board_g")
                        .append("g")
                        .attr("class","trace_draw");

        trace_g.append("path")
            .attr("d","M"+(+x0 + (+selected_side)/2)+","+(+y0 + (+selected_side)/2)+"L"+(+x1 + (+selected_side)/2)+","+(+y1 + (+selected_side)/2)+"")
            .attr("stroke","#fab907")
            .attr("stroke-width","2px");

    }
    let board_state = front_get_obs(rows_num, cols_num);
    $.ajax({
        type:'POST',
        url:'/find_p1_action',
        data:JSON.stringify({board_state:board_state, valid_actions:valid_actions}),
        success:function(jsonRes){
            let p1_action = jsonRes.p1_action;
            console.log("p1_action",p1_action)
            if(p1_action.length >0){
                drawAction(p1_action);
            }
            
        },
        async:false,
        error: function(error){
            console.log(error);
        }
    });
    
});


d3.select("#clear_path_btn").on("click", function(){

    d3.selectAll(".trace_draw").remove();
    hist_positions=[];


});


// d3.select("#feat_pan").append("br"); 
// d3.select("#feat_pan").append("label").text("Uncertainty metric:");
// var uncrt_metric_drp = d3.select('#feat_pan')
//                 .append('select')
//                 .attr('id','uncrt_metric_select')
//                 .selectAll('option')
//                 .data([{"name":"Purity", "id":0},{"name":"Entropy", "id":1}, {"name":"Gini Index", "id":2}])
//                 .enter()
//                 .append('option')
//                 .attr('value',(d)=>d.id)
//                 .text((d)=>d.name);

/* counterfactual action map */
d3.select("#get_cam_btn").on("click", function(){
    // $("#cfu_modal_body").empty().append("<p>I'm aware of the parameters of counterfactual unit in control panel</p>")
    cfuModal.show();
});

d3.select("#cfu_cfrm_btn").on("click",function(){
    cfuModal.hide();
    $('#board_spinner').show();

    const cell_hp = +d3.select("#hp_select").node().value;
    const cell_rsc = +d3.select("#rsc_select").node().value;
    const cell_owner = +d3.select("#owner_select").node().value;
    const cell_ut = +d3.select("#ut_select").node().value;
    const cell_curact = +d3.select("#curact_select").node().value;
    let board_state = front_get_obs(rows_num, cols_num);
    let player_urt_mat = front_get_player_urtmat(rows_num, cols_num);

    $.ajax({
        type:'POST',
        url:'/get_counterfactual_map',
        data:JSON.stringify({cell_obs:[cell_hp, cell_rsc, cell_owner, cell_ut, cell_curact], board_state:board_state, player_urt_mat:player_urt_mat}),
        error: function(error){
            console.log(error);
        }
    }).done(function(jsonRes){
            $('#board_spinner').hide();
            board_actions = jsonRes.board_actions;
            board_action_drct = jsonRes.board_action_drct;
            board_action_prdc_obj = jsonRes.board_action_prdc_obj;
            board_action_atk_row = jsonRes.board_action_atk_row;
            board_action_atk_col = jsonRes.board_action_atk_col;
            console.log("board_actions", board_actions);
            console.log("board_action_drct", board_action_drct);
            plot_counterfactual_action_map(rows_num, cols_num, board_actions, board_action_drct, board_action_prdc_obj, board_action_atk_row,board_action_atk_col);
            d3.select("#show_cam_switch").property("checked", true);

            //cache cam
            const boardStateOpt = d3.select("#state_anlz_select").property("value");
            cached_cam[boardStateOpt] = [board_actions, board_action_drct, board_action_prdc_obj, board_action_atk_row,board_action_atk_col];
        });

    
});

d3.select("#show_cam_switch").on("change", function(){
    const boardStateOpt = d3.select("#state_anlz_select").property("value");
    let cache_flag = (boardStateOpt in cached_cam);

    if(d3.select("#show_cam_switch").property("checked") && d3.select("#show_um_switch").property("checked") ){
        alert("Can't show Counterfactual Action Map and Uncertainty Map at the same time!");
        d3.select("#show_cam_switch").property("checked", false);
        return;
    }

    if(d3.select("#show_cam_switch").property("checked") && cache_flag){
        //has cam data
        let board_actions_ = cached_cam[boardStateOpt][0]; 
        let board_action_drct_ = cached_cam[boardStateOpt][1]; 
        let board_action_prdc_obj_ = cached_cam[boardStateOpt][2]; 
        let board_action_atk_row_ = cached_cam[boardStateOpt][3]; 
        let board_action_atk_col_ = cached_cam[boardStateOpt][4];
        plot_counterfactual_action_map(rows_num, cols_num, board_actions_, board_action_drct_, board_action_prdc_obj_, board_action_atk_row_,board_action_atk_col_);

    }else if(d3.select("#show_cam_switch").property("checked") && (!cache_flag)){
        // to check cam but no data
        alert("To receive Counterfactual Action Map please click the corresponding icon in the board panel!");
        d3.select("#show_cam_switch").property("checked", false);
        return;

    }else if(!d3.select("#show_cam_switch").property("checked") ){
        //disable cam
        d3.selectAll(".actionG").remove();
        d3.select("#board_svg").selectAll(".sqr_action").remove();
        d3.select("#board_svg").selectAll(".sqr_lb_action").remove();
        d3.select("#act_lgd_title").remove();

        d3.select("#show_cam_switch").property("checked", false);

    }

});

/* uncertainty map*/

d3.select("#get_um_btn").on("click", function(){ umModal.show();});

d3.select("#um_cfrm_btn").on("click", function(){
    umModal.hide();
    $('#board_spinner').show();

    const cell_hp = +d3.select("#hp_select").node().value;
    const cell_rsc = +d3.select("#rsc_select").node().value;
    const cell_owner = +d3.select("#owner_select").node().value;
    const cell_ut = +d3.select("#ut_select").node().value;
    const cell_curact = +d3.select("#curact_select").node().value;
    let board_state = front_get_obs(rows_num, cols_num);
    let player_urt_mat = front_get_player_urtmat(rows_num, cols_num);

    $.ajax({
        type:'POST',
        url:'/get_uncertainty_map',
        data:JSON.stringify({cell_obs:[cell_hp, cell_rsc, cell_owner, cell_ut, cell_curact], board_state:board_state, player_urt_mat:player_urt_mat}),
        error: function(error){
            console.log(error);
        }
    }).done(function(jsonRes){
        $('#board_spinner').hide();
        board_actions_stats = jsonRes.board_actions_stats;
        board_gini = jsonRes.board_gini;
        board_entropy = jsonRes.board_entropy;
        board_purity = jsonRes.board_purity;
        console.log("board_actions_stats", board_actions_stats);
        console.log("board_gini", board_gini);
        plot_uncertainty_map(rows_num, cols_num, board_gini, board_actions_stats, true);
        d3.select("#show_um_switch").property("checked", true);

        //cache um
        const boardStateOpt = d3.select("#state_anlz_select").property("value");
        cached_um[boardStateOpt] = [board_gini, board_actions_stats];
    });
});


d3.select("#show_um_switch").on("change", function(){
    const boardStateOpt = d3.select("#state_anlz_select").property("value");
    let cache_flag = (boardStateOpt in cached_um);

    if(d3.select("#show_cam_switch").property("checked") && d3.select("#show_um_switch").property("checked") ){
        alert("Can't show Counterfactual Action Map and Uncertainty Map at the same time!");
        d3.select("#show_um_switch").property("checked", false);
        return;
    }


    if(d3.select("#show_um_switch").property("checked") && cache_flag){
        // has um data
        let board_gini_ = cached_um[boardStateOpt][0];
        let board_actions_stats_ = cached_um[boardStateOpt][1];
        plot_uncertainty_map(rows_num, cols_num, board_gini_, board_actions_stats_, true);

    }else if(d3.select("#show_um_switch").property("checked") && (!cache_flag)){
        // to check um but no data
        alert("To receive Uncertainty Map please click the corresponding icon in the board panel!");
        d3.select("#show_um_switch").property("checked", false);
        return;
    }else{
        // to disable um
        d3.selectAll(".uncrtG").remove();
        d3.selectAll(".lgd_txt").remove();
        d3.select("#um_lgd_title").remove();
        d3.selectAll(".legend_bar").remove();

        d3.select("#show_um_switch").property("checked", false);
    }

});




// d3.select("#uncrt_metric_select").on("change", function(){
//     console.log("typeof(board_actions_stats)", typeof(board_actions_stats));
//     if(d3.select("#uncrtmapSwitch").property("checked") && typeof(board_actions_stats) !== "undefined"){
//         const uncrt_metric = +d3.select("#uncrt_metric_select").node().value;
//         switch(uncrt_metric){
//             case 0:
//                 plot_uncertainty_map(rows_num, cols_num, board_purity, board_actions_stats, false);
//                 break;
//             case 1:
//                 plot_uncertainty_map(rows_num, cols_num, board_entropy, board_actions_stats, true);
//                 break;
//             case 2:
//                 plot_uncertainty_map(rows_num, cols_num, board_gini, board_actions_stats, true);
//                 break;
//         }
//     }else{
//         return;
//     }

// });


d3.select("#runenv_modal_body").append("br"); 
d3.select("#runenv_modal_body").append("label").text("Number of steps to run(>=2)\u2007");

const step_txtbox = d3.select("#runenv_modal_body")
                        .append("input")
                        .attr("type", "text")
                        .attr("id","steptxb")
                        .attr("value","10")
                        .attr('size', 4);

/* download map */
d3.select("#down_map_btn").on("click", function(){
    downloadModal.show();
});


d3.select("#downmap_cfm_btn").on("click", function(){

    let board_state = front_get_obs(rows_num, cols_num);
    let player_urt_mat = front_get_player_urtmat(rows_num, cols_num);
    downFileName = d3.select("#downFileName").node().value;
    
    $.ajax({
        type:'POST',
        url:'/download_map',
        data:JSON.stringify({board_state:board_state, player_urt_mat:player_urt_mat, map_name:downFileName}),
        success:function(){
            alert("File saved as maps/"+downFileName+".xml");
        },
        async:false,
        error: function(error){
            console.log(error);
        }

    })

    downloadModal.hide();

})


d3.select("#runenv_btn").on("click", function(){
    let num_steps = +d3.select("#steptxb").node().value;
    let board_state = front_get_obs(rows_num, cols_num);
    let player_urt_mat = front_get_player_urtmat(rows_num, cols_num);
    console.log("front num_steps", num_steps);

    $.ajax({
        type:'POST',
        url:'/runenv_steps',
        data:JSON.stringify({num_steps:num_steps, board_state:board_state, player_urt_mat:player_urt_mat}),
        success:function(jsonRes){
            let rawobs_log = jsonRes.rawobs_log;
            let player_urt_log_ = jsonRes.player_urt_log;
            // clear log to prevent unwanted residual board states
            boardstates_log = {};
            player_urt_log = {};
            for(let i=0; i<rawobs_log.length; i++){
                boardstates_log[i] = rawobs_log[i];
                player_urt_log[i] = player_urt_log_[i];
            }
            

        },
        async:false,
        error: function(error){
            console.log(error);
        }
    });
    runenvModal.hide();});


d3.select("#runstps_modal_body").append("br"); 
d3.select("#runstps_modal_body").append("label").text("Number of steps to run(>=2)\u2007");

d3.select("#runstps_modal_body")
    .append("input")
    .attr("type", "text")
    .attr("id","step_txb")
    .attr("value","10")
    .attr('size', 4);

d3.select("#runstps_btn").on("click", function(){
    const num_steps = +d3.select("#step_txb").node().value;
    let board_state = front_get_obs(rows_num, cols_num);
    let player_urt_mat = front_get_player_urtmat(rows_num, cols_num);
    console.log("front num_steps", num_steps);

    $.ajax({
        type:'POST',
        url:'/run_ctf_steps',
        data:JSON.stringify({num_steps:num_steps, board_state:board_state, player_urt_mat:player_urt_mat}),
        success:function(jsonRes){
            let rawobs_log = jsonRes.rawobs_log;
            for(let i=0; i<rawobs_log.length; i++){
                boardstates_log[i] = rawobs_log[i];
            }
            

        },
        async:false,
        error: function(error){
            console.log(error);
        }
    });
    runstpsModal.hide();});


d3.select("#unitctfstps_btn").on("click", function(){
        const num_steps = +d3.select("#unit_step_txb").node().value;
        let board_state = front_get_obs(rows_num, cols_num);
        let player_urt_mat = front_get_player_urtmat(rows_num, cols_num);
        console.log("front num_steps", num_steps);
        console.log("unit pos (", ctf_unit_row, ",", ctf_unit_col, ")");

        let uot_tmp = board_state[2];
        if(uot_tmp[ctf_unit_row][ctf_unit_col]==2){
            alert("Can't run counterfactual steps for any player2 unit!");
            return;
        }
        $.ajax({
            type:'POST',
            url:'/unit_run_ctf_steps',
            data:JSON.stringify({num_steps:num_steps, board_state:board_state, player_urt_mat:player_urt_mat, unit_pos:[ctf_unit_row, ctf_unit_col]}),
            success:function(jsonRes){

                $('#play_intv_switch').bootstrapToggle('on');
                let unitctf_boardstates_log_ = jsonRes.rawobs_log;
                unit_max_gamestep = jsonRes.gamestep;

                let current_action = jsonRes.current_action;
                let unitctf_player_urt_log_ = jsonRes.player_urt_log;
                let unitpos_log_ = jsonRes.unitpos_log;

                console.log("unitctf_boardstates_log_", unitctf_boardstates_log_);
                console.log("unitctf_player_urt_log_", unitctf_player_urt_log_);
                console.log("total_steps", unit_max_gamestep);
                console.log("current_action", current_action);
                console.log("unitpos_log_", unitpos_log_);

                unit_current_action = current_action;

                // clear log to prevent unwanted residual board states
                unitctf_boardstates_log = {};
                unitctf_player_urt_log = {};
                unitctf_unitpos_log = [];
                for(let i=0; i<unitctf_boardstates_log_.length; i++){
                    unitctf_boardstates_log[i] = unitctf_boardstates_log_[i];
                    unitctf_player_urt_log[i] = unitctf_player_urt_log_[i];
                    unitctf_unitpos_log.push(unitpos_log_[i]);
                }
                
    
            },
            async:false,
            error: function(error){
                console.log(error);
            }
        });
        drawPlayTrack(unit_max_gamestep);
        unitctfstpsModal.hide();});


d3.select("#unitPlanSwitch").on("change", function(){
    if(d3.select("#unitPlanSwitch").property("checked") && Object.keys(unitctf_boardstates_log).length >0){

        drawUnitPath(unitctf_unitpos_log, 0, 1, Object.keys(unitctf_boardstates_log).length);

        const ctf_current_step = (+d3.select("#unit_step_lbl").text());
        console.log("ctf_current_step",ctf_current_step);
        if(ctf_current_step==unit_max_gamestep){
            drawAction(unit_current_action);
        }


    }else if(!d3.select("#unitPlanSwitch").property("checked")){
        //uncheck switch
        d3.selectAll(".unit_trace_draw").remove();
        // issue with valid_acction binding !!!
        // remove next action
        let act_row = Math.floor((unit_current_action[0])/16);
        let act_col = (unit_current_action[0])%16;
        unit_cancel_action(act_row, act_col);
    
    }else{
        // no logged unit counterfactual steps
        alert("You must get unit's plan first by getting counterfactual steps!");
        d3.select("#unitPlanSwitch").property("checked",false);
        return; 

    }

});


d3.select("#unitEvalSwitch").on("change", function(){
    if(d3.select("#unitEvalSwitch").property("checked")){

    }else{
        d3.selectAll(".unit_trace_draw").remove();
    }

});
