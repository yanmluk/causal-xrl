// Add menu
let items = [
    {
        label:"Add Resource",
        onClick: function(){

            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            
            let resourceG = d3.selectAll(".board_square").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
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
            .text(25)
            .attr('x', (d)=>(+d.width/2))
            .attr('y', (d)=>(+d.height/2))
            .attr("text-anchor",'middle')
            .attr("font-size", 15)
            .attr("font-family", "sans-serif")
            .style("fill","black");

            resourceG.on('contextmenu', d3.contextmenu(resource_items));


        }
    },
    {
        label:"Add Base (player1)",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            
            let baseG = d3.selectAll(".board_square").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
            }).append("g")
            .attr("class","base");
            
            baseG.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("class", "base_rect")
            .attr("width", function(d) { return +d.width; })
            .attr("height", function(d) { return +d.height; })
            .attr("fill", unit_color.base)
            .attr("stroke", "blue")
            .attr("stroke-width", "3px");

            baseG.append("text")
            .attr("class", "base_label")
            .text(5)
            .attr('x', (d)=>(+d.width/2))
            .attr('y', (d)=>(+d.height/2))
            .attr("text-anchor",'middle')
            .attr("font-size", 15)
            .attr("font-family", "sans-serif")
            .style("fill","black");

            baseG.on('contextmenu', d3.contextmenu(base_items));


        }
    },
    {
        label:"Add Base (player2)",
        onClick: function(){
            
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            
            let baseG = d3.selectAll(".board_square").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
            }).append("g")
            .attr("class","base");
            
            baseG.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("class", "base_rect")
            .attr("width", function(d) { return +d.width; })
            .attr("height", function(d) { return +d.height; })
            .attr("fill", unit_color.base)
            .attr("stroke", "red")
            .attr("stroke-width", "3px");

            baseG.append("text")
            .attr("class", "base_label")
            .text(5)
            .attr('x', (d)=>(+d.width/2))
            .attr('y', (d)=>(+d.height/2))
            .attr("text-anchor",'middle')
            .attr("font-size", 15)
            .attr("font-family", "sans-serif")
            .style("fill","black");

            baseG.on('contextmenu', d3.contextmenu(base_items));


        }
    },
    {
        label:"Add Barracks (player1)",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            
            d3.selectAll(".board_square").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
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
        }
    },
    {
        label:"Add Barracks (player2)",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            
            d3.selectAll(".board_square").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
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
        }
    },
    {
        label:"Add Worker (player1)",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            
            let workerG = d3.selectAll(".board_square").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
            }).append("g")
            .attr("class","worker");

            workerG .append("circle")
            .attr("class","worker_circle")
            .attr('cx', (d)=>(+d.width/2))
            .attr('cy', (d)=>(+d.height/2))
            .attr('r', (d)=>(d3.min([+d.width, +d.height]) * 0.3))
            .attr("fill",unit_color.worker)
            .attr("stroke","blue")
            .attr("stroke-width","2px");

            workerG.append("text")
            .attr("class", "worker_label")
            .text(0)
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
    },
    {
        label:"Add Worker (player2)",
        onClick: function(){

            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            
            let workerG = d3.selectAll(".board_square").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
            }).append("g")
            .attr("class","worker");

            workerG .append("circle")
            .attr("class","worker_circle")
            .attr('cx', (d)=>(+d.width/2))
            .attr('cy', (d)=>(+d.height/2))
            .attr('r', (d)=>(d3.min([+d.width, +d.height]) * 0.3))
            .attr("fill",unit_color.worker)
            .attr("stroke","red")
            .attr("stroke-width","2px");

            workerG.append("text")
            .attr("class", "worker_label")
            .text(0)
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
    },
    {
        label:"Add Light (player1)",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            
            d3.selectAll(".board_square").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
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
        }
    },
    {
        label:"Add Light (player2)",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            
            d3.selectAll(".board_square").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
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
            .on("mouseout",hideAttackRange);;
        }
    },
    {
        label:"Add Heavy (player1)",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            
            d3.selectAll(".board_square").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
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
        }
    },
    {
        label:"Add Heavy (player2)",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            
            d3.selectAll(".board_square").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
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
        }
    },
    {
        label:"Add Ranged (player1)",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            
            d3.selectAll(".board_square").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
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
        }
    },
    {
        label:"Add Ranged (player2)",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            
            d3.selectAll(".board_square").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
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
        }
    }

];

