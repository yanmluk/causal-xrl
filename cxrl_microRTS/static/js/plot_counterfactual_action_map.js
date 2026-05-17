function plot_counterfactual_action_map(rows_num, cols_num, board_actions, board_action_drct, board_action_prdc_obj, board_action_atk_row,board_action_atk_col, uncrt_flag=true){
    const atype_dct = {0:"No", 1:"Mv", 2:"Hv", 3:"Rtn", 4:"Prd", 5:"Atk"};
    const ut_dct = {0:'Rs', 1:'Bs', 2:'Bk', 3:'Wk', 4:'Lt', 5:'Hv', 6:'Rg'};
    const action_colors = ["#866e73","#861e5b", "#a35612", "#1263a1", "#f6a880", "#e33641"];
    let color_scale = d3.scaleOrdinal(d3.schemeTableau10);
    // create arrow svg
    d3.select("#board_svg")
    .append('svg:defs')
    .attr("class", "arrow_cam")
    .append('svg:marker')
    .attr('id', 'arrow_cam')
    .attr('viewBox',  '0 -5 20 20' )
    .attr('markerWidth', 8)
    .attr('markerHeight', 8)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .style("fill", "white")
    .attr("opacity", 1);


    d3.selectAll(".actionG").remove();

    for(let row=0; row<rows_num; row++){
        for(let col=0; col<cols_num; col++){
            if(board_actions[row][col]==-1){
                // taken cell
                continue;
            }
            let actionG = d3.selectAll(".board_square").filter(function(d){
                return (d.row == row) && (d.col==col);
            }).append("g")
            .attr("class","actionG");

            actionG.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("class", "action_rect")
            .attr("width", function(d) { return +d.width; })
            .attr("height", function(d) { return +d.height; })
            .attr("fill", action_colors[+board_actions[row][col]])
            .attr("stroke", "#222")
            .attr("opacity", 1);

            let arrow_line = function(d){
                let line_;
                switch(board_action_drct[row][col]){
                    case 0:
                        //north
                        line_ = d3.line()([[(+d.width)/2, 0.7*(+d.height)], [(+d.width)/2, 0.35*(+d.height)]]);
                        break;
                    case 1:
                        //east
                        line_ = d3.line()([[0.2*(+d.width), (+d.height)/2], [0.6*(+d.width), (+d.height)/2]]);
                        break;
                    case 2:
                        //south
                        line_ = d3.line()([[(+d.width)/2, 0.2*(+d.height)], [(+d.width)/2, 0.6*(+d.height)]]);
                        break;
                    case 3:
                        //west
                        line_ = d3.line()([[0.7*(+d.width), (+d.height)/2], [0.35*(+d.width), (+d.height)/2]]);
                        break;
                    default:
                        line_ = null;

                }
                return line_;
                
                }

            let produce_param_text = function(){
                    if(board_actions[row][col]==4){
                        //if produce
                        return ut_dct[(board_action_prdc_obj[row][col])];
                    }else{
                        return null;
                    }
            }
            
            let attack_param_text = function(){
                if(board_actions[row][col]==5){
                    //if attack
                    return '(' + (board_action_atk_row[row][col]).toString() +',' + board_action_atk_col[row][col].toString() + ')';
                }else{
                    return null;
                }
            }


            // produce param text
            actionG.append("text")
            .attr("class", "action_param_label")
            .text(produce_param_text())
            .attr('x', (d)=>(+d.width/2))
            .attr('y', (d)=>(+d.height/2))
            .attr("text-anchor",'middle')
            .attr("font-size", 15)
            .attr("font-family", "sans-serif")
            .style("fill","black");

            // attack param text
            actionG.append("text")
            .attr("class", "action_param_label")
            .text(attack_param_text())
            .attr('x', (d)=>(+d.width/2))
            .attr('y', (d)=>(+d.height/2))
            .attr("text-anchor",'middle')
            .attr("font-size", 12)
            .attr("font-weight", 600)
            .attr("font-family", "sans-serif")
            .style("fill","black");
            
            // action direction line
            actionG.append("path")
            .attr("class", "cell_arrow_line")
            .attr('marker-end','url(#arrow_cam)')
            .attr("d", (d)=>arrow_line(d))
            .attr("stroke", "white")
            .style("stroke-opacity", 1)
            .attr("stroke-width","2px")
            .style("fill","none")
            .style("cursor", "default");

            //  // action direction arrowhead
            //  actionG.append("path")
            //  .attr("class", "cell_arrow_head")
            //  .attr('marker-end','url(#arrow_cam)')
            //  .attr("d", (d)=>arrow_line(d))
            //  .style("fill","none")
            //  .style("cursor", "default");
            


        }
    }

    /* plot legend */
    d3.select("#board_svg").selectAll(".sqr_action").remove();
    d3.select("#board_svg").selectAll(".sqr_lb_action").remove();
    d3.select("#act_lgd_title").remove();

    d3.select("#board_svg").append("text")
    .attr("id","act_lgd_title")
    .attr("x", 0.75*(boardRect.width))             
    .attr("y", 0.1*(boardRect.height) - 15)
    .attr("text-anchor", "left")  
    .style("font-size", "1.2rem") 
    .text("Action Type");

    const action_type_labels = ["None", "Move", "Harvest", "Return", "Produce", "Attack"];
    const sqr_size = 30;
    d3.select("#board_svg").selectAll(".sqr_action")
     .data(action_type_labels)
     .enter()
     .append("rect")
     .attr("class","sqr_action")
     .attr("x", 0.75*(boardRect.width))
     .attr("y", function(_,i){ return (i*(sqr_size+5) + 0.1*(boardRect.height))})
     .attr("width", sqr_size)
     .attr("height", sqr_size)
     .style("fill", function(_,i){ return action_colors[i]})
     .attr("stroke", "black")
     .attr("stroke-width", 1.5);
 
     d3.select("#board_svg").selectAll(".sqr_lb_action")
     .data(action_type_labels)
     .enter()
     .append("text")
         .attr("class", "sqr_lb_action")
         .attr("x", 0.75*(boardRect.width) + 20 + sqr_size*1.2)
         .attr("y", function(_,i){ return (i*(sqr_size+5) + (sqr_size/2) + 0.1*(boardRect.height))})
         .style("fill", "black")
         .style("stroke", "black")
         .style("stroke-width", 0.3)
         .text(function(d){ return d})
         .attr("text-anchor", "left")
         .style("alignment-baseline", "middle");

}
