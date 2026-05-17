function replayTrack(step_max, frames_steps){

    const step_min = 0;
    let sliderCurrentValue = 0;
    const sliderMaxValue = 0.8 * boardRect.width;

    let replayButton = d3.select("#replay_play_btn");

    let xScale = d3.scaleLinear()
    .domain([step_min, step_max])
    .range([0, sliderMaxValue])
    .clamp(true);

    //---- play animation ----//
    var replaySwitch = false;

    //slider
    d3.select("#board_range").property("min", 0);
    d3.select("#board_range").property("max", sliderMaxValue);
    //drag handle
    d3.select("#board_range").on("change", function(){
        sliderCurrentValue = parseFloat(d3.select("#board_range").property("value"));
        // console.log("sliderCurrentValue from reading value:", sliderCurrentValue)
        frameUpdate(xScale.invert(sliderCurrentValue), true); 
    });

    // continuously play frames
    replayButton.on("click", function() {
        $('#play_intv_switch').bootstrapToggle('off');
        if (replaySwitch) {
            //if currently playing
            clearInterval(timer);
            //update current info
            frameUpdate(xScale.invert(sliderCurrentValue), true);
            // d3.select(this).select("i").node().innerHTML = "play_arrow";
            d3.select("#replay_play_btn").select("i").node().innerHTML = "play_arrow";
            replaySwitch = !replaySwitch;
        } else {
            //if currently stopped
            timer = setInterval(frameStep, 500);
            // d3.select(this).select("i").node().innerHTML = "pause";
            d3.select("#replay_play_btn").select("i").node().innerHTML = "pause";
            replaySwitch = !replaySwitch;
        }
        });

    
    // frame go forward by one step
    d3.select('#replay_next_btn').on("click", function(){
        $('#play_intv_switch').bootstrapToggle('off');
        if (replaySwitch) {
            clearInterval(timer);
            d3.select("#replay_play_btn").select("i").node().innerHTML = "play_arrow";
            replaySwitch = !replaySwitch;
        }
        sliderCurrentValue = sliderCurrentValue + (sliderMaxValue/(step_max - step_min));
        // console.log("sliderCurrentValue_nxt2", sliderCurrentValue);
        if (sliderCurrentValue > sliderMaxValue) {
            sliderCurrentValue = 0;
        }
        frameUpdate(xScale.invert(sliderCurrentValue), true);
    });


    // frame go backward by one step
    d3.select('#replay_prev_btn').on("click", function(){
        $('#play_intv_switch').bootstrapToggle('off');
        if (replaySwitch) {
            clearInterval(timer);
            d3.select("#replay_play_btn").select("i").node().innerHTML = "play_arrow";
            replaySwitch = !replaySwitch;
        }
        // frameUpdate(xScale.invert(sliderCurrentValue), true);
        // console.log("sliderCurrentValue_prv1", sliderCurrentValue);
        sliderCurrentValue = sliderCurrentValue - (sliderMaxValue/(step_max - step_min));
        // console.log("sliderCurrentValue_prv2", sliderCurrentValue);
        if (sliderCurrentValue < 0) {
            sliderCurrentValue = 0;
        }
        frameUpdate(xScale.invert(sliderCurrentValue), true);
    });


    function frameStep() {
        // frame step forward
        frameUpdate(xScale.invert(sliderCurrentValue), true);
        sliderCurrentValue = sliderCurrentValue + (sliderMaxValue/(step_max - step_min));
        if (sliderCurrentValue > sliderMaxValue) {
            sliderCurrentValue = 0;
            clearInterval(timer);
            // timer = 0;
            // d3.select(this).select("i").node().innerHTML = "play_arrow";
            d3.select("#replay_play_btn").select("i").node().innerHTML = "play_arrow";
        }
    }


    function frameUpdate(step_id,stepSwitch) {
        /* user study */
        console.log("stepid",step_id);
        if(d3.select("#case1_btn").classed("active") && step_id>case1_step){
            clearInterval(timer);
            d3.select("#replay_play_btn").select("i").node().innerHTML = "play_arrow";

            alert(("Can't go over step: "+case1_step.toString()));
            d3.select("#board_range").property("value",xScale(case1_step));
            sliderCurrentValue = xScale(case1_step);
            frameUpdate(case1_step,true);
            

            return;

        }else if(d3.select("#case2_btn").classed("active") && step_id>case2_step){
            clearInterval(timer);
            d3.select("#replay_play_btn").select("i").node().innerHTML = "play_arrow";
            
            alert(("Can't go over step: "+case2_step.toString()));
            d3.select("#board_range").property("value",xScale(case2_step));
            sliderCurrentValue = xScale(case2_step);
            frameUpdate(case2_step,true);
            return;
        }else{
            //new added for user study
            sliderCurrentValue = xScale(step_id);

        
        // update to given step
        // update position and text of label according to slider scale
        d3.select("#board_range").property("value", xScale(step_id));

        //update current state if move by one step
        if(stepSwitch){
            // step add 1
            let cur_step = Math.round(step_id);
            if(replay_board_states[cur_step]==undefined){
                // removeBoard();
                // alert("No step "+cur_step.toString()+" being logged!");
                let stepAlert = $('<div id="step_alert_fail" class="alert alert-danger alert-dismissible fade show position-absolute top-0 end-0" role="alert" >Step '+cur_step.toString()+' Not Available<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>');
                $('#board_pan').append(stepAlert);
                // alert dismiss after 1 second
                setTimeout(() => {
                    $('#step_alert_fail').alert('close');
                  }, 1000);
                return;
            }else{
                let curImgPath = (frames_steps[cur_step]).toString() + '.png'
                
                


                let uht, urt, uot, utt, uat, player_urt_mat;
                uht = replay_board_states[cur_step][0],
                urt = replay_board_states[cur_step][1], 
                uot = replay_board_states[cur_step][2], 
                utt = replay_board_states[cur_step][3],
                uat = replay_board_states[cur_step][4];
                player_urt_mat = replay_player_urt[cur_step];

                // console.log("origin stepid",step_id);
                // console.log("cur_step id", cur_step);

                $("#frame_img").one("load", function(){
                    genBoard(uht, urt, uot, utt, uat, player_urt_mat);
                }).attr("href", path_to_frames+ curImgPath); 

                
                let max_board_step = replay_board_states.length-1;
                if(cur_step<(max_board_step-1)){
                    let curStrategyState = replayStrategyStates(cur_step);
                    $.ajax({
                        type:'POST',
                        url:'/get_local_causal',
                        data:JSON.stringify({step_id:cur_step}),
                        error: (error)=>{console.log(error);}
                    }).done((jsonRes)=>{
                        let nodes_data = jsonRes.nodes;
                        let edges_data = jsonRes.edges;
                        let effect_data = jsonRes.effect;
                        genCsGraph(nodes_data, edges_data, effect_data, curStrategyState);
                       
                    })
                }
                
            }
            d3.select("#gamestep_lbl").text(("Game Step "+ (cur_step).toString()));}
        }
    }

    replayTrack.frameUpdate = frameUpdate;
}

