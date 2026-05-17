function plot_uncertainty_map(rows_num, cols_num, uncrt_data, ba_stats, uncrt_flag){
    const atype_dct = {0:"No", 1:"Mv", 2:"Hv", 3:"Rtn", 4:"Prd", 5:"Atk"};
    d3.select(".d3-tip").remove();
    // d3.select(".legend_bar").remove();
    let tool_tip = d3.tip()
                    .attr("class", "d3-tip")
                    .offset([10, 60])
                    .html("<p>Action Stats</p><div id='tipDiv'></div>");
    d3.select("#board_svg").call(tool_tip);

     // Three function that change the tooltip when user hover / move / leave a cell
    let mouseover = function(d) {
        d3.select(this).select(".uncrt_rect")
        .attr("stroke", "black")
        .attr("opacity", 1);


        const tip_width = 140;
        const tip_height = 80;
        const margin = { left: 20, right: 5, top: 5, bottom: 20 };
        const tipsvg_width = tip_width - margin.left - margin.right;
        const tipsvg_height = tip_height - margin.top - margin.bottom;

        tool_tip.show();
        var tip_svg = d3.select("#tipDiv")
                        .append("svg")
                        .attr("width", tipsvg_width + margin.left + margin.right)
                        .attr("height", tipsvg_height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        // X axis
        let x_tip = d3.scaleBand()
                        .range([0, tipsvg_width])
                        .domain(["No", "Mv", "Hv", "Rtn", "Prd", "Atk"])
                        .padding(0.2);
        tip_svg.append("g")
        .attr("transform", "translate(0," + tipsvg_height + ")")
        .attr("class", "axis_white")
        .call(d3.axisBottom(x_tip));
        //     .attr("transform", "translate(-10,0)rotate(-45)")
        //     .style("text-anchor", "end");
        // Add Y axis
        let y_tip = d3.scaleLinear()
                    .domain([0, 10])
                    .range([ tipsvg_height, 0]);

        tip_svg.append("g")
                    .attr("class", "axis_white")
                    .call(d3.axisLeft(y_tip).ticks(5));
        // Append Bars
        tip_svg.selectAll(".act_bars")
        .data(ba_stats[+d.row][+d.col])
        .enter()
        .append("rect")
        .attr("class","act_bars")
        .attr("x", (_,i)=>x_tip(atype_dct[i]))
        .attr("y", (d)=>y_tip(+d))
        .attr("width", x_tip.bandwidth())
        .attr("height", (d)=>(tipsvg_height - y_tip(+d)))
        .attr("fill", "steelblue");

        // // State name
        // tipSVG.append("text")
        // .text(current_state)
        // .attr("x", 0)
        // .attr("y", 15)
        // .style("font-size", 18)
        // .style("font-weight", 400)

    }
    // let mousemove = function(d) {
    //     Tooltip.html(ba_stats[+d.row][+d.col])
    //     .style("left", (d3.event.pageX) + "px")
    //     .style("top", (d3.event.pageY - 28) + "px");
    // }
    let mouseout = function(d) {
        tool_tip.hide();
        d3.select(this).select(".uncrt_rect")
        .attr("stroke", "#222")
        .attr("opacity", 0.8);
    }

    d3.selectAll(".uncrtG").remove();

    for(let row=0; row<rows_num; row++){
        for(let col=0; col<cols_num; col++){
            if(uncrt_data[row][col]==-1){
                continue;
            }
            let uncrteG = d3.selectAll(".board_square").filter(function(d){
                return (d.row == row) && (d.col==col);
            }).append("g")
            .attr("class","uncrtG");

            uncrteG.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("class", "uncrt_rect")
            .attr("width", function(d) { return +d.width; })
            .attr("height", function(d) { return +d.height; })
            .attr("fill", function(){
                return uncrt_flag? d3.interpolateGnBu(+uncrt_data[row][col]): d3.interpolateOrRd(+uncrt_data[row][col])})
            .attr("stroke", "#222")
            .attr("opacity", 0.8);
            
            uncrteG.append("text")
            .attr("class", "uncrt_label")
            .text((+uncrt_data[row][col]).toFixed(2))
            .attr('x', (d)=>(+d.width/2))
            .attr('y', (d)=>(+d.height/2))
            .attr("text-anchor",'middle')
            .attr("font-size", 15)
            .attr("font-family", "sans-serif")
            .style("fill","black");

            uncrteG.on("mouseover", mouseover)
                    .on("mouseout", mouseout);



        }
    }

    /* plot legend */
    d3.selectAll(".lgd_txt").remove();
    d3.select("#um_lgd_title").remove();
    d3.selectAll(".legend_bar").exit().remove();

    d3.select("#board_svg").append("text")
    .attr("id","um_lgd_title")
    .attr("x", 0.75*(boardRect.width))             
    .attr("y", 0.1*(boardRect.height) - 15)
    .attr("text-anchor", "left")  
    .style("font-size", "1.2rem") 
    .text("Gini Index Uncertainty");

    const lgd_bar_len = 350;
    let lgd_data = d3.range(0,1,1/200);

    let y_legend = d3.scaleLinear()
    .range([(0.1*(boardRect.height) + 30), (lgd_bar_len + 0.1*(boardRect.height) + 30)])
    .domain([0,1]);
   

    d3.select("#board_svg").selectAll(".legend_bar")
    .data(lgd_data)
    .enter()
    .append("rect")
    .attr("class","legend_bar")
    .attr("x", 0.75*(boardRect.width))
    .attr("y", (d)=>+y_legend(d))
    .attr("width", 30)
    .attr("height", lgd_bar_len/lgd_data.length)
    .attr("fill", (d)=>uncrt_flag? d3.interpolateGnBu(d): d3.interpolateOrRd(d))
    .attr("stroke",(d)=>uncrt_flag? d3.interpolateGnBu(d): d3.interpolateOrRd(d));

    d3.selectAll(".legend_bar").attr("y", (d)=>+y_legend(d))
    .attr("x", 0.75*(boardRect.width))
    .attr("width", 30)
    .attr("height", lgd_bar_len/lgd_data.length)
    .attr("fill", (d)=>uncrt_flag? d3.interpolateGnBu(d): d3.interpolateOrRd(d))
    .attr("stroke",(d)=>uncrt_flag? d3.interpolateGnBu(d): d3.interpolateOrRd(d));

    // legend top text
    d3.select("#board_svg").append('text')
    .attr('x', 0.75*(boardRect.width))
    .attr('y', 0.1*(boardRect.height) + 20)
    .attr("class","lgd_txt")
    .text(function(){return uncrt_flag?"certain":"uncertain"})
    .style('fill','black')
    .style('font-size', '1rem')
    .attr("stroke","black")
    .attr("stroke-width",0.3);

    // legend bottom text
    d3.select("#board_svg").append('text')
            .attr('x', 0.75*(boardRect.width))
            .attr('y', (50 + lgd_bar_len + 0.1*(boardRect.height)))
            .attr("class","lgd_txt")
            .text(function(){return uncrt_flag?"uncertain":"certain"})
            .style('fill','black')
            .style('font-size', '1rem')
            .attr('text-anchor', 'start')
            .attr("stroke","black")
            .attr("stroke-width",0.3);



    // let feat_div = d3.select("#feat_pan").node().getBoundingClientRect();
    // const feat_margin = { top: 70, right: 50, bottom: 100, left: 50 };
    // const feat_width = feat_div.width - feat_margin.left - feat_margin.right;
    // const feat_height = feat_div.height - feat_margin.top - feat_margin.bottom;

    // if(d3.select("#feat_svg").empty()){
    //     d3.select("#feat_pan")
    //     .append("svg")
    //     .attr("id","feat_svg")
    //     .attr("width", feat_width + feat_margin.left + feat_margin.right)
    //     .attr("height", feat_height + feat_margin.top + feat_margin.bottom)
    //     .append("g")
    //     .attr("transform", "translate(" + feat_margin.left + "," + feat_margin.top + ")");

    // }
    // let x_legend = d3.scaleLinear()
    // .range([0, feat_width])
    // .domain([0,1]);

    // let leg_data = d3.range(0,1,1/200);

    // d3.selectAll(".legend_bar").exit().remove();

    // d3.select("#feat_svg").selectAll(".legend_bar")
    // .data(leg_data)
    // .enter()
    // .append("rect")
    // .attr("class","legend_bar")
    // .attr("x", (d)=>+x_legend(d))
    // .attr("y", 10)
    // .attr("width", feat_width/leg_data.length)
    // .attr("height", 20)
    // .attr("fill", (d)=>uncrt_flag? d3.interpolateGnBu(d): d3.interpolateOrRd(d))
    // .attr("stroke",(d)=>uncrt_flag? d3.interpolateGnBu(d): d3.interpolateOrRd(d));

    // d3.selectAll(".legend_bar").attr("x", (d)=>+x_legend(d))
    // .attr("y", 10)
    // .attr("width", feat_width/leg_data.length)
    // .attr("height", 20)
    // .attr("fill", (d)=>uncrt_flag? d3.interpolateGnBu(d): d3.interpolateOrRd(d))
    // .attr("stroke",(d)=>uncrt_flag? d3.interpolateGnBu(d): d3.interpolateOrRd(d));


    // d3.selectAll(".lgd_txt").remove();

    // // legend left
    // d3.select("#feat_svg").append('text')
    // .attr('x', 0)
    // .attr('y', 10)
    // .attr("class","lgd_txt")
    // .text(function(){return uncrt_flag?"certain":"uncertain"})
    // .style('fill','black')
    // .style('font-size', '1rem')
    // .attr("stroke","black")
    // .attr("stroke-width","0.5px");

    // // legend right
    // d3.select("#feat_svg").append('text')
    //         .attr('x', feat_width)
    //         .attr('y', 10)
    //         .attr("class","lgd_txt")
    //         .text(function(){return uncrt_flag?"uncertain":"certain"})
    //         .style('fill','black')
    //         .style('font-size', '1rem')
    //         .attr('text-anchor', 'end')
    //         .attr("stroke","black")
    //         .attr("stroke-width","0.5px");



    


    



    


}