// Delete menu
let worker_items = [
    {
        label:"Remove Worker",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;

            // d3.select(this).selectAll(".worker").remove();
            // remove worker
            d3.selectAll(".worker").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
            }).remove();
            // remove current action
            unit_cancel_action(selected_row, selected_col);
            d3.selectAll(".attack_region").remove();
        }
    },
    {
        label:"Set Worker Resource",
        items:[{
            label:"Carry 0 Resource",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
    
                // set resource value a worker carry
                d3.selectAll(".worker_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text(0);
            }
        },
        {
            label:"Carry 1 Resource",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
    
                // set resource value a worker carry
                d3.selectAll(".worker_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text(1);
            }

        }]
    },
    {
        label:"Produce Base/Barrack",
        items:[{
            label:"Produce Base/Barrack Up",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;
                // remove produce action if any
                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();
                // draw produce action and bind the coordinate data of src unit for future cancel action
                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_bb");


                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y - (+selected_side)/2)+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("B/B")
                    .attr('x', (+selected_x + (+selected_side)/2))
                    .attr('y', (+selected_y - (+selected_side)/2))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
            }

        },
        {
            label:"Produce Base/Barrack Down",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_bb");

                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)*(3/2))+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("B/B")
                    .attr('x', (+selected_x + (+selected_side)/2))
                    .attr('y', (+selected_y + (+selected_side)*(3/2)))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
                }

        },
        {
            label:"Produce Base/Barrack Left",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_bb");

                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x - (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("B/B")
                    .attr('x', (+selected_x - (+selected_side)/2))
                    .attr('y', (+selected_y + (+selected_side)/2))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
            }

        },
        {
            label:"Produce Base/Barrack Right",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_bb");

                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)*(3/2))+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("B/B")
                    .attr('x', (+selected_x + (+selected_side)*(3/2)))
                    .attr('y', (+selected_y + (+selected_side)/2))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
            }

        }]

    },
    {
        label:"Harvest Resource",
        items:[{
            label:"Harvest Resource Up",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;
                // remove harvest action if any
                d3.selectAll(".harvest_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();
                // draw harvest action and bind the coordinate data of src unit for future cancel action
                let harvest_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","harvest_draw");


                harvest_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y - (+selected_side)/2)+"")
                    .attr("stroke","#00ff00")
                    .attr("stroke-width","1px");
            }
        },
        {
            label:"Harvest Resource Down",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove harvest action if any
                d3.selectAll(".harvest_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw harvest action and bind the coordinate data of src unit for future cancel action
                let harvest_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","harvest_draw");

                harvest_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)*(3/2))+"")
                    .attr("stroke","#00ff00")
                    .attr("stroke-width","1px");

                }
        },
        {
            label:"Harvest Resource Left",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove harvest action if any
                d3.selectAll(".harvest_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw harvest action and bind the coordinate data of src unit for future cancel action
                let harvest_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","harvest_draw");

                
                harvest_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x - (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","#00ff00")
                    .attr("stroke-width","1px");

                }

        },
        {
            label:"Harvest Resource Right",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove harvest action if any
                d3.selectAll(".harvest_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw harvest action and bind the coordinate data of src unit for future cancel action
                let harvest_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","harvest_draw");

                
                harvest_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)*(3/2))+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","#00ff00")
                    .attr("stroke-width","1px");

                }
        }]
    },
    {
        label:"Return Resource",
        items:[{
            label:"Return Resource Up",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;
                // remove return action if any
                d3.selectAll(".return_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();
                // draw return action and bind the coordinate data of src unit for future cancel action
                let return_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","return_draw");


                return_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y - (+selected_side)/2)+"")
                    .attr("stroke","#00ff00")
                    .attr("stroke-width","1px");
            }
        },
        {
            label:"Return Resource Down",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove return action if any
                d3.selectAll(".return_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw return action and bind the coordinate data of src unit for future cancel action
                let return_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","return_draw");

                return_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)*(3/2))+"")
                    .attr("stroke","#00ff00")
                    .attr("stroke-width","1px");

                }
        },
        {
            label:"Return Resource Left",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove return action if any
                d3.selectAll(".return_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw return action and bind the coordinate data of src unit for future cancel action
                let return_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","return_draw");

                
                return_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x - (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","#00ff00")
                    .attr("stroke-width","1px");

                }

        },
        {
            label:"Return Resource Right",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove return action if any
                d3.selectAll(".return_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw return action and bind the coordinate data of src unit for future cancel action
                let return_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","return_draw");

                
                return_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)*(3/2))+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","#00ff00")
                    .attr("stroke-width","1px");

                }
        }]
    },
    {
        label:"Attack",
        items:[{
            label:"Attack Up",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;
                // remove attack action if any
                d3.selectAll(".attack_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();
                // draw attack action and bind the coordinate data of src unit for future cancel action
                let attack_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","attack_draw");


                attack_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y - (+selected_side)/2)+"")
                    .attr("stroke","red")
                    .attr("stroke-width","1px");
            }
        },
        {
            label:"Attack Down",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove attack action if any
                d3.selectAll(".attack_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw attack action and bind the coordinate data of src unit for future cancel action
                let attack_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","attack_draw");

                attack_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)*(3/2))+"")
                    .attr("stroke","red")
                    .attr("stroke-width","1px");

                }
        },
        {
            label:"Attack Left",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove attack action if any
                d3.selectAll(".attack_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw attack action and bind the coordinate data of src unit for future cancel action
                let attack_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","attack_draw");

                
                attack_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x - (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","red")
                    .attr("stroke-width","1px");

                }

        },
        {
            label:"Attack Right",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove attack action if any
                d3.selectAll(".attack_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw attack action and bind the coordinate data of src unit for future cancel action
                let attack_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","attack_draw");

                
                attack_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)*(3/2))+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","red")
                    .attr("stroke-width","1px");

                }
        }]
    },
    {
        label:"Move",
        items:[{
            label:"Move Up",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;
                // remove move action if any
                d3.selectAll(".move_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();
                // draw move action and bind the coordinate data of src unit for future cancel action
                let move_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","move_draw");


                move_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y - (+selected_side)/2)+"")
                    .attr("stroke","#808080")
                    .attr("stroke-width","1px");
            }
        },
        {
            label:"Move Down",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove move action if any
                d3.selectAll(".move_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw move action and bind the coordinate data of src unit for future cancel action
                let move_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","move_draw");

                move_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)*(3/2))+"")
                    .attr("stroke","#808080")
                    .attr("stroke-width","1px");

                }
        },
        {
            label:"Move Left",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove move action if any
                d3.selectAll(".move_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw move action and bind the coordinate data of src unit for future cancel action
                let move_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","move_draw");

                
                move_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x - (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","#808080")
                    .attr("stroke-width","1px");

                }

        },
        {
            label:"Move Right",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove move action if any
                d3.selectAll(".move_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw move action and bind the coordinate data of src unit for future cancel action
                let move_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","move_draw");

                
                move_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)*(3/2))+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","#808080")
                    .attr("stroke-width","1px");

                }
        }
            
        ]
    },
    {
        label:"Cancel Action",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            unit_cancel_action(selected_row,selected_col);
        }
    },{
        label:"Counterfactual steps",
        onClick: function(){
            let selected_row = +d3.select(this).data()[0].row;
            let selected_col = +d3.select(this).data()[0].col;
            ctf_unit_row = selected_row;
            ctf_unit_col = selected_col;


            if(d3.select("#unit_pos_label").empty()){
                d3.select("#unitctfstps_modal_body").insert("label", "#ctfstps_modal_label")
                .attr("id","unit_pos_label")
                .text("For the worker at ("+ctf_unit_row+","+ctf_unit_col+") \u2007");
                d3.select("#unitctfstps_modal_body").insert("br", "#ctfstps_modal_label");
            }else{
                d3.select("#unit_pos_label").text("For the worker at ("+ctf_unit_row+","+ctf_unit_col+") \u2007");

            }
            unitctfstpsModal.show();

        }
    },{
        label:"Intention Evaluation",
        onClick: function(){
            let selected_row = +d3.select(this).data()[0].row;
            let selected_col = +d3.select(this).data()[0].col;
            ctf_unit_row = selected_row;
            ctf_unit_col = selected_col;

            unit_intention_eval();

        }

    }
];

