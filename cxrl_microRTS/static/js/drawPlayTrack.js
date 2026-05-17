function drawPlayTrack(step_max){
    if(!d3.select("#view_pan_svg").empty()){
        d3.select("#view_pan_svg").remove();
    }
    const step_min = 0;

    let view_pan_div = d3.select('#view_pan').node().getBoundingClientRect();
    const view_pan_margin = { top: 30, right: 50, bottom: 50, left: 50 },
    view_pan_width  = view_pan_div.width - view_pan_margin.left - view_pan_margin.right,
    view_pan_height = view_pan_div.height - view_pan_margin.top  - view_pan_margin.bottom;

    let view_pan_svg = d3.select('#view_pan')
                .append("svg")
                .attr("id","view_pan_svg")
                .attr("width",  view_pan_div.width)
                .attr("height", view_pan_div.height*0.2);

    let currentValue = 0;
    var targetValue = view_pan_width;

    let playButton = d3.select("#play-pause-button");

    let xSlide = d3.scaleLinear()
                .domain([step_min, step_max])
                .range([0, targetValue])
                .clamp(true);
    //---- slider ----//
    let slider = view_pan_svg.append("g")
                    .attr("class", "slider")
                    .attr("transform", "translate(" + view_pan_margin.left + "," + (view_pan_margin.top) + ")");
    // slider bar
    slider.append("line")
        .attr("class", "track")
        .attr("x1", xSlide.range()[0])
        .attr("x2", xSlide.range()[1])
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-inset")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function() { slider.interrupt(); })
            .on("start drag", function() {
            $('#play_intv_switch').bootstrapToggle('on');
            currentValue = d3.event.x;
            frameUpdate(xSlide.invert(currentValue), true); 
            })
        );
    // ticks
    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(xSlide.ticks(step_max<10?step_max:10))
        .enter()
        .append("text")
        .attr("x", xSlide)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text((d) => d);

    // slider dot
    let handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);

    //---- play animation ----//
    //play frames
    var playSwitch = false;              
    playButton.on("click", function() {
        $('#play_intv_switch').bootstrapToggle('on');
        if (playSwitch) {
            //if currently playing
            clearInterval(timer);
            //update current info
            frameUpdate(xSlide.invert(currentValue), true);
            d3.select(this).select("i").node().innerHTML = "play_arrow";
            playSwitch = !playSwitch;
        } else {
            //if currently stopped
            timer = setInterval(frameStep, 200);
            d3.select(this).select("i").node().innerHTML = "pause";
            playSwitch = !playSwitch;
        }
        });
    // frame go forward by one step
    d3.select('#next-step-button').on("click", function(){
        $('#play_intv_switch').bootstrapToggle('on');
        if (playSwitch) {
            clearInterval(timer);
            // d3.select(this).select("i").node().innerHTML = "play_arrow";
            d3.select("#play-pause-button").select("i").node().innerHTML = "play_arrow";
            playSwitch = !playSwitch;
        }
        // frameUpdate(xSlide.invert(currentValue), true);
        // console.log("currentValue_nxt1", currentValue);
        currentValue = currentValue + (targetValue/(step_max - step_min));
        // console.log("currentValue_nxt2", currentValue);
        if (currentValue > targetValue) {
            currentValue = 0;
        }
        frameUpdate(xSlide.invert(currentValue), true);
    });
    // frame go backward by one step
    d3.select('#prev-step-button').on("click", function(){
        $('#play_intv_switch').bootstrapToggle('on');
        if (playSwitch) {
            clearInterval(timer);
            // d3.select(this).select("i").node().innerHTML = "play_arrow";
            d3.select("#play-pause-button").select("i").node().innerHTML = "play_arrow";
            playSwitch = !playSwitch;
        }
        // frameUpdate(xSlide.invert(currentValue), true);
        // console.log("currentValue_prv1", currentValue);
        currentValue = currentValue - (targetValue/(step_max - step_min));
        // console.log("currentValue_prv2", currentValue);
        if (currentValue < 0) {
            currentValue = 0;
        }
        frameUpdate(xSlide.invert(currentValue), true);
    });

    function frameStep() {
        // frame step forward
        frameUpdate(xSlide.invert(currentValue), true);
        currentValue = currentValue + (targetValue/(step_max - step_min));
        if (currentValue > targetValue) {
            currentValue = 0;
            clearInterval(timer);
            // timer = 0;
            // d3.select(this).select("i").node().innerHTML = "play_arrow";
            d3.select("#play-pause-button").select("i").node().innerHTML = "play_arrow";
        }
    }
    function frameUpdate(step_id,stepSwitch) {
        // update to given step
        // update position and text of label according to slider scale
        handle.attr("cx", xSlide(step_id));
        //update barchart & current state if move by one step
        if(stepSwitch){

            console.log("play_intv_switch:", d3.select('#play_intv_switch').property('checked'));

            // step add 1
            let cur_step = Math.round(step_id);
            if(unitctf_boardstates_log[cur_step]==undefined){
                // removeBoard();
                // alert("No step "+cur_step.toString()+" being logged!");
                let stepAlert = $('<div id="ctfstep_alert_fail" class="alert alert-danger alert-dismissible fade show position-absolute top-0 end-0" role="alert" >Step '+cur_step.toString()+' Not Available<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>');
                $('#board_pan').append(stepAlert);
                // alert dismiss after 1 second
                setTimeout(() => {
                    $('#ctfstep_alert_fail').alert('close');
                  }, 1000);
                return;
            }else{
                let uht, urt, uot, utt, uat, player_urt_mat;
                uht = unitctf_boardstates_log[cur_step][0],
                urt = unitctf_boardstates_log[cur_step][1], 
                uot = unitctf_boardstates_log[cur_step][2], 
                utt = unitctf_boardstates_log[cur_step][3],
                uat = unitctf_boardstates_log[cur_step][4];
                player_urt_mat = unitctf_player_urt_log[cur_step];

                console.log("origin stepid",step_id);
                console.log("cur_step id", cur_step);
                genBoard(uht, urt, uot, utt, uat, player_urt_mat);

                if(cur_step==unit_max_gamestep){
                    drawAction(unit_current_action);
                }
            }

            d3.select("#unit_step_lbl").text((cur_step).toString());

            // console.log("step id", Math.round(step_id));
        }
        }

}