let resource_items = [
    {
        label:"Remove Resource",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;

            // remove resource
            d3.selectAll(".resource").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
            }).remove();
        }
    },
    {
        label:"Set Resource Value",
        items:[{
            label:"0",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
    
                d3.selectAll(".resource_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text(0);
            }
        },
        {
            label:"+1",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;

                let rsc_num = d3.selectAll(".resource_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text();
                rsc_num = parseInt(rsc_num);
                // increase by 1 resource
                rsc_num += 1;
    
                d3.selectAll(".resource_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text(rsc_num);
            }

        },
        {
            label:"-1",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;

                let rsc_num = d3.selectAll(".resource_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text();
                rsc_num = parseInt(rsc_num);
                // decrease by 1 resource
                rsc_num -= 1;
    
                d3.selectAll(".resource_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text(rsc_num);
            }

        },
        {
            label:"+10",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;

                let rsc_num = d3.selectAll(".resource_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text();
                rsc_num = parseInt(rsc_num);
                // increase by 10 resource
                rsc_num += 10;
    
                d3.selectAll(".resource_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text(rsc_num);
            }

        },
        {
            label:"-10",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;

                let rsc_num = d3.selectAll(".resource_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text();
                rsc_num = parseInt(rsc_num);
                // decrease by 10 resource
                rsc_num -= 10;
    
                d3.selectAll(".resource_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text(rsc_num);
            }

        }]
    }
];

let base_items = [
    {
        label:"Remove Base",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;

            // remove base
            d3.selectAll(".base").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
            }).remove();
            // remove current action
            unit_cancel_action(selected_row, selected_col);
        }
    },
    {
        label:"Set Base Resource",
        items:[{
            label:"0",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
    
                d3.selectAll(".base_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text(0);
            }
        },
        {
            label:"+1",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;

                let rsc_num = d3.selectAll(".base_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text();
                rsc_num = parseInt(rsc_num);
                // increase by 1 resource
                rsc_num += 1;
    
                d3.selectAll(".base_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text(rsc_num);
            }

        },
        {
            label:"-1",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;

                let rsc_num = d3.selectAll(".base_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text();
                rsc_num = parseInt(rsc_num);
                // decrease by 1 resource
                rsc_num -= 1;
    
                d3.selectAll(".base_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text(rsc_num);
            }

        },
        {
            label:"+10",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;

                let rsc_num = d3.selectAll(".base_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text();
                rsc_num = parseInt(rsc_num);
                // increase by 10 resource
                rsc_num += 10;
    
                d3.selectAll(".base_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text(rsc_num);
            }

        },
        {
            label:"-10",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;

                let rsc_num = d3.selectAll(".base_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text();
                rsc_num = parseInt(rsc_num);
                // decrease by 10 resource
                rsc_num -= 10;
    
                d3.selectAll(".base_label").filter(function(d){
                    return (d.row == selected_row) && (d.col==selected_col);
                }).text(rsc_num);
            }

        }]
    },
    {
        label:"Produce Worker",
        items:[{
            label:"Produce Worker Up",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;
                // remove produce action if any
                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();
                // draw produce action and bind the coordinate data of src unit for future cancel action
                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_worker");


                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y - (+selected_side)/2)+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("Worker")
                    .attr('x', (+selected_x + (+selected_side)/2))
                    .attr('y', (+selected_y - (+selected_side)/2))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
            }

        },
        {
            label:"Produce Worker Down",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_worker");

                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)*(3/2))+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("Worker")
                    .attr('x', (+selected_x + (+selected_side)/2))
                    .attr('y', (+selected_y + (+selected_side)*(3/2)))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
                }

        },
        {
            label:"Produce Worker Left",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_worker");

                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x - (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("Worker")
                    .attr('x', (+selected_x - (+selected_side)/2))
                    .attr('y', (+selected_y + (+selected_side)/2))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
            }

        },
        {
            label:"Produce Worker Right",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_worker");

                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)*(3/2))+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("Worker")
                    .attr('x', (+selected_x + (+selected_side)*(3/2)))
                    .attr('y', (+selected_y + (+selected_side)/2))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
            }

        }]

    },
    {
        label:"Cancel Action",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            unit_cancel_action(selected_row,selected_col);
        }
    }
];

let barrack_items = [
    {
        label:"Remove Barracks",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;

            // remove barrack
            d3.selectAll(".barrack").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
            }).remove();
            //remove current action
            unit_cancel_action(selected_row, selected_col);
        }
    },
    {
        label:"Produce Light",
        items:[{
            label:"Produce Light Up",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;
                // remove produce action if any
                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();
                // draw produce action and bind the coordinate data of src unit for future cancel action
                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_light");


                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y - (+selected_side)/2)+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("Light")
                    .attr('x', (+selected_x + (+selected_side)/2))
                    .attr('y', (+selected_y - (+selected_side)/2))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
            }
        },
        {
            label:"Produce Light Down",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_light");

                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)*(3/2))+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("Light")
                    .attr('x', (+selected_x + (+selected_side)/2))
                    .attr('y', (+selected_y + (+selected_side)*(3/2)))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
                }

        },
        {
            label:"Produce Light Left",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_light");

                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x - (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("Light")
                    .attr('x', (+selected_x - (+selected_side)/2))
                    .attr('y', (+selected_y + (+selected_side)/2))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
            }
        },
        {
            label:"Produce Light Right",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_light");

                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)*(3/2))+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("Light")
                    .attr('x', (+selected_x + (+selected_side)*(3/2)))
                    .attr('y', (+selected_y + (+selected_side)/2))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
            }
        }]
    },
    {
        label:"Produce Heavy",
        items:[{
            label:"Produce Heavy Up",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;
                // remove produce action if any
                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();
                // draw produce action and bind the coordinate data of src unit for future cancel action
                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_heavy");


                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y - (+selected_side)/2)+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("Heavy")
                    .attr('x', (+selected_x + (+selected_side)/2))
                    .attr('y', (+selected_y - (+selected_side)/2))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
            }
        },
        {
            label:"Produce Heavy Down",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_heavy");

                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)*(3/2))+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("Heavy")
                    .attr('x', (+selected_x + (+selected_side)/2))
                    .attr('y', (+selected_y + (+selected_side)*(3/2)))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
                }

        },
        {
            label:"Produce Heavy Left",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_heavy");

                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x - (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("Heavy")
                    .attr('x', (+selected_x - (+selected_side)/2))
                    .attr('y', (+selected_y + (+selected_side)/2))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
            }
        },
        {
            label:"Produce Heavy Right",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_heavy");

                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)*(3/2))+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("Heavy")
                    .attr('x', (+selected_x + (+selected_side)*(3/2)))
                    .attr('y', (+selected_y + (+selected_side)/2))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
            }
        }]
    },
    {
        label:"Produce Ranged",
        items:[{
            label:"Produce Ranged Up",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;
                // remove produce action if any
                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();
                // draw produce action and bind the coordinate data of src unit for future cancel action
                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_ranged");


                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y - (+selected_side)/2)+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("Ranged")
                    .attr('x', (+selected_x + (+selected_side)/2))
                    .attr('y', (+selected_y - (+selected_side)/2))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
            }
        },
        {
            label:"Produce Ranged Down",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_ranged");

                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)*(3/2))+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("Ranged")
                    .attr('x', (+selected_x + (+selected_side)/2))
                    .attr('y', (+selected_y + (+selected_side)*(3/2)))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
                }

        },
        {
            label:"Produce Ranged Left",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_ranged");

                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x - (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("Ranged")
                    .attr('x', (+selected_x - (+selected_side)/2))
                    .attr('y', (+selected_y + (+selected_side)/2))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
            }
        },
        {
            label:"Produce Ranged Right",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                d3.selectAll(".produce_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                let produce_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","produce_draw produce_ranged");

                produce_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)*(3/2))+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","blue")
                    .attr("stroke-width","1px");

                produce_g.append("text")
                    .text("Ranged")
                    .attr('x', (+selected_x + (+selected_side)*(3/2)))
                    .attr('y', (+selected_y + (+selected_side)/2))
                    .attr("text-anchor",'middle')
                    .attr("font-size", 12)
                    .attr("font-family", "sans-serif")
                    .style("fill","blue");
            }
        }]
    },
    {
        label:"Cancel Action",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            unit_cancel_action(selected_row,selected_col);
        }
    }
];

let light_items = [
    {
        label:"Remove Light",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;

            // remove light
            d3.selectAll(".light").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
            }).remove();
            // remove current action
            unit_cancel_action(selected_row, selected_col);
            d3.selectAll(".attack_region").remove();
        }
    },
    {
        label:"Attack",
        items:[{
            label:"Attack Up",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;
                // remove attack action if any
                d3.selectAll(".attack_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();
                // draw attack action and bind the coordinate data of src unit for future cancel action
                let attack_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","attack_draw");


                attack_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y - (+selected_side)/2)+"")
                    .attr("stroke","red")
                    .attr("stroke-width","1px");
            }
        },
        {
            label:"Attack Down",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove attack action if any
                d3.selectAll(".attack_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw attack action and bind the coordinate data of src unit for future cancel action
                let attack_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","attack_draw");

                attack_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)*(3/2))+"")
                    .attr("stroke","red")
                    .attr("stroke-width","1px");

                }
        },
        {
            label:"Attack Left",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove attack action if any
                d3.selectAll(".attack_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw attack action and bind the coordinate data of src unit for future cancel action
                let attack_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","attack_draw");

                
                attack_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x - (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","red")
                    .attr("stroke-width","1px");

                }

        },
        {
            label:"Attack Right",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove attack action if any
                d3.selectAll(".attack_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw attack action and bind the coordinate data of src unit for future cancel action
                let attack_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","attack_draw");

                
                attack_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)*(3/2))+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","red")
                    .attr("stroke-width","1px");

                }
        }]
    },
    {
        label:"Move",
        items:[{
            label:"Move Up",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;
                // remove move action if any
                d3.selectAll(".move_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();
                // draw move action and bind the coordinate data of src unit for future cancel action
                let move_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","move_draw");


                move_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y - (+selected_side)/2)+"")
                    .attr("stroke","#808080")
                    .attr("stroke-width","1px");
            }
        },
        {
            label:"Move Down",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove move action if any
                d3.selectAll(".move_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw move action and bind the coordinate data of src unit for future cancel action
                let move_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","move_draw");

                move_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)*(3/2))+"")
                    .attr("stroke","#808080")
                    .attr("stroke-width","1px");

                }
        },
        {
            label:"Move Left",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove move action if any
                d3.selectAll(".move_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw move action and bind the coordinate data of src unit for future cancel action
                let move_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","move_draw");

                
                move_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x - (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","#808080")
                    .attr("stroke-width","1px");

                }

        },
        {
            label:"Move Right",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove move action if any
                d3.selectAll(".move_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw move action and bind the coordinate data of src unit for future cancel action
                let move_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","move_draw");

                
                move_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)*(3/2))+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","#808080")
                    .attr("stroke-width","1px");

                }
        }
            
        ]
    },
    {
        label:"Cancel Action",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            unit_cancel_action(selected_row,selected_col);
        }
    },
    {
        label:"Counterfactual steps",
        onClick: function(){
            let selected_row = +d3.select(this).data()[0].row;
            let selected_col = +d3.select(this).data()[0].col;
            ctf_unit_row = selected_row;
            ctf_unit_col = selected_col;


            if(d3.select("#unit_pos_label").empty()){
                d3.select("#unitctfstps_modal_body").insert("label", "#ctfstps_modal_label")
                .attr("id","unit_pos_label")
                .text("For the light at ("+ctf_unit_row+","+ctf_unit_col+") \u2007");
                d3.select("#unitctfstps_modal_body").insert("br", "#ctfstps_modal_label");
            }else{
                d3.select("#unit_pos_label").text("For the light at ("+ctf_unit_row+","+ctf_unit_col+") \u2007");

            }
            unitctfstpsModal.show();

        }
    },{
        label:"Intention Evaluation",
        onClick: function(){
            let selected_row = +d3.select(this).data()[0].row;
            let selected_col = +d3.select(this).data()[0].col;
            ctf_unit_row = selected_row;
            ctf_unit_col = selected_col;

            unit_intention_eval();

        }

    }
];

let heavy_items = [
    {
        label:"Remove Heavy",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;

            // remove heavy
            d3.selectAll(".heavy").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
            }).remove();
            // remove current action
            unit_cancel_action(selected_row, selected_col);
            d3.selectAll(".attack_region").remove();
        }
    },
    {
        label:"Attack",
        items:[{
            label:"Attack Up",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;
                // remove attack action if any
                d3.selectAll(".attack_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();
                // draw attack action and bind the coordinate data of src unit for future cancel action
                let attack_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","attack_draw");


                attack_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y - (+selected_side)/2)+"")
                    .attr("stroke","red")
                    .attr("stroke-width","1px");
            }
        },
        {
            label:"Attack Down",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove attack action if any
                d3.selectAll(".attack_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw attack action and bind the coordinate data of src unit for future cancel action
                let attack_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","attack_draw");

                attack_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)*(3/2))+"")
                    .attr("stroke","red")
                    .attr("stroke-width","1px");

                }
        },
        {
            label:"Attack Left",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove attack action if any
                d3.selectAll(".attack_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw attack action and bind the coordinate data of src unit for future cancel action
                let attack_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","attack_draw");

                
                attack_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x - (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","red")
                    .attr("stroke-width","1px");

                }

        },
        {
            label:"Attack Right",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove attack action if any
                d3.selectAll(".attack_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw attack action and bind the coordinate data of src unit for future cancel action
                let attack_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","attack_draw");

                
                attack_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)*(3/2))+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","red")
                    .attr("stroke-width","1px");

                }
        }]
    },
    {
        label:"Move",
        items:[{
            label:"Move Up",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;
                // remove move action if any
                d3.selectAll(".move_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();
                // draw move action and bind the coordinate data of src unit for future cancel action
                let move_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","move_draw");


                move_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y - (+selected_side)/2)+"")
                    .attr("stroke","#808080")
                    .attr("stroke-width","1px");
            }
        },
        {
            label:"Move Down",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove move action if any
                d3.selectAll(".move_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw move action and bind the coordinate data of src unit for future cancel action
                let move_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","move_draw");

                move_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)*(3/2))+"")
                    .attr("stroke","#808080")
                    .attr("stroke-width","1px");

                }
        },
        {
            label:"Move Left",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove move action if any
                d3.selectAll(".move_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw move action and bind the coordinate data of src unit for future cancel action
                let move_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","move_draw");

                
                move_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x - (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","#808080")
                    .attr("stroke-width","1px");

                }

        },
        {
            label:"Move Right",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove move action if any
                d3.selectAll(".move_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw move action and bind the coordinate data of src unit for future cancel action
                let move_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","move_draw");

                
                move_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)*(3/2))+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","#808080")
                    .attr("stroke-width","1px");

                }
        }
            
        ]
    },
    {
        label:"Cancel Action",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            unit_cancel_action(selected_row,selected_col);
        }
    },
    {
        label:"Counterfactual steps",
        onClick: function(){
            let selected_row = +d3.select(this).data()[0].row;
            let selected_col = +d3.select(this).data()[0].col;
            ctf_unit_row = selected_row;
            ctf_unit_col = selected_col;


            if(d3.select("#unit_pos_label").empty()){
                d3.select("#unitctfstps_modal_body").insert("label", "#ctfstps_modal_label")
                .attr("id","unit_pos_label")
                .text("For the heavy at ("+ctf_unit_row+","+ctf_unit_col+") \u2007");
                d3.select("#unitctfstps_modal_body").insert("br", "#ctfstps_modal_label");
            }else{
                d3.select("#unit_pos_label").text("For the heavy at ("+ctf_unit_row+","+ctf_unit_col+") \u2007");

            }
            unitctfstpsModal.show();

        }
    },{
        label:"Intention Evaluation",
        onClick: function(){
            let selected_row = +d3.select(this).data()[0].row;
            let selected_col = +d3.select(this).data()[0].col;
            ctf_unit_row = selected_row;
            ctf_unit_col = selected_col;

            unit_intention_eval();

        }

    }
];

let ranged_items = [
    {
        label:"Remove Ranged",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;

            // remove ranged
            d3.selectAll(".ranged").filter(function(d){
                return (d.row == selected_row) && (d.col==selected_col);
            }).remove();
            // remove current action
            unit_cancel_action(selected_row, selected_col);
            d3.selectAll(".attack_region").remove();
        }
    },
    {
        label:"Attack within range 3",
        onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;
                // remove attack action if any
                d3.selectAll(".attack_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();
                // draw attack action and bind the coordinate data of src unit for future cancel action
                let attack_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","attack_draw");


                attack_g.append("circle")
                    .attr("cx",(+selected_x + (+selected_side)/2))
                    .attr("cy",(+selected_y + (+selected_side)/2))
                    .attr("r",4)
                    .attr("fill","red")
                    .attr("stroke","none");
            }
    },
    {
        label:"Move",
        items:[{
            label:"Move Up",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;
                // remove move action if any
                d3.selectAll(".move_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();
                // draw move action and bind the coordinate data of src unit for future cancel action
                let move_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","move_draw");


                move_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y - (+selected_side)/2)+"")
                    .attr("stroke","#808080")
                    .attr("stroke-width","1px");
            }
        },
        {
            label:"Move Down",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove move action if any
                d3.selectAll(".move_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw move action and bind the coordinate data of src unit for future cancel action
                let move_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","move_draw");

                move_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)*(3/2))+"")
                    .attr("stroke","#808080")
                    .attr("stroke-width","1px");

                }
        },
        {
            label:"Move Left",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove move action if any
                d3.selectAll(".move_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw move action and bind the coordinate data of src unit for future cancel action
                let move_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","move_draw");

                
                move_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x - (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","#808080")
                    .attr("stroke-width","1px");

                }

        },
        {
            label:"Move Right",
            onClick: function(){
                let selected_row = d3.select(this).data()[0].row;
                let selected_col = d3.select(this).data()[0].col;
                let selected_x = d3.select(this).data()[0].x;
                let selected_y = d3.select(this).data()[0].y;
                let selected_side = d3.select(this).data()[0].width;

                // remove move action if any
                d3.selectAll(".move_draw").filter(function(d){
                    return( d.row == selected_row) && (d.col==selected_col);
                }).remove();

                // draw move action and bind the coordinate data of src unit for future cancel action
                let move_g = d3.select("#board_g")
                                .append("g")
                                .data([{row:selected_row, col:selected_col}])
                                .attr("class","move_draw");

                
                move_g.append("path")
                    .attr("d","M"+(+selected_x + (+selected_side)/2)+","+(+selected_y + (+selected_side)/2)+"L"+(+selected_x + (+selected_side)*(3/2))+","+(+selected_y + (+selected_side)/2)+"")
                    .attr("stroke","#808080")
                    .attr("stroke-width","1px");

                }
        }
            
        ]
    },
    {
        label:"Cancel Action",
        onClick: function(){
            let selected_row = d3.select(this).data()[0].row;
            let selected_col = d3.select(this).data()[0].col;
            unit_cancel_action(selected_row,selected_col);
        }
    },
    {
        label:"Counterfactual steps",
        onClick: function(){
            let selected_row = +d3.select(this).data()[0].row;
            let selected_col = +d3.select(this).data()[0].col;
            ctf_unit_row = selected_row;
            ctf_unit_col = selected_col;


            if(d3.select("#unit_pos_label").empty()){
                d3.select("#unitctfstps_modal_body").insert("label", "#ctfstps_modal_label")
                .attr("id","unit_pos_label")
                .text("For the ranged at ("+ctf_unit_row+","+ctf_unit_col+") \u2007");
                d3.select("#unitctfstps_modal_body").insert("br", "#ctfstps_modal_label");
            }else{
                d3.select("#unit_pos_label").text("For the ranged at ("+ctf_unit_row+","+ctf_unit_col+") \u2007");

            }
            unitctfstpsModal.show();

        }
    },{
        label:"Intention Evaluation",
        onClick: function(){
            let selected_row = +d3.select(this).data()[0].row;
            let selected_col = +d3.select(this).data()[0].col;
            ctf_unit_row = selected_row;
            ctf_unit_col = selected_col;

            unit_intention_eval();

        }

    }
];